import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { teams } from "../data/content";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Teams carousel with three faces on each slide — Leadership (the team
 * leader first), Media & Design, then Events & Outreach. It advances on
 * its own and can be driven manually with the arrow buttons or the dots.
 * Autoplay pauses while the pointer is over the card and for users who
 * prefer reduced motion.
 */
export default function TeamCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = ((index % teams.length) + teams.length) % teams.length;
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (slide) {
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
    setActive(clamped);
  };

  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setActive((curr) => {
        const nextIdx = (curr + 1) % teams.length;
        const track = trackRef.current;
        const slide = track?.children[nextIdx] as HTMLElement | undefined;
        if (track && slide) {
          track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
        }
        return nextIdx;
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div
      className="team-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="team-carousel-head">
        <div>
          <span className="team-carousel-eyebrow">{teams[active].name.toUpperCase()}</span>
          <p className="team-carousel-tagline">{teams[active].tagline}</p>
        </div>
        <div className="team-carousel-controls">
          <button type="button" onClick={prev} aria-label="Previous team">
            <ArrowLeft size={16} />
          </button>
          <button type="button" onClick={next} aria-label="Next team">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="team-carousel-track" ref={trackRef} onScroll={onScroll}>
        {teams.map((team) => (
          <div className="team-slide" key={team.id}>
            <div className="team-members-grid">
              {team.members.map((member, i) => (
                <article
                  className={`team-member-card${member.placeholder ? " is-placeholder" : ""}`}
                  key={`${team.id}-${i}`}
                >
                  <div className="team-member-photo">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} loading="lazy" />
                    ) : (
                      <span className="team-member-avatar">
                        {member.placeholder ? "?" : initials(member.name)}
                      </span>
                    )}
                  </div>
                  <div className="team-member-info">
                    <span className="team-member-role">{member.role}</span>
                    <h3>{member.name}</h3>
                    {member.bio && <p>{member.bio}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="team-carousel-dots">
        {teams.map((team, i) => (
          <button
            type="button"
            key={team.id}
            className={i === active ? "is-active" : ""}
            onClick={() => goTo(i)}
            aria-label={`Go to ${team.name} team`}
          />
        ))}
      </div>
    </div>
  );
}
