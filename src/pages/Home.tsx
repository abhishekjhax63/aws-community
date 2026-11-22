import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Lightbulb,
  MapPin,
  Users,
} from "lucide-react";
import Reveal from "../components/Reveal";
import TextReveal from "../components/TextReveal";
import StatNumber from "../components/StatNumber";
import CloudArchitectureAssembly from "../components/CloudArchitectureAssembly";
import LogoAssembly from "../components/LogoAssembly";
import PhotoSlideshow from "../components/PhotoSlideshow";
import SectionMarquee from "../components/SectionMarquee";
import TeamCarousel from "../components/TeamCarousel";
import SuggestionForm from "../components/SuggestionForm";
import {
  getAnnouncements,
  getEvents,
  getGallery,
  getMembers,
  getStats,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useCountdown, useDocumentTitle } from "../lib/hooks";
import { daysUntil, formatDate, initialsFor } from "../lib/format";
import { mergePhotos, photoOnly } from "../data/photos";
import type { Announcement, CommunityEvent, CommunityMember, CommunityStats, GalleryItem } from "../lib/types";

type HomeData = {
  stats: CommunityStats | null;
  events: CommunityEvent[];
  members: CommunityMember[];
  announcements: Announcement[];
  gallery: GalleryItem[];
};

function CountdownPill({ target }: { target: string }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(target);
  if (expired) return <span className="countdown-pill">STARTING SOON</span>;
  return (
    <div className="countdown-pill" aria-label="Time until the event">
      <span>{String(days).padStart(2, "0")}d</span>
      <span>{String(hours).padStart(2, "0")}h</span>
      <span>{String(minutes).padStart(2, "0")}m</span>
      <span>{String(seconds).padStart(2, "0")}s</span>
    </div>
  );
}

