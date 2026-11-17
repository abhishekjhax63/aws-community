import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Sparkles, X } from "lucide-react";
import { ErrorState, LoadingState, PageHero } from "../components/Page";
import { getGallery } from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useDocumentTitle } from "../lib/hooks";
import type { GalleryItem } from "../lib/types";

export default function Gallery() {
  useDocumentTitle("Event gallery");
  const { data, loading, error } = useAsync<GalleryItem[]>((signal) => getGallery(signal), []);
  const [category, setCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const items = data ?? [];
  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))),
    [items],
  );
  const visible = category === "all" ? items : items.filter((item) => item.category === category);

  const active = activeIndex === null ? null : visible[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index === null ? null : (index + 1) % visible.length));
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index === null ? null : (index - 1 + visible.length) % visible.length));
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [activeIndex, visible.length]);

  return (
    <>
      <PageHero
        index="GALLERY"
        eyebrow="THE BUILDER'S JOURNAL"
        title="Make space"
        highlight="for the moments."
        intro="A visual log of the people, ideas, and hands-on learning that bring this community together."
      />

      <section className="section-pad content-section">
        {categories.length > 1 && (
          <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
            <button type="button" className={category === "all" ? "is-active" : ""} onClick={() => setCategory("all")}>
              ALL
            </button>
            {categories.map((item) => (
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
        )}

        {loading ? (
          <LoadingState label="Loading gallery" />
        ) : error ? (
          <ErrorState message={error} />
        ) : visible.length === 0 ? (
          <div className="gallery-grid">
            <div className="gallery-reel">
              <video src="/assets/community-reel.mp4" poster="/assets/sbg-banner.jpg" controls muted playsInline preload="metadata" aria-label="AWS Student Builder Group community reel" />
              <span className="gallery-reel-label">01 / COMMUNITY REEL</span>
            </div>
            <div className="gallery-empty">
              <span className="empty-overline">THE VISUAL JOURNAL</span>
              <h3>
                First moments
                <br />
                are still ahead.
              </h3>
              <p>Approved community photos and videos will find a home here. This space will grow as we build together.</p>
              <span className="gallery-empty-mark">
                <Sparkles size={19} />
              </span>
            </div>
          </div>
        ) : (
          <div className="gallery-masonry">
            {visible.map((item, index) => (
              <button
                className={item.media_type === "video" ? "gallery-tile is-video" : "gallery-tile"}
                type="button"
                key={item.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`Open ${item.title || item.caption || "community moment"}`}
              >
                {item.media_type === "video" ? (
                  <>
                    <video src={item.media_url} poster={item.thumbnail_url ?? undefined} muted preload="metadata" />
                    <span className="gallery-play">
                      <Play size={18} />
                    </span>
                  </>
                ) : (
                  <img src={item.media_url} alt={item.caption || item.title || "Community gallery"} loading="lazy" />
                )}
                <span className="gallery-tile-caption">
                  <span>{item.category}</span>
                  <h3>{item.title || item.caption || "Community moment"}</h3>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <figure className="lightbox" role="dialog" aria-modal="true" aria-label={active.title || active.caption || "Community gallery"}>
            <button className="dialog-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Close image">
              <X size={20} />
            </button>
            {visible.length > 1 && (
              <>
                <button
                  className="lightbox-nav prev"
                  type="button"
                  aria-label="Previous"
                  onClick={() => setActiveIndex((index) => (index === null ? null : (index - 1 + visible.length) % visible.length))}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  className="lightbox-nav next"
                  type="button"
                  aria-label="Next"
                  onClick={() => setActiveIndex((index) => (index === null ? null : (index + 1) % visible.length))}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
            {active.media_type === "video" ? (
              <video src={active.media_url} poster={active.thumbnail_url ?? undefined} controls autoPlay playsInline />
            ) : (
              <img src={active.media_url} alt={active.caption || active.title || "Community gallery"} />
            )}
            <figcaption>
              <span>{active.category}</span>
              <h3>{active.title || active.caption || "Community moment"}</h3>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
