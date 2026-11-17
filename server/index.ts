import "dotenv/config";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 4000);
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"];
    if (allowed.includes(file.mimetype)) callback(null, true);
    else callback(new Error("Only JPG, PNG, WebP, MP4, and WebM files are accepted."));
  },
});
function receiveMedia(req: Request, res: Response, next: NextFunction) {
  mediaUpload.single("file")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      res.status(400).json({ message: "Media upload exceeded the file limit." });
      return;
    }
    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next();
  });
}
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
});
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please try again later." },
});

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(2000),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});
const mediaReference = z.string().trim().min(1).max(1024).refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return /^[a-zA-Z0-9][a-zA-Z0-9/_\-.]{1,512}$/.test(value) && !value.includes("..");
  }
}, "Enter a valid URL or uploaded media path.");

const registrationSchema = z.object({
  event_id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  college_email: z.string().trim().email().max(254),
  contact_number: z.string().trim().min(7).max(24),
  course: z.string().trim().min(1).max(120),
  department: z.string().trim().min(1).max(120),
  academic_year: z.string().trim().min(1).max(40),
  student_id: z.string().trim().max(80).optional(),
  participation_note: z.string().trim().max(1000).optional(),
  consent_given: z.literal(true),
});

export const suggestionCategories = [
  "New Event Idea",
  "AWS Workshop",
  "Hackathon",
  "Learning Resources",
  "Community Improvement",
  "Technical Project",
  "Other",
] as const;

const suggestionSchema = z
  .object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().max(254).optional(),
    category: z.enum(suggestionCategories),
    title: z.string().trim().min(3).max(160),
    details: z.string().trim().min(10).max(4000),
    is_anonymous: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.is_anonymous) return;
    if (!value.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Please add your name." });
    }
    if (!value.email || !z.string().email().safeParse(value.email).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Please add a valid email." });
    }
  });

const profileUpdateSchema = z.object({
  display_name: z.string().trim().max(120).nullable().optional(),
  full_name: z.string().trim().max(120).nullable().optional(),
  course: z.string().trim().max(160).nullable().optional(),
  department: z.string().trim().max(160).nullable().optional(),
  academic_year: z.string().trim().max(40).nullable().optional(),
  photo_url: mediaReference.nullable().optional(),
});

const resourceSchemas = {
  members: z.object({
    team_id: z.string().uuid().nullable().optional(),
    full_name: z.string().trim().min(1).max(120),
    designation: z.string().trim().min(1).max(120),
    department: z.string().max(160).nullable().optional(),
    course: z.string().max(160).nullable().optional(),
    academic_year: z.string().max(40).nullable().optional(),
    bio: z.string().max(2000).nullable().optional(),
    skills: z.array(z.string().max(60)).max(30).optional(),
    linkedin_url: z.string().url().nullable().optional(),
    github_url: z.string().url().nullable().optional(),
    photo_url: mediaReference.nullable().optional(),
    is_published: z.boolean().optional(),
  }),
  teams: z.object({
    name: z.string().trim().min(1).max(100),
    slug: z.string().trim().min(1).max(120),
    description: z.string().max(1000).nullable().optional(),
  }),
  events: z.object({
    title: z.string().trim().min(1).max(180),
    slug: z.string().trim().min(1).max(200),
    category: z.string().trim().min(1).max(100),
    cover_image_url: mediaReference.nullable().optional(),
    short_description: z.string().trim().min(1).max(500),
    full_description: z.string().max(12000).nullable().optional(),
    agenda: z.array(z.unknown()).max(50).optional(),
    speakers: z.array(z.unknown()).max(30).optional(),
    starts_at: z.string().datetime(),
    ends_at: z.string().datetime().nullable().optional(),
    venue: z.string().max(300).nullable().optional(),
    meeting_details: z.string().max(1000).nullable().optional(),
    eligibility: z.string().max(1000).nullable().optional(),
    registration_deadline: z.string().datetime().nullable().optional(),
    capacity: z.number().int().min(0).nullable().optional(),
    registration_status: z.enum(["upcoming", "registration_open", "registration_closed", "completed", "cancelled"]).optional(),
    important_instructions: z.string().max(4000).nullable().optional(),
    is_published: z.boolean().optional(),
  }),
  gallery: z.object({
    event_id: z.string().uuid().nullable().optional(),
    media_type: z.enum(["image", "video"]),
    media_url: mediaReference,
    thumbnail_url: mediaReference.nullable().optional(),
    title: z.string().max(180).nullable().optional(),
    caption: z.string().max(1000).nullable().optional(),
    category: z.string().trim().min(1).max(100),
    is_published: z.boolean().optional(),
  }),
  announcements: z.object({
    title: z.string().trim().min(1).max(180),
    slug: z.string().trim().min(1).max(200),
    cover_image_url: mediaReference.nullable().optional(),
    description: z.string().trim().min(1).max(12000),
    category: z.string().trim().min(1).max(100),
    priority: z.enum(["normal", "important"]).optional(),
    external_url: z.string().url().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
    is_published: z.boolean().optional(),
  }),
} as const;

