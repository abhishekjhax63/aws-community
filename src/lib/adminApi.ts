import type { Suggestion } from "./types";

const TOKEN_KEY = "aws-community-admin-token";

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — session simply will not persist */
  }
}

export class AdminSessionError extends Error {}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (response.status === 401 || response.status === 403) {
    setAdminToken(null);
    throw new AdminSessionError("Your admin session has ended. Please sign in again.");
  }
  const payload = (await response.json().catch(() => null)) as (T & { message?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.message || "Something went wrong. Please try again.");
  }
  return payload as T;
}

export type AdminOverview = {
  members: number;
  events: number;
  registrations: number;
  announcements: number;
  suggestions: number;
  gallery: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    created_at: string;
  }>;
};

export async function adminLogin(email: string, password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { accessToken: string; expiresAt: number | null; user: { id: string; displayName: string | null; role: string } ; message?: string }
    | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.message || "Email or password is incorrect.");
  }
  return payload;
}

export function adminOverview() {
  return adminRequest<AdminOverview>("/api/admin/overview");
}

export function adminList<T = Record<string, unknown>>(resource: string) {
  return adminRequest<{ data: T[] }>(`/api/admin/${resource}`).then((result) => result.data);
}

export function adminCreate<T = Record<string, unknown>>(resource: string, body: Record<string, unknown>) {
  return adminRequest<{ data: T }>(`/api/admin/${resource}`, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((result) => result.data);
}

export function adminUpdate<T = Record<string, unknown>>(resource: string, id: string, body: Record<string, unknown>) {
  return adminRequest<{ data: T }>(`/api/admin/${resource}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  }).then((result) => result.data);
}

export function adminDelete(resource: string, id: string) {
  return adminRequest<null>(`/api/admin/${resource}/${id}`, { method: "DELETE" });
}

export type AdminRegistration = {
  id: string;
  registration_code: string;
  event_id: string;
  event: { title: string } | null;
  full_name: string;
  college_email: string;
  contact_number: string;
  course: string;
  department: string;
  academic_year: string;
  student_id: string | null;
  participation_note: string | null;
  status: string;
  created_at: string;
};

export function adminRegistrations(params: { eventId?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params.eventId) query.set("eventId", params.eventId);
  if (params.search) query.set("search", params.search);
  const suffix = query.toString();
  return adminRequest<{ data: AdminRegistration[] }>(`/api/admin/registrations${suffix ? `?${suffix}` : ""}`)
    .then((result) => result.data);
}

export function adminUpdateRegistrationStatus(id: string, status: string) {
  return adminRequest<{ data: { id: string; status: string } }>(`/api/admin/registrations/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).then((result) => result.data);
}

export async function adminDownloadRegistrationsCsv(eventId?: string) {
  const token = getAdminToken();
  const suffix = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  const response = await fetch(`/api/admin/registrations/export.csv${suffix}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Could not export registrations.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "event-registrations.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function adminSuggestions(params: { status?: string; category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  const suffix = query.toString();
  return adminRequest<{ data: Suggestion[] }>(`/api/admin/suggestions${suffix ? `?${suffix}` : ""}`)
    .then((result) => result.data);
}

export function adminUpdateSuggestion(id: string, body: { status?: string; admin_note?: string | null }) {
  return adminRequest<{ data: Suggestion }>(`/api/admin/suggestions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  }).then((result) => result.data);
}

export type AdminSetting = { key: string; value: unknown; is_public: boolean; updated_at: string };

export function adminSettings() {
  return adminRequest<{ data: AdminSetting[] }>("/api/admin/settings").then((result) => result.data);
}

export function adminUpdateSetting(key: string, value: unknown, isPublic: boolean) {
  return adminRequest<{ data: AdminSetting }>(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value, is_public: isPublic }),
  }).then((result) => result.data);
}
