import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarDays, Share2 } from "lucide-react";
import { ErrorState, LoadingState } from "../components/Page";
import Reveal from "../components/Reveal";
import { getAnnouncementBySlug } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import { formatDate } from "../lib/format";
import type { Announcement } from "../lib/types";

export default function UpdateDetail() {
  const { slug = "" } = useParams();
  const { data, loading, error } = useAsync<Announcement>((signal) => getAnnouncementBySlug(slug, signal), [slug]);
  useDocumentTitle(data ? data.title : "Update");

  if (loading) {
    return (
      <section className="section-pad content-section">
        <LoadingState label="Loading update" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="section-pad content-section">
        <ErrorState title="Update not found" message={error ?? "This update could not be found."} />
        <div className="profile-back">
          <Link className="text-link" to="/updates">
            <ArrowLeft size={14} /> Back to all updates
          </Link>
        </div>
      </section>
    );
  }

  const update = data;

  return (
    <article className="section-pad content-section update-detail">
      <div className="profile-back top">
        <Link className="text-link" to="/updates">
          <ArrowLeft size={14} /> All updates
        </Link>
      </div>

      <Reveal as="header" className="update-detail-head">
        <span className="update-card-meta">
          {update.category}
          {update.priority === "important" ? " · IMPORTANT" : ""}
        </span>
        <h1>{update.title}</h1>
        <div className="update-detail-meta">
          <span>
            <CalendarDays size={14} /> {update.published_at ? formatDate(update.published_at) : "Community note"}
          </span>
          {update.external_url && (
            <a className="text-link" href={update.external_url} target="_blank" rel="noreferrer">
              <Share2 size={13} /> Open external link <ArrowUpRight size={12} />
            </a>
          )}
        </div>
      </Reveal>

      {update.cover_image_url && (
        <Reveal className="update-detail-image" variant="blur" delay={100}>
          <img src={update.cover_image_url} alt="" />
        </Reveal>
      )}

      <Reveal className="update-detail-body" delay={160}>
        {update.description.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </Reveal>

      <div className="event-detail-foot">
        <Link className="text-link" to="/updates">
          <ArrowLeft size={14} /> Back to all updates
        </Link>
        <Link className="text-link" to="/events">
          Explore events <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
}