type ManagedResource = keyof typeof resourceSchemas;
const validResources = Object.keys(resourceSchemas) as ManagedResource[];
const adminClient = supabase as unknown as {
  from: (table: string) => any;
  storage: { from: (bucket: string) => any };
  auth: { getUser: (token: string) => Promise<{ data: { user: { id: string; email?: string | null } | null }; error: Error | null }> };
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
};

async function signMedia(value: string | null) {
  if (!value || /^https?:\/\//i.test(value) || !supabase) return value;
  const path = value.startsWith("community-media/") ? value.slice("community-media/".length) : value;
  const { data, error } = await adminClient.storage.from("community-media").createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

function requireDatabase(_req: Request, res: Response, next: NextFunction) {
  if (!supabase) {
    res.status(503).json({ message: "The community database is not configured yet." });
    return;
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token || !supabase) {
    res.status(token ? 503 : 401).json({ message: token ? "The admin service is not configured." : "Sign in is required." });
    return;
  }

  const { data: authData, error: authError } = await adminClient.auth.getUser(token);
  if (authError || !authData.user) {
    res.status(401).json({ message: "Your session is invalid or has expired." });
    return;
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError || !profile || !["admin", "editor"].includes(profile.role)) {
    res.status(403).json({ message: "This account is not authorized to manage the community." });
    return;
  }
  res.locals.adminId = authData.user.id;
  next();
}

/** Resolves the signed-in account id when a valid bearer token is present, otherwise null. */
async function optionalUserId(req: Request): Promise<string | null> {
  const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token || !supabase) return null;
  const { data } = await adminClient.auth.getUser(token);
  return data.user?.id ?? null;
}

/** Requires a valid Supabase session and exposes the account id/email to the route. */
async function requireStudent(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token || !supabase) {
    res.status(token ? 503 : 401).json({ message: token ? "The student service is not configured." : "Sign in is required." });
    return;
  }
  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ message: "Your session is invalid or has expired." });
    return;
  }
  res.locals.userId = data.user.id;
  res.locals.userEmail = data.user.email ?? null;
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, databaseConfigured: Boolean(supabase) });
});

app.get("/api/members", requireDatabase, async (_req, res) => {
  const { data, error } = await adminClient.from("members")
    .select("id,full_name,designation,department,course,academic_year,bio,skills,linkedin_url,github_url,photo_url,team_id,team:teams(name)")
    .eq("is_published", true).order("full_name");
  if (error) return res.status(500).json({ message: "Could not load community profiles." });
  const signedData = await Promise.all((data ?? []).map(async (member: Record<string, unknown>) => ({
    ...member,
    photo_url: await signMedia(typeof member.photo_url === "string" ? member.photo_url : null),
  })));
  return res.json({ data: signedData });
});