export default function Home() {
  useDocumentTitle();

  const { data, loading } = useAsync<HomeData>(async (signal) => {
    const [stats, events, members, announcements, gallery] = await Promise.all([
      getStats(signal).catch(() => null),
      getEvents(signal).catch(() => []),
      getMembers(signal).catch(() => []),
      getAnnouncements(signal).catch(() => []),
      getGallery(signal).catch(() => []),
    ]);
    return { stats, events, members, announcements, gallery };
  }, []);

  const stats = data?.stats ?? null;
  const events = data?.events ?? [];
  const members = data?.members ?? [];
  const announcements = data?.announcements ?? [];

  // Photographs only — no videos, no captions rendered over the images.
  const photos = useMemo(
    () =>
      photoOnly(mergePhotos(data?.gallery ?? [])).map((item) => ({
        src: item.media_url,
        alt: item.title || item.caption || "Community event photograph",
      })),
    [data?.gallery],
  );

  const now = Date.now();
  const featured =
    events.find((event) => new Date(event.starts_at).getTime() >= now) ?? events[0] ?? null;
  const builders = members.filter((member) => member.full_name.toLowerCase() !== "ayush kumar").slice(0, 3);
  const latestUpdates = announcements.slice(0, 3);

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow light-eyebrow">AWS STUDENT BUILDER GROUP</p>
            <h1>
              <TextReveal as="span" mode="word" stagger={60}>
                Don&apos;t Just Learn
              </TextReveal>
              <br />
              <TextReveal as="span" mode="word" stagger={60} delay={180}>
                the Future.
              </TextReveal>
              <br />
              <em>
                <TextReveal as="span" mode="word" stagger={60} delay={360}>
                  Build It.
                </TextReveal>
              </em>
            </h1>
            <p className="hero-intro">
              A student-led community exploring cloud computing, AI and hands-on innovation. Learn
              together, build real projects and create what&apos;s next.
            </p>
            <div className="hero-actions">
              <Link className="button button-orange" to="/auth/signup">
                Join the Community <ArrowRight size={16} />
              </Link>
              <Link className="button button-secondary" to="/events">
                Explore Events <ArrowDownRight size={16} />
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-label="Community event photographs">
            <div className="hero-art-glow" />
            <PhotoSlideshow
              variant="hero"
              photos={photos}
              ariaLabel="Community event photographs"
            />
          </div>
        </div>
      </section>

      <SectionMarquee />

      <CloudArchitectureAssembly />

      {/* Signature: scroll-driven four-piece logo assembly */}
      <LogoAssembly />

      {/* Photo-only cinematic journal band */}
      <section
        className="photo-band section-pad"
        id="community-gallery"
        aria-label="Community photographs"
      >
        <div className="photo-band-head">
          <p className="eyebrow">THE VISUAL JOURNAL</p>
          <h2>
            Moments from <em>our builders.</em>
          </h2>
          <p className="photo-band-note">
            Photographs from our events, workshops and build sessions — nothing added, nothing staged.
          </p>
        </div>
        <div className="photo-band-frame">
          <PhotoSlideshow variant="cinema" photos={photos} ariaLabel="Community event photographs" />
        </div>
      </section>

      {/* B. Upcoming featured event */}
      <section className="feature-section section-pad bg-grid">
        <div className="section-index">
          <span>02</span>
          <span className="index-rule" /> WHAT&apos;S NEXT
        </div>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">UPCOMING FEATURED EVENT</p>
            <h2>
              <TextReveal as="span" mode="word" stagger={55}>
                Meet us
              </TextReveal>
              <br />
              <span>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  in the making.
                </TextReveal>
              </span>
            </h2>
          </div>
          <Link className="text-link" to="/events">
            All events <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="feature-skeleton" aria-hidden="true" />
        ) : featured ? (
          <Reveal className="feature-event">
            <div className="feature-event-media">
              {featured.cover_image_url ? (
                <img src={featured.cover_image_url} alt="" loading="lazy" />
              ) : (
                <div className="feature-event-placeholder" aria-hidden="true">
                  <CalendarDays size={40} />
                </div>
              )}
              <span className="feature-event-badge">{featured.category}</span>
            </div>
            <div className="feature-event-body">
              <div className="event-meta">
                <span>{featured.registration_status.replace(/_/g, " ")}</span>
                {daysUntil(featured.starts_at) !== null && (
                  <span>
                    {Math.max(0, daysUntil(featured.starts_at) ?? 0)} DAYS TO GO
                  </span>
                )}
              </div>
              <h3>{featured.title}</h3>
              <p>{featured.short_description}</p>
              <div className="feature-facts">
                <span>
                  <CalendarDays size={14} /> {formatDate(featured.starts_at)}
                </span>
                {featured.venue && (
                  <span>
                    <MapPin size={14} /> {featured.venue}
                  </span>
                )}
              </div>
              {featured.registration_status === "registration_open" && (
                <CountdownPill target={featured.starts_at} />
              )}
              <Link className="button button-orange" to={`/events/${featured.slug}`}>
                View event <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="empty-events">
            <div className="empty-calendar">
              <span>EVENTS</span>
              <span className="calendar-mark">+</span>
              <span>COMING INTO FOCUS</span>
            </div>
            <div className="empty-copy">
              <span className="empty-overline">THE NEXT CHAPTER IS OPEN</span>
              <h3>
                Nothing on the calendar
                <br />
                just yet.
              </h3>
              <p>Event details will appear here after they are confirmed and published by the community team.</p>
              <Link className="text-link" to="/suggestions">
                Suggest an event <ArrowUpRight size={15} />
              </Link>
            </div>
            <span className="empty-counter">
              NO EVENTS
              <br />
              PUBLISHED
            </span>
          </div>
        )}
      </section>

      {/* C. Meet the builders */}
      <section className="leader-section section-pad">
        <div className="section-index section-index-light">
          <span>03</span>
          <span className="index-rule" /> THE PEOPLE
        </div>
        <div className="leader-head">
          <div>
            <p className="eyebrow light-eyebrow">ONE COMMUNITY. MANY POSSIBILITIES.</p>
            <h2>
              <TextReveal as="span" mode="word" stagger={55}>
                Meet your
              </TextReveal>
              <br />
              <em>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  fellow builder.
                </TextReveal>
              </em>
            </h2>
          </div>
          <p className="leader-caption">
            Good communities start with people who make space for others to learn, try, and grow.
          </p>
        </div>
        <article className="leader-card">
          <Reveal>
          <div className="leader-photo-wrap">
            <span className="leader-photo-frame-corner tl" aria-hidden="true" />
            <span className="leader-photo-frame-corner tr" aria-hidden="true" />
            <span className="leader-photo-frame-corner bl" aria-hidden="true" />
            <span className="leader-photo-frame-corner br" aria-hidden="true" />
            <img
              className="leader-photo"
              src="/assets/ayush-kumar.jpg"
              alt="Ayush Kumar, AWS Student Builder Group Leader"
              loading="lazy"
            />
          </div>
          </Reveal>
          <div className="leader-details">
            <Reveal delay={80}>
              <div className="leader-role">
                <span className="live-dot" /> STUDENT BUILDER GROUP LEADER
              </div>
            </Reveal>
            <Reveal delay={140}>
              <h3>
                Ayush Kumar<span>.</span>
              </h3>
            </Reveal>
            <Reveal delay={200}>
              <p className="leader-study">B.Tech CSE · Artificial Intelligence &amp; Machine Learning · Year 2</p>
            </Reveal>
            <Reveal delay={260}>
              <p className="leader-bio">
                At Amity School of Engineering and Technology, Ayush leads campus-wide cloud
                initiatives, brings hands-on workshops to students, and helps grow a builder-first
                developer community.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="leader-interests">
                <span>CLOUD ARCHITECTURE</span>
                <span>GENERATIVE AI</span>
                <span>FULL-STACK DEVELOPMENT</span>
              </div>
            </Reveal>
            <Reveal delay={380}>
              <div className="leader-foot">
                <span>
                  AMITY UNIVERSITY PATNA
                  <br />
                  PATNA, BIHAR, INDIA
                </span>
                <span className="leader-monogram">
                  AK<span> / BUILDER</span>
                </span>
              </div>
            </Reveal>
          </div>
        </article>

        <div className="leader-teams">
          <div className="leader-teams-head">
            <span className="leader-teams-eyebrow">THE TEAMS · THREE SEATS EACH</span>
            <p className="leader-teams-note">
              It scrolls on its own — or step through the teams yourself.
            </p>
          </div>
          <TeamCarousel />
        </div>

        {builders.length > 0 && (
          <div className="member-directory">
            <div className="member-directory-heading">
              <span>MORE BUILDERS</span>
              <Link className="text-link text-link-light" to="/members">
                View all members <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="member-directory-grid">
              {builders.map((member, index) => (
                <Link className="member-card" to={`/members/${member.id}`} key={member.id} style={{ transitionDelay: `${index * 80}ms` }}>
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.full_name} loading="lazy" />
                  ) : (
                    <div className="member-avatar">{initialsFor(member.full_name)}</div>
                  )}
                  <div>
                    <span>{member.designation}</span>
                    <h3>{member.full_name}</h3>
                    <p>{[member.team?.name, member.course, member.academic_year].filter(Boolean).join(" · ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="people-footnote">
          <span>THE COMMUNITY IS GROWING</span>
          <Link to="/members" className="people-footnote-link">
            View all members <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* D. Community highlights */}
      <section className="highlights-section section-pad bg-grid">
        <div className="section-index">
          <span>04</span>
          <span className="index-rule" /> COMMUNITY HIGHLIGHTS
        </div>
        <div className="stats-strip">
          <div className="stats-heading">
            <span>THE COMMUNITY, IN REAL TIME</span>
            <span>DATABASE-VERIFIED</span>
          </div>
          <div className="stats-grid">
            {(
              [
                ["Members", stats?.members],
                ["Events", stats?.events],
                ["Workshops", stats?.workshops],
                ["Projects built", stats?.projects],
              ] as Array<[string, number | null | undefined]>
            ).map(([label, value], index) => (
              <Reveal className="stat-item" key={label} delay={index * 80}>
                <StatNumber value={value} />
                <span>{label}</span>
              </Reveal>
            ))}
          </div>
          <p>Published community records only. Counts will appear as records are added.</p>
        </div>
      </section>

      {/* E. Latest updates */}
      <section className="updates-section section-pad">
        <div className="section-index section-index-light">
          <span>05</span>
          <span className="index-rule" /> COMMUNITY UPDATES
        </div>
        <div className="updates-heading">
          <div>
            <p className="eyebrow light-eyebrow">NEWS FROM THE BUILDERS</p>
            <h2>
              <TextReveal as="span" mode="word" stagger={55}>
                Notes from
              </TextReveal>
              <br />
              <em>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  the community.
                </TextReveal>
              </em>
            </h2>
          </div>
          <Link className="text-link text-link-light" to="/updates">
            View all updates <ArrowUpRight size={14} />
          </Link>
        </div>
        {latestUpdates.length > 0 ? (
          <div className="updates-list">
            {latestUpdates.map((announcement, index) => (
              <Link className="update-row" to={`/updates/${announcement.slug}`} key={announcement.id} style={{ transitionDelay: `${index * 80}ms` }}>
                <span className="update-number">0{index + 1}</span>
                <div className="update-copy">
                  <span>
                    {announcement.category}
                    {announcement.priority === "important" ? " · IMPORTANT" : ""}
                  </span>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.description.slice(0, 180)}</p>
                </div>
                <div className="update-date">
                  {announcement.published_at ? formatDate(announcement.published_at) : "COMMUNITY NOTE"}
                </div>
                <span className="update-arrow">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="updates-empty">
            <span className="update-number">—</span>
            <div>
              <span>WHEN THERE&apos;S SOMETHING TO SHARE</span>
              <h3>Good things take a little building.</h3>
              <p>Community announcements, learning opportunities, and event updates will appear here when published.</p>
            </div>
            <span className="update-empty-tag">STAY CURIOUS</span>
          </div>
        )}
      </section>

      {/* G. Student suggestion box */}
      <section className="suggestion-section section-pad bg-grid">
        <div className="section-index">
          <span>07</span>
          <span className="index-rule" /> STUDENT SUGGESTION BOX
        </div>
        <div className="suggestion-grid">
          <Reveal className="suggestion-copy">
            <p className="eyebrow">
              <Lightbulb size={13} /> SHARE YOUR IDEA
            </p>
            <h2>
              <TextReveal as="span" mode="word" stagger={55}>
                Your ideas can build
              </TextReveal>
              <br />
              <span>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  what&apos;s next.
                </TextReveal>
              </span>
            </h2>
            <p>
              Have an idea for a workshop, event, project or community improvement? Share it with us.
            </p>
            <ul className="suggestion-points">
              <li>New event and workshop ideas</li>
              <li>Learning resources you want</li>
              <li>Community improvements</li>
            </ul>
            <Link className="text-link" to="/suggestions">
              Open the suggestion box <ArrowUpRight size={15} />
            </Link>
          </Reveal>
          <Reveal className="suggestion-panel" delay={80}>
            <SuggestionForm compact />
          </Reveal>
        </div>
      </section>

      {/* H. Join community CTA */}
      <section className="final-banner">
        <img src="/assets/sbg-banner.jpg" alt="" loading="lazy" />
        <div className="final-banner-overlay" />
        <div className="final-banner-content">
          <span>LEARN CLOUD. BUILD BEYOND. INNOVATE TOGETHER.</span>
          <h2>
            Ideas don&apos;t build themselves.
            <br />
            <em>Let&apos;s get started.</em>
          </h2>
          <div className="final-banner-actions">
            <Link to="/auth/signup" className="button button-orange">
              Join the community <ArrowUpRight size={16} />
            </Link>
            <Link to="/events" className="button button-secondary">
              <Users size={15} /> Explore events
            </Link>
          </div>
        </div>
        <span className="banner-stamp">
          AMITY
          <br />
          PATNA · IN
        </span>
      </section>
    </>
  );
}
