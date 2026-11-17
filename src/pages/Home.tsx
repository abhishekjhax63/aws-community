import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Cloud,
  Code2,
  Lightbulb,
  MapPin,
  Network,
  Sparkles,
  Users,
} from "lucide-react";
import Reveal from "../components/Reveal";
import StatNumber from "../components/StatNumber";
import SuggestionForm from "../components/SuggestionForm";
import {
  getAnnouncements,
  getEvents,
  getMembers,
  getStats,
} from "../lib/api";
import { useAsync } from "../lib/useAsync";
import { useCountdown, useDocumentTitle } from "../lib/hooks";
import { daysUntil, formatDate, initialsFor } from "../lib/format";
import { learningPaths } from "../data/content";
import type { Announcement, CommunityEvent, CommunityMember, CommunityStats } from "../lib/types";

const focusAreas = [
  { icon: Cloud, label: "Cloud computing", detail: "Understand the building blocks" },
  { icon: Code2, label: "Serverless & software", detail: "Turn ideas into working systems" },
  { icon: Sparkles, label: "AI & machine learning", detail: "Explore what intelligent apps can do" },
];

type HomeData = {
  stats: CommunityStats | null;
  events: CommunityEvent[];
  members: CommunityMember[];
  announcements: Announcement[];
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
    const [stats, events, members, announcements] = await Promise.all([
      getStats(signal).catch(() => null),
      getEvents(signal).catch(() => []),
      getMembers(signal).catch(() => []),
      getAnnouncements(signal).catch(() => []),
    ]);
    return { stats, events, members, announcements };
  }, []);

  const stats = data?.stats ?? null;
  const events = data?.events ?? [];
  const members = data?.members ?? [];
  const announcements = data?.announcements ?? [];

  const now = Date.now();
  const featured =
    events.find((event) => new Date(event.starts_at).getTime() >= now) ?? events[0] ?? null;
  const builders = members.filter((member) => member.full_name.toLowerCase() !== "ayush kumar").slice(0, 3);
  const latestUpdates = announcements.slice(0, 3);

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-topline">
          <span>
            <span className="live-dot" /> STUDENT-LED. BUILDER-FOCUSED.
          </span>
          <span className="hero-location">
            <MapPin size={13} /> PATNA, INDIA
          </span>
        </div>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow light-eyebrow">AWS STUDENT BUILDER GROUP</p>
            <h1>
              Build the cloud.
              <br />
              <em>Create the future.</em>
            </h1>
            <p className="hero-intro">
              An AWS-focused student builder community at Amity University Patna. Learn cloud
              technologies, build real-world projects, collaborate with developers, and turn ideas
              into innovation.
            </p>
            <div className="hero-actions">
              <Link className="button button-orange" to="/about">
                Explore community <ArrowRight size={16} />
              </Link>
              <Link className="text-link text-link-light" to="/events">
                Discover events <ArrowDownRight size={16} />
              </Link>
            </div>
            <div className="hero-coordinates">
              <span>25°31&apos; N</span>
              <span className="coordinate-line" />
              <span>85°08&apos; E</span>
              <span className="coordinate-place">AMITY UNIVERSITY PATNA</span>
            </div>
          </div>
          <div className="hero-art" aria-label="AWS Student Builder Group title video">
            <div className="hero-art-glow" />
            <video
              className="hero-video"
              src="/assets/community-reel.mp4"
              poster="/assets/sbg-banner.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Community visual"
            />
            <div className="video-frame">
              <span className="frame-label">
                <span className="live-dot" /> CAMPUS BUILDERS / EST. AMITY PATNA
              </span>
              <span className="frame-index">01—04</span>
            </div>
            <div className="floating-note">
              <Network size={16} />
              <span>
                Ideas connected.
                <br />
                <b>Built together.</b>
              </span>
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#about">
          <span>SCROLL TO EXPLORE</span>
          <ArrowDownRight size={15} />
        </a>
        <div className="hero-side-label">LEARN CLOUD. BUILD BEYOND. INNOVATE TOGETHER.</div>
      </section>

      {/* A. Community introduction */}
      <section className="intro-section section-pad" id="about">
        <div className="section-index">
          <span>01</span>
          <span className="index-rule" /> THE COMMUNITY
        </div>
        <div className="intro-grid">
          <Reveal className="intro-heading">
            <p className="eyebrow">WHO WE ARE</p>
            <h2>
              More than a community.
              <br />
              <span>A place to build.</span>
            </h2>
          </Reveal>
          <Reveal className="intro-copy" delay={80}>
            <p className="intro-lede">
              We&apos;re a student-led campus community for anyone who wants to understand how cloud
              technology works, then build something real with it.
            </p>
            <p>
              <b>Our mission</b> is to make AWS and cloud skills approachable for every student at
              Amity University Patna, whatever their branch or starting point.
            </p>
            <p>
              <b>What we do:</b> hands-on workshops, cloud and serverless sessions, hackathons, and
              time to work on ideas together.
            </p>
            <Link className="text-link" to="/about">
              Read more <ArrowUpRight size={15} />
            </Link>
            <div className="focus-list">
              {focusAreas.map(({ icon: Icon, label, detail }) => (
                <div className="focus-row" key={label}>
                  <span className="focus-icon">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <span className="focus-label">
                    {label}
                    <small>{detail}</small>
                  </span>
                  <ArrowUpRight size={15} className="focus-arrow" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* B. Upcoming featured event */}
      <section className="feature-section section-pad">
        <div className="section-index">
          <span>02</span>
          <span className="index-rule" /> WHAT&apos;S NEXT
        </div>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">UPCOMING FEATURED EVENT</p>
            <h2>
              Meet us
              <br />
              <span>in the making.</span>
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
              Meet your
              <br />
              <em>fellow builder.</em>
            </h2>
          </div>
          <p className="leader-caption">
            Good communities start with people who make space for others to learn, try, and grow.
          </p>
        </div>
        <article className="leader-card">
          <div className="leader-photo-wrap">
            <img
              className="leader-photo"
              src="/assets/ayush-kumar.jpg"
              alt="Ayush Kumar, AWS Student Builder Group Leader"
              loading="lazy"
            />
            <span className="photo-caption">CAMPUS BUILDER / 001</span>
          </div>
          <div className="leader-details">
            <div className="leader-role">
              <span className="live-dot" /> STUDENT BUILDER GROUP LEADER
            </div>
            <h3>
              Ayush Kumar<span>.</span>
            </h3>
            <p className="leader-study">B.Tech CSE · Artificial Intelligence &amp; Machine Learning · Year 2</p>
            <p className="leader-bio">
              At Amity School of Engineering and Technology, Ayush leads campus-wide cloud
              initiatives, brings hands-on workshops to students, and helps grow a builder-first
              developer community.
            </p>
            <div className="leader-interests">
              <span>CLOUD ARCHITECTURE</span>
              <span>GENERATIVE AI</span>
              <span>FULL-STACK DEVELOPMENT</span>
            </div>
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
          </div>
        </article>

        {builders.length > 0 && (
          <div className="member-directory">
            <div className="member-directory-heading">
              <span>MORE BUILDERS</span>
              <Link className="text-link text-link-light" to="/members">
                View all members <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="member-directory-grid">
              {builders.map((member) => (
                <Link className="member-card" to={`/members/${member.id}`} key={member.id}>
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
      <section className="highlights-section section-pad">
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
            ).map(([label, value]) => (
              <div className="stat-item" key={label}>
                <StatNumber value={value} />
                <span>{label}</span>
              </div>
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
              Notes from
              <br />
              <em>the community.</em>
            </h2>
          </div>
          <Link className="text-link text-link-light" to="/updates">
            View all updates <ArrowUpRight size={14} />
          </Link>
        </div>
        {latestUpdates.length > 0 ? (
          <div className="updates-list">
            {latestUpdates.map((announcement, index) => (
              <Link className="update-row" to={`/updates/${announcement.slug}`} key={announcement.id}>
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

      {/* F. AWS learning preview */}
      <section className="learning-section section-pad">
        <div className="section-index section-index-light">
          <span>06</span>
          <span className="index-rule" /> THE LEARNING LAB
        </div>
        <div className="learning-head">
          <div>
            <p className="eyebrow light-eyebrow">START WHERE YOU ARE</p>
            <h2>
              Learn it.
              <br />
              <em>Then make it.</em>
            </h2>
          </div>
          <div className="learning-head-note">
            <BookOpen size={19} />
            <p>Go at your own pace with trusted learning resources from AWS. No experience needed to get started.</p>
          </div>
        </div>
        <div className="learning-roadmap">
          <span>YOUR LEARNING PATH</span>
          <div>
            <b>FOUNDATIONS</b>
            <span />
            <b>BUILDING</b>
            <span />
            <b>ARCHITECTURE</b>
          </div>
        </div>
        <div className="learning-cards">
          {learningPaths.slice(0, 3).map((path) => (
            <Link className="learning-card" to="/learning" key={path.number}>
              <div className="learning-card-top">
                <span>
                  {path.number} / {String(learningPaths.length).padStart(2, "0")}
                </span>
                <ArrowUpRight size={16} />
              </div>
              <div>
                <span className="learning-services">{path.services}</span>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
              </div>
              <div className="learning-card-bottom">
                <span>EXPLORE LEARNING</span>
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
        <div className="learning-preview-foot">
          <Link className="button button-orange" to="/learning">
            Explore learning <ArrowRight size={15} />
          </Link>
          <p className="learning-disclaimer">
            <Check size={14} /> Links lead to official AWS documentation and Skill Builder.
          </p>
        </div>
      </section>

      {/* G. Student suggestion box */}
      <section className="suggestion-section section-pad">
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
              Your ideas can build
              <br />
              <span>what&apos;s next.</span>
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
            <Link to="/events" className="text-link text-link-light">
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
