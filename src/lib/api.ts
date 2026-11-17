import type {
  Announcement,
  CommunityEvent,
  CommunityMember,
  CommunityStats,
  GalleryItem,
  RegistrationSummary,
  SiteSettings,
  StudentProfile,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.message || "Something went wrong. Please try again.");
  }
  return payload as T;
}

export async function getStats(signal?: AbortSignal) {
  return request<CommunityStats>("/api/stats", { signal });
}

export async function getEvents(signal?: AbortSignal) {
  const result = await request<{ data: CommunityEvent[] }>("/api/events", { signal });
  return result.data;
}

export async function getEventBySlug(slug: string, signal?: AbortSignal) {
  const result = await request<{ data: CommunityEvent }>(`/api/events/${encodeURIComponent(slug)}`, { signal });
  return result.data;
}

export async function getGallery(signal?: AbortSignal) {
  const result = await request<{ data: GalleryItem[] }>("/api/gallery", { signal });
  return result.data;
}

export async function getAnnouncements(signal?: AbortSignal) {
  const result = await request<{ data: Announcement[] }>("/api/announcements", { signal });
  return result.data;
}

export async function getAnnouncementBySlug(slug: string, signal?: AbortSignal) {
  const result = await request<{ data: Announcement }>(`/api/announcements/${encodeURIComponent(slug)}`, { signal });
  return result.data;
}

export async function getMembers(signal?: AbortSignal) {
  const result = await request<{ data: CommunityMember[] }>("/api/members", { signal });
  return result.data;
}

export async function getMemberById(id: string, signal?: AbortSignal) {
  const result = await request<{ data: CommunityMember }>(`/api/members/${encodeURIComponent(id)}`, { signal });
  return result.data;
}

export async function getSettings(signal?: AbortSignal) {
  const result = await request<{ data: Array<{ key: string; value: unknown }> }>("/api/settings", { signal });
  const settings: SiteSettings = {};
  result.data.forEach((item) => {
    if (typeof item.value === "string") settings[item.key] = item.value;
  });
  return settings;
}

export async function submitContact(payload: { name: string; email: string; message: string }) {
  return request<{ message: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitSuggestion(payload: Record<string, unknown>, accessToken?: string | null) {
  return request<{ reference_id: string }>("/api/suggestions", {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: JSON.stringify(payload),
  });
}

export async function getMyProfile(accessToken: string) {
  const result = await request<{ data: StudentProfile }>("/api/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return result.data;
}

export async function updateMyProfile(accessToken: string, payload: Partial<StudentProfile>) {
  const result = await request<{ data: StudentProfile }>("/api/me/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
  return result.data;
}

export async function getMyRegistrations(accessToken: string) {
  const result = await request<{ data: RegistrationSummary[] }>("/api/me/registrations", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return result.data;
}

export async function registerForEvent(
  eventId: string,
  payload: Record<string, unknown>,
  accessToken?: string | null,
) {
  return request<{ registration_id: string }>(`/api/events/${eventId}/registrations`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: JSON.stringify({ ...payload, event_id: eventId }),
  });
}
