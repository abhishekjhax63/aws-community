import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, KeyRound, LogOut, Save, Ticket, UserRound } from "lucide-react";
import { ErrorState, LoadingState, PageHero } from "../components/Page";
import { getMyProfile, getMyRegistrations, updateMyProfile } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useDocumentTitle } from "../lib/hooks";
import { formatDate, humanizeStatus, initialsFor } from "../lib/format";
import type { RegistrationSummary, StudentProfile } from "../lib/types";

export default function Profile() {
  useDocumentTitle("Your student profile");
  const { user, session, signOut } = useAuth();
  const token = session?.access_token ?? "";

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getMyProfile(token), getMyRegistrations(token)])
      .then(([nextProfile, nextRegistrations]) => {
        if (!active) return;
        setProfile(nextProfile);
        setRegistrations(nextRegistrations);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "We couldn't load your profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const clean = (key: string) => {
      const value = String(values[key] ?? "").trim();
      return value === "" ? null : value;
    };
    setSaving(true);
    setNotice("");
    setSaveError("");
    try {
      const updated = await updateMyProfile(token, {
        display_name: clean("display_name"),
        full_name: clean("full_name"),
        course: clean("course"),
        department: clean("department"),
        academic_year: clean("academic_year"),
        photo_url: clean("photo_url"),
      });
      setProfile(updated);
      setNotice("Your profile has been updated.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "We couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.full_name || profile?.display_name || user?.email?.split("@")[0] || "Student";

  return (
    <>
      <PageHero
        index="PROFILE"
        eyebrow="STUDENT ACCOUNT"
        title="Your builder"
        highlight="profile."
        intro="Keep your student details up to date, review the events you have registered for, and manage your account in one place."
      />

      <section className="section-pad content-section">
        {loading ? (
          <LoadingState label="Loading your profile" />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="profile-grid">
            <div className="profile-card">
              <div className="profile-identity">
                <span className="profile-avatar">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt={displayName} />
                  ) : (
                    initialsFor(displayName)
                  )}
                </span>
                <div>
                  <span className="empty-overline">SIGNED IN AS</span>
                  <h2>{displayName}</h2>
                  <p className="profile-email">{user?.email}</p>
                </div>
              </div>

              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-fields">
                  <label>
                    <span>FULL NAME</span>
                    <input name="full_name" defaultValue={profile?.full_name ?? ""} maxLength={120} placeholder="Your full name" />
                  </label>
                  <label>
                    <span>DISPLAY NAME</span>
                    <input name="display_name" defaultValue={profile?.display_name ?? ""} maxLength={120} placeholder="How we should address you" />
                  </label>
                  <label>
                    <span>COURSE</span>
                    <input name="course" defaultValue={profile?.course ?? ""} maxLength={160} placeholder="e.g. B.Tech CSE" />
                  </label>
                  <label>
                    <span>DEPARTMENT</span>
                    <input name="department" defaultValue={profile?.department ?? ""} maxLength={160} placeholder="e.g. Computer Science" />
                  </label>
                  <label>
                    <span>ACADEMIC YEAR</span>
                    <input name="academic_year" defaultValue={profile?.academic_year ?? ""} maxLength={40} placeholder="e.g. 3rd Year" />
                  </label>
                  <label>
                    <span>PROFILE PHOTO URL</span>
                    <input name="photo_url" defaultValue={profile?.photo_url ?? ""} maxLength={1024} placeholder="https://…" />
                  </label>
                </div>

                {notice ? <p className="form-message success">{notice}</p> : null}
                {saveError ? <p className="form-message error" role="alert">{saveError}</p> : null}

                <button className="button button-orange" type="submit" disabled={saving}>
                  {saving ? "SAVING…" : "SAVE CHANGES"} <Save size={15} />
                </button>
              </form>
            </div>

            <aside className="profile-side">
              <div className="profile-panel">
                <div className="profile-panel-head">
                  <Ticket size={16} />
                  <span>YOUR EVENT REGISTRATIONS</span>
                </div>
                {registrations.length === 0 ? (
                  <div className="profile-empty">
                    <p>You haven&apos;t registered for an event yet.</p>
                    <Link className="text-link" to="/events">
                      Browse upcoming events <ArrowUpRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <ul className="registration-list">
                    {registrations.map((item) => (
                      <li className="registration-item" key={item.id}>
                        <div>
                          {item.event_slug ? (
                            <Link to={`/events/${item.event_slug}`}>{item.event_title ?? "Event"}</Link>
                          ) : (
                            <span>{item.event_title ?? "Event"}</span>
                          )}
                          <small>
                            {item.registration_code} · {formatDate(item.created_at)}
                          </small>
                        </div>
                        <span className={`status-badge status-${item.status}`}>{humanizeStatus(item.status)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="profile-panel">
                <div className="profile-panel-head">
                  <UserRound size={16} />
                  <span>ACCOUNT SETTINGS</span>
                </div>
                <p className="profile-note">
                  Signed in with Supabase Auth. Changing your password sends a secure recovery link to your email.
                </p>
                <div className="profile-actions">
                  <Link className="button button-outline" to="/auth/forgot-password">
                    <KeyRound size={15} /> Change password
                  </Link>
                  <button className="button button-outline" type="button" onClick={() => void signOut()}>
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
