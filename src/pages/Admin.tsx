import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Download, LogOut, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";
import { ErrorState, LoadingState } from "../components/Page";
import Reveal from "../components/Reveal";
import { suggestionCategories } from "../data/content";
import { useDocumentTitle } from "../lib/hooks";
import { formatDateTime, humanizeStatus } from "../lib/format";
import { DEFAULT_SOCIAL_LINKS, type CommunitySocialLink } from "../lib/socialLinks";
import type { Suggestion } from "../lib/types";
import {
  AdminSessionError,
  adminCreate,
  adminDelete,
  adminDownloadRegistrationsCsv,
  adminList,
  adminLogin,
  adminMediaPreview,
  adminOverview,
  adminRegistrations,
  adminSettings,
  adminSuggestions,
  adminUpdate,
  adminUpdateRegistrationStatus,
  adminUpdateSetting,
  adminUpdateSuggestion,
  adminUploadMedia,
  getAdminToken,
  setAdminToken,
  type AdminOverview,
  type AdminRegistration,
  type AdminSetting,
} from "../lib/adminApi";

export default function Admin() {
  useDocumentTitle("Admin dashboard");
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  return authed
    ? <AdminDashboard onSessionEnd={() => setAuthed(false)} />
    : <AdminLogin onSuccess={() => setAuthed(true)} />;
}