app.get("/api/events", requireDatabase, async (_req, res) => {
  const { data, error } = await adminClient.from("events")
    .select("id,title,slug,category,cover_image_url,short_description,full_description,agenda,speakers,starts_at,ends_at,venue,eligibility,registration_deadline,capacity,registration_status,important_instructions")
    .eq("is_published", true).order("starts_at", { ascending: true });
  if (error) return res.status(500).json({ message: "Could not load published events." });
  const signedData = await Promise.all((data ?? []).map(async (event: Record<string, unknown>) => ({
    ...event,
    cover_image_url: await signMedia(typeof event.cover_image_url === "string" ? event.cover_image_url : null),
  })));
  return res.json({ data: signedData });
});

app.get("/api/gallery", requireDatabase, async (_req, res) => {
  const { data, error } = await adminClient.from("gallery")
    .select("id,event_id,media_type,media_url,thumbnail_url,title,caption,category,created_at")
    .eq("is_published", true).order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: "Could not load the community gallery." });
  const signedData = await Promise.all((data ?? []).map(async (item: Record<string, unknown>) => ({
    ...item,
    media_url: await signMedia(typeof item.media_url === "string" ? item.media_url : null),
    thumbnail_url: await signMedia(typeof item.thumbnail_url === "string" ? item.thumbnail_url : null),
  })));
  return res.json({ data: signedData });
});

app.get("/api/announcements", requireDatabase, async (_req, res) => {
  const { data, error } = await adminClient.from("announcements")
    .select("id,title,slug,cover_image_url,description,category,priority,external_url,published_at")
    .eq("is_published", true).or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .order("published_at", { ascending: false });
  if (error) return res.status(500).json({ message: "Could not load community updates." });
  const signedData = await Promise.all((data ?? []).map(async (item: Record<string, unknown>) => ({
    ...item,
    cover_image_url: await signMedia(typeof item.cover_image_url === "string" ? item.cover_image_url : null),
  })));
  return res.json({ data: signedData });
});

app.get("/api/events/:slug", requireDatabase, async (req, res) => {
  const { data, error } = await adminClient.from("events")
    .select("id,title,slug,category,cover_image_url,short_description,full_description,agenda,speakers,starts_at,ends_at,venue,eligibility,registration_deadline,capacity,registration_status,important_instructions")
    .eq("slug", req.params.slug).eq("is_published", true).maybeSingle();
  if (error) return res.status(500).json({ message: "Could not load this event." });
  if (!data) return res.status(404).json({ message: "This event could not be found." });
  return res.json({
    data: { ...data, cover_image_url: await signMedia(typeof data.cover_image_url === "string" ? data.cover_image_url : null) },
  });
});

app.get("/api/announcements/:slug", requireDatabase, async (req, res) => {
  const { data, error } = await adminClient.from("announcements")
    .select("id,title,slug,cover_image_url,description,category,priority,external_url,published_at")
    .eq("slug", req.params.slug).eq("is_published", true)
    .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
    .maybeSingle();
  if (error) return res.status(500).json({ message: "Could not load this update." });
  if (!data) return res.status(404).json({ message: "This update could not be found." });
  return res.json({
    data: { ...data, cover_image_url: await signMedia(typeof data.cover_image_url === "string" ? data.cover_image_url : null) },
  });
});

app.get("/api/members/:id", requireDatabase, async (req, res) => {
  if (!z.string().uuid().safeParse(req.params.id).success) {
    return res.status(404).json({ message: "This member could not be found." });
  }
  const { data, error } = await adminClient.from("members")
    .select("id,full_name,designation,department,course,academic_year,bio,skills,linkedin_url,github_url,photo_url,team_id,team:teams(name)")
    .eq("id", req.params.id).eq("is_published", true).maybeSingle();
  if (error) return res.status(500).json({ message: "Could not load this member." });
  if (!data) return res.status(404).json({ message: "This member could not be found." });
  return res.json({
    data: { ...data, photo_url: await signMedia(typeof data.photo_url === "string" ? data.photo_url : null) },
  });
});

