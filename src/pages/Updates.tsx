import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ErrorState, LoadingState, PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import { getAnnouncements } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import { formatDate } from "../lib/format";
import { updateCategories } from "../data/content";
import type { Announcement } from "../lib/types";

export default function Updates() {
  useDocumentTitle("Updates & announcements");
  const { data, loading, error } = useAsync<Announcement[]>((signal) => getAnnouncements(signal), []);
  const [category, setCategory] = useState("all");

  const announcements = data ?? [];
  const categories = useMemo(
    () => Array.from(new Set(announcements.map((item) => item.category).filter(Boolean))),
    [announcements],
  );
  const filterList = categories.length > 0 ? categories : [...updateCategories];
  const visible = category === "all" ? announcements : announcements.filter((item) => item.category === category);

  return (
    <>
      <PageHero
        index="UPDATES"
        eyebrow="NEWS FROM THE BUILDERS"
        title="Notes from"
        highlight="the community."
        intro="Announcements, learning opportunities, registration updates, achievements and everything else worth sharing."
      />

      <section className="section-pad content-section">
        <div className="gallery-filters" role="group" aria-label="Filter updates by category">
          <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}>
            ALL
          </button>
          {filterList.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? "is-active" : ""}
              onClick={() => setCategory(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState label="Loading updates" />
        ) : error ? (
          <ErrorState message={error} />
        ) : visible.length === 0 ? (
          <div className="page-state page-state-empty">
            <span className="empty-overline">WHEN THERE&apos;S SOMETHING TO SHARE</span>
            <h3>Good things take a little building.</h3>
            <p>Community announcements and event updates will appear here when published.</p>
          </div>
        ) : (
          <div className="updates-grid">
            {visible.map((announcement, index) => (
              <Reveal className="update-card" key={announcement.id} delay={(index % 3) * 60}>
                <div className="update-card-media">
                  {announcement.cover_image_url ? (
                    <img src={announcement.cover_image_url} alt="" loading="lazy" />
                  ) : (
                    <span className="update-card-placeholder" aria-hidden="true" />
                  )}
                  {announcement.priority === "important" && <span className="update-priority">IMPORTANT</span>}
                </div>
                <div className="update-card-body">
                  <span className="update-card-meta">
                    {announcement.category}
                    {announcement.published_at ? ` · ${formatDate(announcement.published_at)}` : ""}
                  </span>
                  <h3>
                    <Link to={`/updates/${announcement.slug}`}>{announcement.title}</Link>
                  </h3>
                  <p>{announcement.description.slice(0, 200)}{announcement.description.length > 200 ? "…" : ""}</p>
                  <div className="update-card-actions">
                    <Link className="text-link" to={`/updates/${announcement.slug}`}>
                      Read update <ArrowUpRight size={13} />
                    </Link>
                    {announcement.external_url && (
                      <a className="text-link" href={announcement.external_url} target="_blank" rel="noreferrer">
                        External link <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
