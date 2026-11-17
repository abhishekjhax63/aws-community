import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import { ErrorState, LoadingState } from "../components/Page";
import { getEventBySlug, getMyProfile, registerForEvent } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { useDocumentTitle } from "../lib/hooks";
import { formatDate, formatDateTime, humanizeStatus } from "../lib/format";
import type { CommunityEvent, StudentProfile } from "../lib/types";

type Status = "idle" | "sending" | "success" | "error";

export default function EventDetail() {
  const { slug = "" } = useParams();
  const { session } = useAuth();
  const { data, loading, error } = useAsync<CommunityEvent>((signal) => getEventBySlug(slug, signal), [slug]);
  useDocumentTitle(data ? data.title : "Event details");

  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    let active = true;
    getMyProfile(session.access_token)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [session]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setStatus("sending");
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const result = await registerForEvent(
        data.id,
        {
          ...values,
          consent_given: values.consent_given === "on",
        },
        session?.access_token ?? null,
      );
      setCode(result.registration_id);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "We couldn't complete your registration.");
    }
  }

  if (loading) {
    return (
      <section className="section-pad content-section">
        <LoadingState label="Loading event" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="section-pad content-section">
        <ErrorState message={error ?? "This event could not be found."} />
        <div className="profile-back">
          <Link className="text-link" to="/events">
            <ArrowLeft size={14} /> Back to all events
          </Link>
        </div>
      </section>
    );
  }

  const event = data;
  const seatsLeft =
    event.capacity === null ? null : Math.max(0, event.capacity);
  const registrationOpen = event.registration_status === "registration_open";

  return (
    <>
      <section className="event-hero">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt="" className="event-hero-image" />
        ) : (
          <div className="event-hero-image placeholder" aria-hidden="true" />
        )}
        <div className="event-hero-overlay" />
        <div className="event-hero-content section-pad">
          <Link className="text-link text-link-light" to="/events">
            <ArrowLeft size={14} /> All events
          </Link>
          <div className="event-hero-meta">
            <span>{event.category}</span>
            <span className="status-chip">{humanizeStatus(event.registration_status)}</span>
          </div>
          <h1>{event.title}</h1>
          <div className="event-hero-facts">
            <span>
              <CalendarDays size={14} /> {formatDate(event.starts_at)}
            </span>
            <span>
              <Clock size={14} /> {formatDateTime(event.starts_at)}
            </span>
            {event.venue && (
              <span>
                <MapPin size={14} /> {event.venue}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad content-section event-detail-section">
        <div className="event-detail-grid">
          <div className="event-detail-main">
            <p className="event-lede">{event.short_description}</p>
            {event.full_description && (
              <div className="event-description">
                {event.full_description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {event.agenda.length > 0 && (
              <div className="event-block">
                <h2>Agenda</h2>
                <ol className="event-agenda">
                  {event.agenda.map((item, index) => (
                    <li key={`${item.time || "slot"}-${index}`}>
                      <span className="agenda-time">{item.time || `SESSION ${index + 1}`}</span>
                      <div>
                        <strong>{item.title || "Session"}</strong>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {event.speakers.length > 0 && (
              <div className="event-block">
                <h2>Speakers</h2>
                <div className="event-speakers">
                  {event.speakers.map((speaker, index) => (
                    <div className="event-speaker" key={`${speaker.name || "speaker"}-${index}`}>
                      <strong>{speaker.name || "Guest speaker"}</strong>
                      {speaker.role && <span>{speaker.role}</span>}
                      {speaker.bio && <p>{speaker.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.important_instructions && (
              <div className="event-block event-instructions">
                <h2>Important instructions</h2>
                <p>{event.important_instructions}</p>
              </div>
            )}
          </div>

          <aside className="event-detail-side">
            <div className="event-side-card">
              <h3>Event details</h3>
              <dl>
                <div>
                  <dt>STARTS</dt>
                  <dd>{formatDateTime(event.starts_at)}</dd>
                </div>
                {event.ends_at && (
                  <div>
                    <dt>ENDS</dt>
                    <dd>{formatDateTime(event.ends_at)}</dd>
                  </div>
                )}
                {event.venue && (
                  <div>
                    <dt>VENUE</dt>
                    <dd>{event.venue}</dd>
                  </div>
                )}
                {event.eligibility && (
                  <div>
                    <dt>ELIGIBILITY</dt>
                    <dd>{event.eligibility}</dd>
                  </div>
                )}
                <div>
                  <dt>CAPACITY</dt>
                  <dd>{event.capacity === null ? "Open" : `${event.capacity} seats`}</dd>
                </div>
                {event.registration_deadline && (
                  <div>
                    <dt>REGISTER BY</dt>
                    <dd>{formatDate(event.registration_deadline)}</dd>
                  </div>
                )}
                <div>
                  <dt>STATUS</dt>
                  <dd>{humanizeStatus(event.registration_status)}</dd>
                </div>
              </dl>

              {seatsLeft !== null && (
                <p className="event-seats">
                  <Users size={14} /> Up to {seatsLeft} participants
                </p>
              )}

              {registrationOpen ? (
                <button className="button button-orange event-register-button" type="button" onClick={() => setShowForm(true)}>
                  <Ticket size={15} /> Register now
                </button>
              ) : (
                <button className="button event-register-button disabled" type="button" disabled>
                  Registration closed
                </button>
              )}
              {!session && registrationOpen && (
                <p className="event-login-hint">
                  <Link to="/auth/login">Sign in</Link> to prefill your details.
                </p>
              )}
            </div>
          </aside>
        </div>

        {showForm && registrationOpen && (
          <div className="registration-panel" id="register">
            {status === "success" ? (
              <div className="registration-success inline">
                <span className="success-mark">
                  <Check size={22} />
                </span>
                <span className="empty-overline">REGISTRATION RECEIVED</span>
                <h2>
                  You&apos;re on
                  <br />
                  the list.
                </h2>
                <p>
                  Your registration for <b>{event.title}</b> has been saved.
                </p>
                <div className="registration-code">
                  <span>YOUR REGISTRATION ID</span>
                  <strong>{code}</strong>
                </div>
                <div className="registration-success-actions">
                  <Link className="button button-orange" to="/profile">
                    View my registration <ArrowRight size={15} />
                  </Link>
                  <button className="text-link" type="button" onClick={() => { setShowForm(false); setStatus("idle"); }}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form className="registration-form panel" onSubmit={handleRegister}>
                <div className="registration-panel-head">
                  <div>
                    <span className="eyebrow">SAVE YOUR PLACE</span>
                    <h2>Event registration</h2>
                  </div>
                  <button className="text-link" type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>

                <label htmlFor="reg-name">FULL NAME</label>
                <input
                  id="reg-name"
                  name="full_name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  defaultValue={profile?.full_name || profile?.display_name || ""}
                />
                <label htmlFor="reg-email">COLLEGE EMAIL</label>
                <input
                  id="reg-email"
                  name="college_email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  defaultValue={session?.user.email ?? ""}
                />
                <label htmlFor="reg-phone">CONTACT NUMBER</label>
                <input id="reg-phone" name="contact_number" type="tel" required minLength={7} maxLength={24} autoComplete="tel" />
                <div className="registration-field-pair">
                  <div>
                    <label htmlFor="reg-course">COURSE</label>
                    <input id="reg-course" name="course" required maxLength={120} defaultValue={profile?.course ?? ""} />
                  </div>
                  <div>
                    <label htmlFor="reg-department">DEPARTMENT</label>
                    <input id="reg-department" name="department" required maxLength={120} defaultValue={profile?.department ?? ""} />
                  </div>
                </div>
                <div className="registration-field-pair">
                  <div>
                    <label htmlFor="reg-year">ACADEMIC YEAR</label>
                    <input id="reg-year" name="academic_year" required maxLength={40} placeholder="e.g. Year 2" defaultValue={profile?.academic_year ?? ""} />
                  </div>
                  <div>
                    <label htmlFor="reg-student-id">STUDENT ID (OPTIONAL)</label>
                    <input id="reg-student-id" name="student_id" maxLength={80} />
                  </div>
                </div>
                <label htmlFor="reg-note">WHY WOULD YOU LIKE TO PARTICIPATE? (OPTIONAL)</label>
                <textarea id="reg-note" name="participation_note" rows={2} maxLength={1000} />
                <label className="consent-label">
                  <input name="consent_given" type="checkbox" required /> I agree to share these details with the event organizers for registration purposes.
                </label>

                {status === "error" && message ? (
                  <p className="form-message error" role="alert">
                    {message}
                  </p>
                ) : null}

                <button className="button button-orange registration-submit" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "SENDING…" : "REGISTER NOW"} <ArrowRight size={15} />
                </button>
                <small className="privacy-note">Your registration details are private and are not shown publicly.</small>
              </form>
            )}
          </div>
        )}

        <div className="event-detail-foot">
          <Link className="text-link" to="/events">
            <ArrowLeft size={14} /> Back to all events
          </Link>
          <Link className="text-link" to="/suggestions">
            Suggest an event <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