app.get("/api/settings", requireDatabase, async (_req, res) => {
  const { data, error } = await adminClient.from("site_settings")
    .select("key,value").eq("is_public", true);
  if (error) return res.status(500).json({ message: "Could not load community settings." });
  return res.json({ data });
});

app.get("/api/stats", requireDatabase, async (_req, res) => {
  const [members, events, workshops, projects] = await Promise.all([
    adminClient.from("members").select("id", { count: "exact", head: true }).eq("is_published", true),
    adminClient.from("events").select("id", { count: "exact", head: true }).eq("is_published", true),
    adminClient.from("events").select("id", { count: "exact", head: true }).eq("is_published", true).ilike("category", "%workshop%"),
    adminClient.from("site_settings").select("value").eq("key", "project_count").eq("is_public", true).maybeSingle(),
  ]);
  if (members.error || events.error || workshops.error || projects.error) {
    return res.status(500).json({ message: "Could not load live community statistics." });
  }
  const projectCount = projects.data?.value;
  return res.json({
    members: members.count ?? 0,
    events: events.count ?? 0,
    workshops: workshops.count ?? 0,
    projects: typeof projectCount === "number" ? projectCount : null,
  });
});

app.post("/api/contact", publicFormLimiter, requireDatabase, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please check your name, email, and message." });
  const { error } = await adminClient.from("contact_messages").insert({
    ...parsed.data,
    email: parsed.data.email.toLowerCase(),
  });
  if (error) return res.status(500).json({ message: "We could not save your message. Please try again." });
  return res.status(201).json({ message: "Message received." });
});

app.post("/api/admin/login", adminLoginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
  if (!supabaseUrl || !anonKey || !supabase) {
    return res.status(503).json({ message: "Administrator sign-in is not configured." });
  }

  const loginClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data, error } = await loginClient.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user || !data.session) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role,display_name")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError || !profile || !["admin", "editor"].includes(profile.role)) {
    await loginClient.auth.signOut({ scope: "local" });
    return res.status(403).json({ message: "This account is not authorized to manage the community." });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at,
    user: { id: data.user.id, displayName: profile.display_name, role: profile.role },
  });
});

app.post("/api/events/:eventId/registrations", publicFormLimiter, requireDatabase, async (req, res) => {
  const parsed = registrationSchema.safeParse({ ...req.body, event_id: req.params.eventId });
  if (!parsed.success) return res.status(400).json({ message: "Please check the registration details and consent." });
  const userId = await optionalUserId(req);
  const { data, error } = await adminClient.rpc("register_for_event", { registration: { ...parsed.data, user_id: userId } });
  if (error) {
    const knownRegistrationError = /not available|not open|deadline|capacity|already exists/i.test(error.message);
    return res.status(knownRegistrationError ? 409 : 500).json({
      message: knownRegistrationError ? error.message : "We could not complete this registration.",
    });
  }
  return res.status(201).json(data);
});

app.post("/api/suggestions", publicFormLimiter, requireDatabase, async (req, res) => {
  const parsed = suggestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please complete the suggestion form with a clear title and details." });
  const { name, email, category, title, details, is_anonymous } = parsed.data;
  const anonymous = Boolean(is_anonymous);
  const userId = await optionalUserId(req);
  const { data, error } = await adminClient.from("suggestions")
    .insert({
      user_id: userId,
      name: anonymous ? null : (name || "").trim() || null,
      email: anonymous ? null : (email || "").trim().toLowerCase() || null,
      category,
      title: title.trim(),
      details: details.trim(),
      is_anonymous: anonymous,
    })
    .select("id,reference_code").single();
  if (error) return res.status(500).json({ message: "We could not save your suggestion. Please try again." });
  return res.status(201).json({ reference_id: data.reference_code });
});