/* ------------------------------------------------------------------ login */

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(true);
    setError("");
    try {
      const result = await adminLogin(String(values.email ?? "").trim(), String(values.password ?? ""));
      setAdminToken(result.accessToken);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-login">
        <span className="eyebrow">ADMIN ACCESS</span>
        <h1>Community control room.</h1>
        <p>Sign in with an administrator account to manage members, events, registrations, updates, gallery and suggestions.</p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="admin-email">EMAIL ADDRESS</label>
          <input id="admin-email" name="email" type="email" required autoComplete="username" placeholder="admin@amity.edu" />
          <label htmlFor="admin-password">PASSWORD</label>
          <input id="admin-password" name="password" type="password" required autoComplete="current-password" />
          {error ? <p className="form-message error" role="alert">{error}</p> : null}
          <button className="button button-orange auth-submit" type="submit" disabled={busy}>
            {busy ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>
        <Link className="text-link" to="/">← Back to the community site</Link>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------- dashboard */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "suggestions", label: "Suggestions" },
  { id: "registrations", label: "Registrations" },
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "announcements", label: "Announcements" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminDashboard({ onSessionEnd }: { onSessionEnd: () => void }) {
  const [tab, setTab] = useState<TabId>("overview");

  function endSession() {
    setAdminToken(null);
    onSessionEnd();
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <strong>BUILDER COMMUNITY</strong>
          <span>ADMIN CONSOLE</span>
        </div>
        <div className="admin-header-actions">
          <Link className="text-link" to="/">View site</Link>
          <button className="button button-outline" type="button" onClick={endSession}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "is-active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label.toUpperCase()}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {tab === "overview" ? <OverviewPanel onSessionEnd={endSession} /> : null}
        {tab === "suggestions" ? <SuggestionsPanel onSessionEnd={endSession} /> : null}
        {tab === "registrations" ? <RegistrationsPanel onSessionEnd={endSession} /> : null}
        {tab === "members" ? <ResourcePanel config={MEMBER_CONFIG} onSessionEnd={endSession} /> : null}
        {tab === "events" ? <ResourcePanel config={EVENT_CONFIG} onSessionEnd={endSession} /> : null}
        {tab === "gallery" ? <ResourcePanel config={GALLERY_CONFIG} onSessionEnd={endSession} /> : null}
        {tab === "announcements" ? <ResourcePanel config={ANNOUNCEMENT_CONFIG} onSessionEnd={endSession} /> : null}
        {tab === "settings" ? <SettingsPanel onSessionEnd={endSession} /> : null}
      </div>
    </main>
  );
}

function useSessionGuard(onSessionEnd: () => void) {
  return useCallback((err: unknown) => {
    if (err instanceof AdminSessionError) {
      onSessionEnd();
      return true;
    }
    return false;
  }, [onSessionEnd]);
}

/* --------------------------------------------------------------- overview */

function OverviewPanel({ onSessionEnd }: { onSessionEnd: () => void }) {
  const handleError = useSessionGuard(onSessionEnd);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    adminOverview()
      .then(setData)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load the overview.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const cards = [
    { label: "Total members", value: data.members },
    { label: "Total events", value: data.events },
    { label: "Total registrations", value: data.registrations },
    { label: "Total suggestions", value: data.suggestions },
    { label: "Total gallery items", value: data.gallery },
    { label: "Total updates", value: data.announcements },
  ];

  return (
    <Reveal as="section" className="admin-section">
      <div className="admin-section-head">
        <h2>Overview</h2>
        <button className="text-link" type="button" onClick={load}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div className="admin-metric-grid">
        {cards.map((card, index) => (
          <Reveal className="admin-metric" key={card.label} delay={index * 70}>
            <span>{card.label.toUpperCase()}</span>
            <strong>{card.value}</strong>
          </Reveal>
        ))}
      </div>
      <div className="admin-panel">
        <h3>Recent activity</h3>
        {data.recentActivity.length === 0 ? (
          <p className="admin-muted">No activity recorded yet.</p>
        ) : (
          <ul className="activity-list">
            {data.recentActivity.map((item) => (
              <li key={item.id}>
                <span className="activity-action">{item.action.replace(/_/g, " ")}</span>
                <span className="activity-entity">{item.entity_type}</span>
                <time>{formatDateTime(item.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------ suggestions */

const SUGGESTION_STATUSES = ["new", "under_review", "accepted", "rejected"] as const;

function SuggestionsPanel({ onSessionEnd }: { onSessionEnd: () => void }) {
  const handleError = useSessionGuard(onSessionEnd);
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  function load() {
    setLoading(true);
    setError("");
    adminSuggestions({ search, status, category })
      .then(setRows)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load suggestions.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [search, status, category]);

  async function update(id: string, body: { status?: string; admin_note?: string | null }) {
    try {
      const updated = await adminUpdateSuggestion(id, body);
      setRows((current) => current.map((row) => (row.id === id ? updated : row)));
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not update this suggestion.");
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>Student suggestions</h2>
        <span className="admin-muted">{rows.length} shown</span>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={14} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, details or reference"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {SUGGESTION_STATUSES.map((item) => (
            <option key={item} value={item}>{humanizeStatus(item)}</option>
          ))}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {suggestionCategories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading suggestions" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <p className="admin-muted">No suggestions match this view.</p>
      ) : (
        <div className="suggestion-admin-list">
          {rows.map((row) => (
            <article className="suggestion-admin-card" key={row.id}>
              <header>
                <div>
                  <span className="suggestion-ref">{row.reference_code}</span>
                  <h3>{row.title}</h3>
                  <span className="admin-muted">
                    {row.is_anonymous ? "Anonymous" : `${row.name ?? "Unknown"} · ${row.email ?? "no email"}`}
                    {" · "}{row.category} · {formatDateTime(row.created_at)}
                  </span>
                </div>
                <select
                  value={row.status}
                  onChange={(event) => void update(row.id, { status: event.target.value })}
                  className={`status-select status-${row.status}`}
                >
                  {SUGGESTION_STATUSES.map((item) => (
                    <option key={item} value={item}>{humanizeStatus(item)}</option>
                  ))}
                </select>
              </header>
              <p className="suggestion-admin-details">{row.details}</p>
              <AdminNoteEditor value={row.admin_note} onSave={(note) => void update(row.id, { admin_note: note })} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminNoteEditor({ value, onSave }: { value: string | null; onSave: (note: string | null) => void }) {
  const [note, setNote] = useState(value ?? "");
  return (
    <div className="admin-note">
      <label>
        <span>INTERNAL NOTE</span>
        <textarea
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a private note for the community team"
        />
      </label>
      <button className="button button-outline" type="button" onClick={() => onSave(note.trim() === "" ? null : note.trim())}>
        <Save size={14} /> Save note
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- registrations */

function RegistrationsPanel({ onSessionEnd }: { onSessionEnd: () => void }) {
  const handleError = useSessionGuard(onSessionEnd);
  const [rows, setRows] = useState<AdminRegistration[]>([]);
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    setLoading(true);
    setError("");
    adminRegistrations({ eventId, search })
      .then(setRows)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load registrations.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [eventId, search]);

  useEffect(() => {
    adminList<{ id: string; title: string }>("events")
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      const updated = await adminUpdateRegistrationStatus(id, status);
      setRows((current) => current.map((row) => (row.id === id ? { ...row, status: updated.status } : row)));
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not update the registration.");
    }
  }

  async function exportCsv() {
    setNotice("");
    try {
      await adminDownloadRegistrationsCsv(eventId || undefined);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not export registrations.");
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>Event registrations</h2>
        <button className="button button-outline" type="button" onClick={() => void exportCsv()}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={14} />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
        </label>
        <select value={eventId} onChange={(event) => setEventId(event.target.value)}>
          <option value="">All events</option>
          {events.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>
      </div>

      {notice ? <p className="form-message error">{notice}</p> : null}

      {loading ? (
        <LoadingState label="Loading registrations" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <p className="admin-muted">No registrations found.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th><th>Student</th><th>Email</th><th>Event</th><th>Course / Year</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><code>{row.registration_code}</code></td>
                  <td>{row.full_name}</td>
                  <td>{row.college_email}</td>
                  <td>{row.event?.title ?? "—"}</td>
                  <td>{[row.course, row.academic_year].filter(Boolean).join(" · ")}</td>
                  <td><span className={`status-badge status-${row.status}`}>{humanizeStatus(row.status)}</span></td>
                  <td className="admin-table-actions">
                    <button type="button" onClick={() => void setStatus(row.id, "approved")}>Approve</button>
                    <button type="button" onClick={() => void setStatus(row.id, "rejected")}>Reject</button>
                    <button type="button" onClick={() => void setStatus(row.id, "pending")}>Reset</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------- generic resources */

type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "datetime" | "json" | "csv" | "media";
type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  placeholder?: string;
};
type ResourceConfig = {
  key: string;
  singular: string;
  columns: Array<{ key: string; label: string }>;
  fields: Field[];
};

const MEMBER_CONFIG: ResourceConfig = {
  key: "members",
  singular: "member",
  columns: [
    { key: "full_name", label: "Name" },
    { key: "designation", label: "Role" },
    { key: "course", label: "Course" },
    { key: "is_published", label: "Published" },
  ],
  fields: [
    { name: "full_name", label: "Full name", type: "text", required: true },
    { name: "designation", label: "Designation", type: "text", required: true },
    { name: "team_id", label: "Team ID (optional)", type: "text", placeholder: "UUID from teams" },
    { name: "department", label: "Department", type: "text" },
    { name: "course", label: "Course", type: "text" },
    { name: "academic_year", label: "Academic year", type: "text" },
    { name: "bio", label: "Short bio", type: "textarea" },
    { name: "skills", label: "Skills (comma separated)", type: "csv" },
    { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
    { name: "github_url", label: "GitHub URL", type: "text" },
    { name: "photo_url", label: "Photo URL or media path", type: "text" },
    { name: "is_published", label: "Published on the site", type: "checkbox" },
  ],
};

const EVENT_CONFIG: ResourceConfig = {
  key: "events",
  singular: "event",
  columns: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "registration_status", label: "Status" },
    { key: "starts_at", label: "Starts" },
    { key: "is_published", label: "Published" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "event_format", label: "Event format", type: "text" },
    { name: "attendance_note", label: "Approximate attendance", type: "text" },
    { name: "short_description", label: "Short description", type: "textarea", required: true },
    { name: "full_description", label: "Full description", type: "textarea" },
    { name: "starts_at", label: "Starts at (confirm year before publishing)", type: "datetime" },
    { name: "ends_at", label: "Ends at", type: "datetime" },
    { name: "venue", label: "Venue", type: "text" },
    { name: "eligibility", label: "Eligibility", type: "textarea" },
    { name: "registration_deadline", label: "Registration deadline", type: "datetime" },
    { name: "capacity", label: "Capacity", type: "number" },
    {
      name: "registration_status",
      label: "Registration status",
      type: "select",
      options: ["upcoming", "registration_open", "registration_closed", "completed", "cancelled"],
    },
    { name: "important_instructions", label: "Important instructions", type: "textarea" },
    { name: "cover_image_url", label: "Event cover photograph", type: "media" },
    { name: "agenda", label: "Agenda (JSON array)", type: "json" },
    { name: "speakers", label: "Speakers (JSON array)", type: "json" },
    { name: "is_published", label: "Published on the site", type: "checkbox" },
  ],
};

const GALLERY_CONFIG: ResourceConfig = {
  key: "gallery",
  singular: "gallery item",
  columns: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "media_type", label: "Type" },
    { key: "is_published", label: "Published" },
  ],
  fields: [
    { name: "media_type", label: "Media type", type: "select", options: ["image", "video"], required: true },
    { name: "media_url", label: "Event photograph", type: "media", required: true },
    { name: "thumbnail_url", label: "Thumbnail URL or path", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "caption", label: "Caption", type: "textarea" },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "event_id", label: "Event ID (optional)", type: "text" },
    { name: "is_published", label: "Published on the site", type: "checkbox" },
  ],
};

const ANNOUNCEMENT_CONFIG: ResourceConfig = {
  key: "announcements",
  singular: "update",
  columns: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "priority", label: "Priority" },
    { key: "is_published", label: "Published" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "priority", label: "Priority", type: "select", options: ["normal", "important"] },
    { name: "external_url", label: "External link", type: "text" },
    { name: "cover_image_url", label: "Announcement image", type: "media" },
    { name: "published_at", label: "Publish at", type: "datetime" },
    { name: "is_published", label: "Published on the site", type: "checkbox" },
  ],
};

function toFormValue(field: Field, raw: FormDataEntryValue | null) {
  if (field.type === "checkbox") return raw !== null;
  const value = typeof raw === "string" ? raw : "";
  if (field.type === "media" && value === "") return null;
  if (field.name === "event_id" && value === "") return null;
  if (field.type === "datetime" && value === "") return null;
  if (value === "") return undefined;
  if (field.type === "number") return Number(value);
  if (field.type === "datetime") return new Date(value).toISOString();
  if (field.type === "json") return JSON.parse(value);
  if (field.type === "csv") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return value;
}

function fromRecord(field: Field, row: Record<string, unknown> | null) {
  const value = row ? row[field.name] : undefined;
  if (field.type === "checkbox") return Boolean(value);
  if (value === null || value === undefined) return "";
  if (field.type === "datetime") return String(value).slice(0, 16);
  if (field.type === "json") return JSON.stringify(value, null, 2);
  if (field.type === "csv") return Array.isArray(value) ? value.join(", ") : String(value);
  return String(value);
}

function ResourcePanel({ config, onSessionEnd }: { config: ResourceConfig; onSessionEnd: () => void }) {
  const handleError = useSessionGuard(onSessionEnd);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [eventOptions, setEventOptions] = useState<Array<{ id: string; title: string }>>([]);

  function load() {
    setLoading(true);
    setError("");
    adminList(config.key)
      .then(setRows)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load records.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [config.key]);

  useEffect(() => {
    if (config.key !== "gallery") return;
    adminList<{ id: string; title: string }>("events")
      .then(setEventOptions)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load events for the gallery.");
      });
  }, [config.key, handleError]);

  function openCreate() {
    setEditing(null);
    setFormError("");
    setEditorOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    setFormError("");
    setEditorOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    const missingMedia = config.fields.find(
      (field) => field.type === "media" && field.required && !formData.get(field.name),
    );
    if (missingMedia) {
      setFormError(`${missingMedia.label} is required.`);
      return;
    }
    try {
      config.fields.forEach((field) => {
        const value = toFormValue(field, formData.get(field.name));
        if (value !== undefined) body[field.name] = value;
      });
    } catch {
      setFormError("One of the JSON fields is not valid JSON. Please fix it and try again.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      if (editing) await adminUpdate(config.key, String(editing.id), body);
      else await adminCreate(config.key, body);
      setEditorOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      if (!handleError(err)) setFormError(err instanceof Error ? err.message : "Could not save this item.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: Record<string, unknown>) {
    if (!window.confirm(`Delete this ${config.singular}? This cannot be undone.`)) return;
    try {
      await adminDelete(config.key, String(row.id));
      setRows((current) => current.filter((item) => item.id !== row.id));
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not delete this item.");
    }
  }

  function renderCell(row: Record<string, unknown>, key: string) {
    const value = row[key];
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>{config.key[0].toUpperCase() + config.key.slice(1)}</h2>
        <button className="button button-orange" type="button" onClick={openCreate}>
          <Plus size={14} /> New {config.singular}
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading records" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <p className="admin-muted">No records yet. Create the first one.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {config.columns.map((column) => <th key={column.key}>{column.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  {config.columns.map((column) => (
                    <td key={column.key}>{renderCell(row, column.key)}</td>
                  ))}
                  <td className="admin-table-actions">
                    <button type="button" onClick={() => openEdit(row)}>Edit</button>
                    <button type="button" onClick={() => void remove(row)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorOpen ? (
        <div className="admin-editor" role="dialog" aria-modal="true">
          <div className="admin-editor-card">
            <header>
              <h3>{editing ? `Edit ${config.singular}` : `New ${config.singular}`}</h3>
              <button type="button" aria-label="Close" onClick={() => setEditorOpen(false)}><X size={18} /></button>
            </header>
            <form onSubmit={handleSubmit} key={editing ? String(editing.id) : "new"}>
              <div className="admin-editor-fields">
                {config.fields.map((field) => (
                  <label key={field.name} className={field.type === "textarea" || field.type === "json" || field.type === "media" ? "is-wide" : ""}>
                    <span>{field.label}</span>
                    {field.type === "textarea" || field.type === "json" ? (
                      <textarea
                        name={field.name}
                        rows={field.type === "json" ? 4 : 3}
                        required={field.required}
                        placeholder={field.placeholder}
                        defaultValue={fromRecord(field, editing) as string}
                      />
                    ) : field.name === "event_id" && config.key === "gallery" ? (
                      <select name={field.name} defaultValue={fromRecord(field, editing) as string}>
                        <option value="">Not linked to an event</option>
                        {eventOptions.map((event) => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    ) : field.type === "select" ? (
                      <select name={field.name} defaultValue={(fromRecord(field, editing) as string) || field.options?.[0]}>
                        {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "checkbox" ? (
                      <input type="checkbox" name={field.name} defaultChecked={Boolean(fromRecord(field, editing))} />
                    ) : field.type === "media" ? (
                      <MediaUploadField
                        field={field}
                        initialValue={fromRecord(field, editing) as string}
                        onSessionEnd={onSessionEnd}
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
                        required={field.required}
                        placeholder={field.placeholder}
                        defaultValue={fromRecord(field, editing) as string}
                      />
                    )}
                  </label>
                ))}
              </div>
              {formError ? <p className="form-message error" role="alert">{formError}</p> : null}
              <div className="admin-editor-actions">
                <button className="button button-outline" type="button" onClick={() => setEditorOpen(false)}>Cancel</button>
                <button className="button button-orange" type="submit" disabled={busy}>
                  {busy ? "SAVING…" : "SAVE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MediaUploadField({
  field,
  initialValue,
  onSessionEnd,
}: {
  field: Field;
  initialValue: string;
  onSessionEnd: () => void;
}) {
  const handleError = useSessionGuard(onSessionEnd);
  const [value, setValue] = useState(initialValue);
  const [preview, setPreview] = useState(
    initialValue.startsWith("/") || /^https:\/\//i.test(initialValue) ? initialValue : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value || value.startsWith("/") || /^https:\/\//i.test(value)) return;
    let active = true;
    adminMediaPreview(value)
      .then((url) => { if (active) setPreview(url); })
      .catch(() => { if (active) setPreview(""); });
    return () => { active = false; };
  }, [value]);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await adminUploadMedia(file);
      setValue(result.path);
      setPreview(result.previewUrl);
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not upload this image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-media-field">
      <input type="hidden" name={field.name} value={value} />
      {preview && <img className="admin-media-preview" src={preview} alt={`${field.label} preview`} />}
      <div className="admin-media-actions">
        <label className="button button-outline admin-media-picker">
          {busy ? "UPLOADING…" : value ? "REPLACE IMAGE" : "UPLOAD IMAGE"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              void upload(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
        {value && (
          <button
            className="admin-media-remove"
            type="button"
            onClick={() => {
              setValue("");
              setPreview("");
              setError("");
            }}
          >
            <Trash2 size={13} /> Remove image
          </button>
        )}
      </div>
      {error && <span className="admin-media-error" role="alert">{error}</span>}
      <small className="admin-muted">JPG, PNG or WebP · up to 50 MB · image descriptions go in the caption/alt text field.</small>
    </div>
  );
}

/* --------------------------------------------------------------- settings */

function SettingsPanel({ onSessionEnd }: { onSessionEnd: () => void }) {
  const handleError = useSessionGuard(onSessionEnd);
  const [rows, setRows] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    adminSettings()
      .then(setRows)
      .catch((err: unknown) => {
        if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not load settings.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function save(key: string, rawValue: string, rawPublic: FormDataEntryValue | null) {
    let value: unknown = rawValue;
    try {
      value = JSON.parse(rawValue);
    } catch {
      /* keep as a plain string */
    }
    try {
      const updated = await adminUpdateSetting(key, value, rawPublic !== null);
      setRows((current) => current.map((row) => (row.key === key ? updated : row)));
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not update this setting.");
    }
  }

  if (loading) return <LoadingState label="Loading settings" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>Community settings</h2>
        <span className="admin-muted">Public settings power live counters like project count.</span>
      </div>
      {rows.length === 0 ? (
        <p className="admin-muted">No settings stored yet.</p>
      ) : (
        <div className="settings-list">
          {rows.filter((row) => row.key !== "social_links").map((row) => (
            <SettingRow key={row.key} row={row} onSave={save} />
          ))}
        </div>
      )}
      <SocialSettingsEditor
        initialValue={rows.find((row) => row.key === "social_links")?.value}
        onSessionEnd={onSessionEnd}
        onSaved={(updated) => setRows((current) => [
          ...current.filter((row) => row.key !== updated.key),
          updated,
        ])}
      />
    </section>
  );
}

function SocialSettingsEditor({
  initialValue,
  onSessionEnd,
  onSaved,
}: {
  initialValue: unknown;
  onSessionEnd: () => void;
  onSaved: (setting: AdminSetting) => void;
}) {
  const handleError = useSessionGuard(onSessionEnd);
  const [links, setLinks] = useState<CommunitySocialLink[]>(() => {
    if (Array.isArray(initialValue)) return initialValue as CommunitySocialLink[];
    return DEFAULT_SOCIAL_LINKS.map((link) => ({ ...link }));
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialValue)) setLinks(initialValue as CommunitySocialLink[]);
  }, [initialValue]);

  async function persist() {
    const normalized = links.map((link, index) => ({
      ...link,
      id: link.id.trim() || `${link.platform.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
      platform: link.platform.trim(),
      handle: link.handle.trim(),
      url: link.url.trim(),
      order: Number.isFinite(Number(link.order)) ? Number(link.order) : index + 1,
    }));
    if (normalized.some((link) => !link.platform || !link.handle || !link.url)) {
      setError("Complete the platform, handle and profile URL for each link, or remove the unfinished row.");
      return;
    }
    if (normalized.some((link) => {
      try {
        return new URL(link.url).protocol !== "https:";
      } catch {
        return true;
      }
    })) {
      setError("Social links must use valid HTTPS URLs.");
      return;
    }

    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const updated = await adminUpdateSetting("social_links", normalized, true);
      setLinks(normalized);
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      if (!handleError(err)) setError(err instanceof Error ? err.message : "Could not save social links.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="social-admin">
      <div className="admin-section-head">
        <div>
          <h3>Community social links</h3>
          <span className="admin-muted">Only enabled, verified HTTPS destinations appear publicly.</span>
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => {
            setLinks((current) => [...current, {
              id: `social-${Date.now()}`,
              platform: "",
              handle: "",
              url: "",
              order: current.length + 1,
              enabled: true,
            }]);
            setSaved(false);
          }}
        >
          <Plus size={14} /> Add link
        </button>
      </div>
      {links.length === 0 ? (
        <p className="admin-muted">No social links configured. Add a verified community profile above.</p>
      ) : (
        <div className="social-admin-list">
          {links.map((link, index) => (
            <div className="social-admin-row" key={link.id || index}>
              <label>
                <span>Platform</span>
                <input value={link.platform} onChange={(event) => setLinks((items) => items.map((item, i) => i === index ? { ...item, platform: event.target.value } : item))} />
              </label>
              <label>
                <span>Handle or descriptor</span>
                <input value={link.handle} onChange={(event) => setLinks((items) => items.map((item, i) => i === index ? { ...item, handle: event.target.value } : item))} />
              </label>
              <label className="is-wide">
                <span>Profile URL (HTTPS)</span>
                <input type="url" value={link.url} onChange={(event) => setLinks((items) => items.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} />
              </label>
              <label>
                <span>Display order</span>
                <input type="number" min="1" value={link.order} onChange={(event) => setLinks((items) => items.map((item, i) => i === index ? { ...item, order: Number(event.target.value) } : item))} />
              </label>
              <label className="social-admin-enabled">
                <span>Enabled</span>
                <input type="checkbox" checked={link.enabled} onChange={(event) => setLinks((items) => items.map((item, i) => i === index ? { ...item, enabled: event.target.checked } : item))} />
              </label>
              <button
                className="social-admin-remove"
                type="button"
                aria-label={`Remove ${link.platform || "social link"}`}
                onClick={() => {
                  setLinks((items) => items.filter((_, i) => i !== index));
                  setSaved(false);
                }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="form-message error" role="alert">{error}</p>}
      {saved && <p className="form-message success" role="status">Social links saved.</p>}
      <button className="button button-orange" type="button" onClick={() => void persist()} disabled={busy}>
        <Save size={14} /> {busy ? "SAVING…" : "SAVE SOCIAL LINKS"}
      </button>
    </div>
  );
}

function SettingRow({
  row,
  onSave,
}: {
  row: AdminSetting;
  onSave: (key: string, rawValue: string, rawPublic: FormDataEntryValue | null) => void;
}) {
  const [value, setValue] = useState(() =>
    typeof row.value === "string" ? row.value : JSON.stringify(row.value),
  );
  return (
    <div className="setting-row">
      <div className="setting-key">
        <code>{row.key}</code>
        <small>{formatDateTime(row.updated_at)}</small>
      </div>
      <textarea rows={2} value={value} onChange={(event) => setValue(event.target.value)} />
      <div className="setting-actions">
        <label className="consent-label">
          <input type="checkbox" defaultChecked={row.is_public} data-public={`public-${row.key}`} /> Public
        </label>
        <button
          className="button button-outline"
          type="button"
          onClick={(event) => {
            const scope = event.currentTarget.parentElement;
            const checkbox = scope?.querySelector<HTMLInputElement>("input[type=checkbox]") ?? null;
            onSave(row.key, value, checkbox && checkbox.checked ? "on" : null);
          }}
        >
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}
