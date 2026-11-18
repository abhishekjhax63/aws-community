import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Clock, ImageOff, MapPin } from "lucide-react";
import { ErrorState, LoadingState, PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import { getEvents } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import { formatDate, formatDateTime, humanizeStatus } from "../lib/format";
import { eventCategories } from "../data/content";
import type { CommunityEvent } from "../lib/types";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "registration_open", label: "Registration Open" },
  { id: "completed", label: "Completed" },
] as const;

function matchesStatus(event: CommunityEvent, filterId: string, now: number) {
  if (filterId === "all") return true;
  if (filterId === "upcoming") return new Date(event.starts_at).getTime() >= now;
  if (filterId === "completed") {
    return event.registration_status === "completed" || new Date(event.starts_at).getTime() < now;
  }
  return event.registration_status === filterId;
}

export default function Events() {
  useDocumentTitle("Events");
  const { data, loading, error } = useAsync<CommunityEvent[]>((signal) => getEvents(signal), []);
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const now = Date.now();

  const events = data ?? [];
  const categories = useMemo(() => {
    const fromData = events.map((event) => event.category).filter(Boolean);
    return Array.from(new Set([...eventCategories, ...fromData]));
  }, [events]);

  const visible = events.filter(
    (event) =>
      matchesStatus(event, status, now) && (category === "all" || event.category === category),
  );

  return (
    <>
      <PageHero
        index="EVENTS"
        eyebrow="WHAT'S HAPPENING"
        title="Learn something."
        highlight="Build something."
        intro="Workshops, cloud bootcamps, hackathons, tech talks and meetups. Register for what excites you — details and seats live on each event page."
      />

      <section className="section-pad content-section">
        <div className="event-filter-bar">
          <div className="gallery-filters" role="group" aria-label="Filter events by status">
            {STATUS_FILTERS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={status === item.id ? "is-active" : ""}
                onClick={() => setStatus(item.id)}
              >
                {item.label.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="event-category-select">
            <span>CATEGORY</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingState label="Loading events" />
        ) : error ? (
          <ErrorState message={error} />
        ) : visible.length === 0 ? (
          <div className="page-state page-state-empty">
            <span className="empty-overline">NO EVENTS IN THIS VIEW</span>
            <h3>Nothing here just yet.</h3>
            <p>Try another filter, or suggest an event you&apos;d like the community to host.</p>
            <Link className="text-link" to="/suggestions">
              Suggest an event <ArrowUpRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="event-grid">
            {visible.map((event, index) => (
              <Reveal className="event-card" key={event.id} delay={(index % 3) * 60}>
                <Link className="event-image" to={`/events/${event.slug}`}>
                  {event.cover_image_url ? (
                    <img src={event.cover_image_url} alt="" loading="lazy" />
                  ) : (
                    <span className="event-image-empty">
                      <ImageOff size={26} />
                    </span>
                  )}
                  <span className="event-image-date">{formatDate(event.starts_at)}</span>
                </Link>
                <div className="event-card-body">
                  <div className="event-meta">
                    <span>{event.category}</span>
                    <span className={`status-badge status-${event.registration_status}`}>
                      {humanizeStatus(event.registration_status)}
                    </span>
                  </div>
                  <h3>
                    <Link to={`/events/${event.slug}`}>{event.title}</Link>
                  </h3>
                  <p>{event.short_description}</p>
                  <div className="event-facts">
                    <span>
                      <Clock size={12} /> {formatDateTime(event.starts_at)}
                    </span>
                    {event.venue && (
                      <span>
                        <MapPin size={12} /> {event.venue}
                      </span>
                    )}
                  </div>
                  <Link className="text-link event-arrow" to={`/events/${event.slug}`}>
                    View event details <ArrowUpRight size={14} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <div className="members-foot">
          <p>Don&apos;t see the event you want? Tell us what to host next.</p>
          <Link className="button button-orange" to="/suggestions">
            <CalendarDays size={15} /> Suggest an event
          </Link>
        </div>
      </section>
    </>
  );
}