app.get("/api/me/profile", requireStudent, async (_req, res) => {
  const userId = res.locals.userId as string;
  const { data, error } = await adminClient.from("profiles")
    .select("id,display_name,full_name,course,department,academic_year,photo_url")
    .eq("id", userId).maybeSingle();
  if (error) return res.status(500).json({ message: "Could not load your profile." });
  if (data) {
    return res.json({
      data: { ...data, photo_url: await signMedia(typeof data.photo_url === "string" ? data.photo_url : null) },
    });
  }
  const { data: created, error: createError } = await adminClient.from("profiles")
    .insert({ id: userId })
    .select("id,display_name,full_name,course,department,academic_year,photo_url").single();
  if (createError) return res.status(500).json({ message: "Could not prepare your profile." });
  return res.json({ data: created });
});

app.put("/api/me/profile", requireStudent, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return res.status(400).json({ message: "Please submit at least one valid field." });
  }
  const { data, error } = await adminClient.from("profiles")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", res.locals.userId)
    .select("id,display_name,full_name,course,department,academic_year,photo_url").single();
  if (error) return res.status(400).json({ message: "Could not update your profile." });
  return res.json({
    data: { ...data, photo_url: await signMedia(typeof data.photo_url === "string" ? data.photo_url : null) },
  });
});

app.get("/api/me/registrations", requireStudent, async (_req, res) => {
  const userId = res.locals.userId as string;
  const rawEmail = res.locals.userEmail as string | null;
  const email = rawEmail && /^[^,()*]+$/.test(rawEmail) ? rawEmail : null;
  let query = adminClient.from("event_registrations")
    .select("id,registration_code,status,created_at,event:events(title,slug)")
    .order("created_at", { ascending: false });
  query = email ? query.or(`user_id.eq.${userId},college_email.eq.${email}`) : query.eq("user_id", userId);
  const { data, error } = await query.limit(200);
  if (error) return res.status(500).json({ message: "Could not load your registrations." });
  const mapped = (data ?? []).map((row: Record<string, any>) => ({
    id: row.id,
    registration_code: row.registration_code,
    status: row.status,
    created_at: row.created_at,
    event_title: row.event?.title ?? null,
    event_slug: row.event?.slug ?? null,
  }));
  return res.json({ data: mapped });
});

app.use("/api/admin", requireDatabase, requireAdmin, (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/api/admin/overview", async (_req, res) => {
  const [members, events, registrations, announcements, suggestions, gallery, recentActivity] = await Promise.all([
    adminClient.from("members").select("id", { count: "exact", head: true }),
    adminClient.from("events").select("id", { count: "exact", head: true }),
    adminClient.from("event_registrations").select("id", { count: "exact", head: true }),
    adminClient.from("announcements").select("id", { count: "exact", head: true }),
    adminClient.from("suggestions").select("id", { count: "exact", head: true }),
    adminClient.from("gallery").select("id", { count: "exact", head: true }),
    adminClient.from("activity_logs").select("id,action,entity_type,entity_id,created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  if (members.error || events.error || registrations.error || announcements.error || suggestions.error || gallery.error || recentActivity.error) {
    return res.status(500).json({ message: "Could not load the admin overview." });
  }
  return res.json({
    members: members.count ?? 0,
    events: events.count ?? 0,
    registrations: registrations.count ?? 0,
    announcements: announcements.count ?? 0,
    suggestions: suggestions.count ?? 0,
    gallery: gallery.count ?? 0,
    recentActivity: recentActivity.data,
  });
});

app.get("/api/admin/suggestions", async (req, res) => {
  let query = adminClient.from("suggestions")
    .select("id,reference_code,name,email,category,title,details,is_anonymous,status,admin_note,created_at")
    .order("created_at", { ascending: false });
  if (typeof req.query.status === "string" && ["new", "under_review", "accepted", "rejected"].includes(req.query.status)) {
    query = query.eq("status", req.query.status);
  }
  if (typeof req.query.category === "string" && req.query.category) {
    query = query.eq("category", req.query.category);
  }
  if (typeof req.query.search === "string" && req.query.search.length <= 100) {
    const search = req.query.search.replace(/[^a-zA-Z0-9@._\-\s]/g, "");
    if (search) query = query.or(`title.ilike.%${search}%,details.ilike.%${search}%,reference_code.ilike.%${search}%,name.ilike.%${search}%`);
  }
  const { data, error } = await query.limit(1000);
  if (error) return res.status(500).json({ message: "Could not load suggestions." });
  return res.json({ data });
});

app.patch("/api/admin/suggestions/:id", async (req, res) => {
  const parsed = z.object({
    status: z.enum(["new", "under_review", "accepted", "rejected"]).optional(),
    admin_note: z.string().trim().max(2000).nullable().optional(),
  }).safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return res.status(400).json({ message: "Choose a valid status or admin note." });
  }
  const { data, error } = await adminClient.from("suggestions")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ message: "Could not update this suggestion." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: parsed.data.status ? `suggestion_${parsed.data.status}` : "suggestion_note",
    entity_type: "suggestions",
    entity_id: req.params.id,
  });
  return res.json({ data });
});

app.get("/api/admin/registrations", async (req, res) => {
  let query = adminClient.from("event_registrations")
    .select("id,registration_code,event_id,event:events(title),full_name,college_email,contact_number,course,department,academic_year,student_id,participation_note,status,created_at")
    .order("created_at", { ascending: false });
  if (typeof req.query.eventId === "string") {
    if (!z.string().uuid().safeParse(req.query.eventId).success) return res.status(400).json({ message: "Choose a valid event." });
    query = query.eq("event_id", req.query.eventId);
  }
  if (typeof req.query.search === "string" && req.query.search.length <= 100) {
    const search = req.query.search.replace(/[^a-zA-Z0-9@._\-\s]/g, "");
    if (search) query = query.or(`full_name.ilike.%${search}%,college_email.ilike.%${search}%`);
  }
  const { data, error } = await query.limit(1000);
  if (error) return res.status(500).json({ message: "Could not load registrations." });
  return res.json({ data });
});

app.get("/api/admin/registrations/export.csv", async (req, res) => {
  let query = adminClient.from("event_registrations")
    .select("registration_code,full_name,college_email,contact_number,course,department,academic_year,student_id,status,created_at")
    .order("created_at", { ascending: false });
  if (typeof req.query.eventId === "string") {
    if (!z.string().uuid().safeParse(req.query.eventId).success) return res.status(400).json({ message: "Choose a valid event." });
    query = query.eq("event_id", req.query.eventId);
  }
  const { data, error } = await query.limit(10000);
  if (error) return res.status(500).json({ message: "Could not export registrations." });

  const columns = ["registration_code", "full_name", "college_email", "contact_number", "course", "department", "academic_year", "student_id", "status", "created_at"];
  const csvCell = (value: unknown) => {
    const raw = String(value ?? "");
    const safe = /^[\t\r\n ]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = [columns.join(","), ...(data ?? []).map((row: Record<string, unknown>) => columns.map((column) => csvCell(row[column])).join(","))].join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="event-registrations.csv"');
  return res.send(csv);
});

app.patch("/api/admin/registrations/:id/status", async (req, res) => {
  const parsed = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Choose a valid registration status." });
  const { data, error } = await adminClient.from("event_registrations")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id).select("id,status").single();
  if (error) return res.status(500).json({ message: "Could not update registration status." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: `registration_${parsed.data.status}`,
    entity_type: "event_registrations",
    entity_id: req.params.id,
  });
  return res.json({ data });
});

app.get("/api/admin/settings", async (_req, res) => {
  const { data, error } = await adminClient.from("site_settings").select("key,value,is_public,updated_at").order("key");
  if (error) return res.status(500).json({ message: "Could not load community settings." });
  return res.json({ data });
});

app.put("/api/admin/settings/:key", async (req, res) => {
  const parsed = z.object({ value: z.unknown(), is_public: z.boolean().optional() }).safeParse(req.body);
  if (!parsed.success || !/^[a-z][a-z0-9_]{1,63}$/.test(req.params.key)) {
    return res.status(400).json({ message: "Please provide a valid setting." });
  }
  const { data, error } = await adminClient.from("site_settings").upsert({
    key: req.params.key,
    ...parsed.data,
    updated_by: res.locals.adminId,
    updated_at: new Date().toISOString(),
  }).select().single();
  if (error) return res.status(400).json({ message: "Could not update this setting." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: "update",
    entity_type: "site_settings",
    metadata: { key: req.params.key },
  });
  return res.json({ data });
});

app.post("/api/admin/media", receiveMedia, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose an image or video to upload." });
  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  const extension = extensionByMimeType[req.file.mimetype];
  if (!extension || !supabase) return res.status(400).json({ message: "This media type is not supported." });
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const { error } = await adminClient.storage.from("community-media").upload(path, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });
  if (error) return res.status(500).json({ message: "Could not upload this media. Check the storage setup." });
  return res.status(201).json({ path, mediaType: req.file.mimetype.startsWith("video/") ? "video" : "image" });
});

app.get("/api/admin/:resource", async (req, res) => {
  const resource = req.params.resource as ManagedResource;
  if (!validResources.includes(resource)) return res.status(404).json({ message: "Unknown management resource." });
  const { data, error } = await adminClient.from(resource).select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) return res.status(500).json({ message: "Could not load management records." });
  return res.json({ data });
});

app.post("/api/admin/:resource", async (req, res) => {
  const resource = req.params.resource as ManagedResource;
  if (!validResources.includes(resource)) return res.status(404).json({ message: "Unknown management resource." });
  const parsed = resourceSchemas[resource].safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please check the submitted fields.", issues: parsed.error.issues });
  const { data, error } = await adminClient.from(resource).insert(parsed.data).select().single();
  if (error) return res.status(400).json({ message: "Could not create this item." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: "create",
    entity_type: resource,
    entity_id: data.id,
  });
  return res.status(201).json({ data });
});

app.patch("/api/admin/:resource/:id", async (req, res) => {
  const resource = req.params.resource as ManagedResource;
  if (!validResources.includes(resource)) return res.status(404).json({ message: "Unknown management resource." });
  const parsed = resourceSchemas[resource].partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return res.status(400).json({ message: "Please submit at least one valid field." });
  }
  const { data, error } = await adminClient.from(resource)
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ message: "Could not update this item." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: "update",
    entity_type: resource,
    entity_id: data.id,
  });
  return res.json({ data });
});

app.delete("/api/admin/:resource/:id", async (req, res) => {
  const resource = req.params.resource as ManagedResource;
  if (!validResources.includes(resource)) return res.status(404).json({ message: "Unknown management resource." });
  const { error } = await adminClient.from(resource).delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ message: "Could not delete this item." });
  await adminClient.from("activity_logs").insert({
    actor_id: res.locals.adminId,
    action: "delete",
    entity_type: resource,
    entity_id: req.params.id,
  });
  return res.status(204).end();
});

app.use((_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error");
  res.status(500).json({ message: "An unexpected server error occurred." });
});

const distDirectory = resolve("dist");
if (existsSync(distDirectory)) {
  app.use("/api", (_req, res) => res.status(404).json({ message: "API route not found." }));
  app.use(express.static(distDirectory, { maxAge: "1h", index: false }));
  app.use((req, res, next) => {
    if (req.method === "GET") return res.sendFile(resolve(distDirectory, "index.html"));
    return next();
  });
}

app.listen(port, () => {
  console.log(`Community API listening on port ${port}`);
});
