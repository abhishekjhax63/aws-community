import { Component, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  ClipboardList,
  Download,
  Github,
  ImagePlus,
  Images,
  Instagram,
  LayoutDashboard,
  Linkedin,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  MoveUpRight,
  Network,
  Pencil,
  Send,
  Settings,
  Sparkles,
  Terminal,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

const learningPaths = [
  {
    number: "01",
    title: "Cloud computing",
    description: "Learn how on-demand computing changes the way teams build and scale.",
    objective: "Explain cloud essentials",
    services: "FOUNDATIONS · BEGINNER",
    href: "https://aws.amazon.com/what-is-cloud-computing/",
  },
  {
    number: "02",
    title: "AWS global infrastructure",
    description: "Explore Regions, Availability Zones, and the infrastructure behind AWS services.",
    objective: "Understand where workloads run",
    services: "FOUNDATIONS · BEGINNER",
    href: "https://aws.amazon.com/about-aws/global-infrastructure/",
  },
  {
    number: "03",
    title: "Amazon EC2",
    description: "Discover virtual servers, instance choices, and the basics of launching compute.",
    objective: "Describe elastic compute",
    services: "COMPUTE · INTERMEDIATE",
    href: "https://docs.aws.amazon.com/ec2/",
  },
  {
    number: "04",
    title: "Amazon S3",
    description: "Learn object storage concepts, buckets, access patterns, and data protection.",
    objective: "Store and retrieve objects",
    services: "STORAGE · BEGINNER",
    href: "https://docs.aws.amazon.com/s3/",
  },
  {
    number: "05",
    title: "AWS Lambda",
    description: "Understand event-driven compute and how to run code without managing servers.",
    objective: "Build a serverless function",
    services: "SERVERLESS · INTERMEDIATE",
    href: "https://docs.aws.amazon.com/lambda/",
  },
  {
    number: "06",
    title: "AWS IAM",
    description: "Explore users, roles, and policies while learning the principle of least privilege.",
    objective: "Control access responsibly",
    services: "IDENTITY · FOUNDATIONS",
    href: "https://docs.aws.amazon.com/iam/",
  },
  {
    number: "07",
    title: "Amazon VPC",
    description: "Learn how virtual networks, subnets, and routes shape cloud connectivity.",
    objective: "Map a basic cloud network",
    services: "NETWORKING · INTERMEDIATE",
    href: "https://docs.aws.amazon.com/vpc/",
  },
  {
    number: "08",
    title: "Amazon CloudFront",
    description: "See how content delivery networks bring web experiences closer to users.",
    objective: "Explain edge delivery",
    services: "EDGE · INTERMEDIATE",
    href: "https://docs.aws.amazon.com/cloudfront/",
  },
  {
    number: "09",
    title: "Amazon DynamoDB",
    description: "Explore managed NoSQL data modeling, tables, keys, and access patterns.",
    objective: "Design a simple key-value model",
    services: "DATABASE · INTERMEDIATE",
    href: "https://docs.aws.amazon.com/dynamodb/",
  },
  {
    number: "10",
    title: "Cloud architecture",
    description: "Use the Well-Architected Framework to reason about resilient cloud systems.",
    objective: "Review architecture trade-offs",
    services: "ARCHITECTURE · ADVANCED",
    href: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
  },
  {
    number: "11",
    title: "Security fundamentals",
    description: "Build a foundation in shared responsibility, identity, and layered protection.",
    objective: "Recognize core security practices",
    services: "SECURITY · ALL LEVELS",
    href: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html",
  },
  {
    number: "12",
    title: "AI & machine learning",
    description: "Get oriented with AWS machine learning tools and responsible AI learning paths.",
    objective: "Explore practical ML concepts",
    services: "AI / ML · EXPLORATION",
    href: "https://skillbuilder.aws/",
  },
];

type CommunityStats = {
  members: number;
  events: number;
  workshops: number;
  projects: number | null;
};

type CommunityEvent = {
  id: string;
  title: string;
  category: string;
  cover_image_url: string | null;
  short_description: string;
  full_description: string | null;
  agenda: Array<{ time?: string; title?: string; description?: string }>;
  speakers: Array<{ name?: string; role?: string; bio?: string }>;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  eligibility: string | null;
  registration_deadline: string | null;
  capacity: number | null;
  registration_status: string;
  important_instructions: string | null;
};

type CommunityMember = {
  id: string;
  full_name: string;
  designation: string;
  department: string | null;
  course: string | null;
  academic_year: string | null;
  bio: string | null;
  skills: string[];
  linkedin_url: string | null;
  github_url: string | null;
  photo_url: string | null;
  team_id: string | null;
  team?: { name: string } | null;
};

type GalleryItem = {
  id: string;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string | null;
  title: string | null;
  caption: string | null;
  category: string;
};

type Announcement = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "normal" | "important";
  external_url: string | null;
  published_at: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function initialsFor(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function StatNumber({ value }: { value: number | null | undefined }) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    const node = nodeRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      const duration = 950;
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  if (typeof value !== "number") return <strong>—</strong>;
  return <strong ref={nodeRef}>{display.toLocaleString("en-IN")}</strong>;
}

const focusAreas = [
  { icon: Cloud, label: "Cloud computing", detail: "Understand the building blocks" },
  { icon: Code2, label: "Serverless & software", detail: "Turn ideas into working systems" },
  { icon: Sparkles, label: "AI & machine learning", detail: "Explore what intelligent apps can do" },
];
const socialLinks = [
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin },
  { key: "instagram_url", label: "Instagram", icon: Instagram },
  { key: "github_url", label: "GitHub", icon: Github },
] as const;

function CommunitySite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTeam, setMemberTeam] = useState("");
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [galleryCategory, setGalleryCategory] = useState("all");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [registrationState, setRegistrationState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCommunityContent() {
      const endpoints = ["/api/stats", "/api/events", "/api/gallery", "/api/announcements", "/api/settings", "/api/members"];
      const responses = await Promise.all(endpoints.map((endpoint) =>
        fetch(endpoint, { signal: controller.signal }).catch(() => null),
      ));

      if (controller.signal.aborted) return;

      if (responses[0]?.ok) {
        const result = (await responses[0].json()) as CommunityStats;
        setStats(result);
      }
      if (responses[1]?.ok) {
        const result = (await responses[1].json()) as { data: CommunityEvent[] };
        setEvents(result.data);
      }
      setEventsLoaded(true);
      if (responses[2]?.ok) {
        const result = (await responses[2].json()) as { data: GalleryItem[] };
        setGallery(result.data);
      }
      if (responses[3]?.ok) {
        const result = (await responses[3].json()) as { data: Announcement[] };
        setAnnouncements(result.data);
      }
      if (responses[4]?.ok) {
        const result = (await responses[4].json()) as { data: Array<{ key: string; value: unknown }> };
        const settings: Record<string, string> = {};
        result.data.forEach((item) => {
          if (typeof item.value === "string") settings[item.key] = item.value;
        });
        setSiteSettings(settings);
      }
      if (responses[5]?.ok) {
        const result = (await responses[5].json()) as { data: CommunityMember[] };
        setMembers(result.data);
      }
    }

    void loadCommunityContent();
    return () => controller.abort();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    setFormMessage("");

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(result.message || "We couldn't send your message right now.");
      setFormState("success");
      setFormMessage("Thanks for reaching out. Your message has been received.");
      form.reset();
    } catch (error) {
      setFormState("error");
      setFormMessage(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "The community inbox is being set up. Please check back soon.",
      );
    }
  }

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvent) return;
    setRegistrationState("sending");
    setRegistrationMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          event_id: selectedEvent.id,
          consent_given: values.consent_given === "on",
        }),
      });
      const result = (await response.json()) as { message?: string; registration_id?: string };
      if (!response.ok) throw new Error(result.message || "We couldn't complete your registration.");
      setRegistrationCode(result.registration_id || "");
      setRegistrationState("success");
    } catch (error) {
      setRegistrationState("error");
      setRegistrationMessage(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "The registration service is being set up. Please try again later.",
      );
    }
  }

  function closeRegistration() {
    setSelectedEvent(null);
    setRegistrationState("idle");
    setRegistrationMessage("");
    setRegistrationCode("");
  }

  useEffect(() => {
    if (!selectedEvent) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRegistration();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedMember && !lightbox) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMember(null);
        setLightbox(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember, lightbox]);

  const directoryMembers = members.filter((member) => member.full_name.toLowerCase() !== "ayush kumar");
  const memberTeamNames = Array.from(
    new Set(directoryMembers.map((member) => member.team?.name).filter((name): name is string => Boolean(name))),
  );
  const visibleMembers = directoryMembers.filter((member) =>
    member.full_name.toLowerCase().includes(memberSearch.toLowerCase()) &&
    (memberTeam === "" || member.team?.name === memberTeam),
  );
  const galleryCategories = Array.from(new Set(gallery.map((item) => item.category).filter(Boolean)));
  const visibleGallery = galleryCategory === "all" ? gallery : gallery.filter((item) => item.category === galleryCategory);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="AWS Builder Community, home">
          <span className="brand-mark" aria-hidden="true">
            <img src="/assets/sbg-mark.jpg" alt="" />
          </span>
          <span className="brand-copy">
            <strong>BUILDER COMMUNITY</strong>
            <span>AMITY UNIVERSITY PATNA</span>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#people" onClick={closeMenu}>Members</a>
          <a href="#events" onClick={closeMenu}>Events</a>
          <a href="#gallery" onClick={closeMenu}>Gallery</a>
          <a href="#updates" onClick={closeMenu}>Updates</a>
          <a href="#learning" onClick={closeMenu}>AWS Learning</a>
          <a className="nav-join" href="#contact" onClick={closeMenu}>
            Join the community <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-topline">
            <span><span className="live-dot" /> STUDENT-LED. BUILDER-FOCUSED.</span>
            <span className="hero-location"><MapPin size={13} /> PATNA, INDIA</span>
          </div>
          <div className="hero-content">
            <div className="hero-copy">
              <p className="eyebrow light-eyebrow">AWS STUDENT BUILDER GROUP</p>
              <h1>Build the cloud.<br /><em>Create the future.</em></h1>
              <p className="hero-intro">
                An AWS-focused student builder community at Amity University Patna. Learn cloud
                technologies, build real-world projects, collaborate with developers, and turn
                ideas into innovation.
              </p>
              <div className="hero-actions">
                <a className="button button-orange" href="#about">Explore community <ArrowRight size={16} /></a>
                <a className="text-link text-link-light" href="#events">Discover events <ArrowDownRight size={16} /></a>
              </div>
              <div className="hero-coordinates">
                <span>25°31&apos; N</span><span className="coordinate-line" /><span>85°08&apos; E</span>
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
                <span className="frame-label"><span className="live-dot" /> CAMPUS BUILDERS / EST. AMITY PATNA</span>
                <span className="frame-index">01—04</span>
              </div>
              <div className="floating-note"><Network size={16} /><span>Ideas connected.<br /><b>Built together.</b></span></div>
            </div>
          </div>
          <a className="hero-scroll" href="#about"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></a>
          <div className="hero-side-label">LEARN CLOUD. BUILD BEYOND. INNOVATE TOGETHER.</div>
        </section>

        <section className="intro-section section-pad" id="about">
          <div className="section-index"><span>01</span><span className="index-rule" /> THE COMMUNITY</div>
          <div className="intro-grid">
            <div className="intro-heading">
              <p className="eyebrow">WHO WE ARE</p>
              <h2>More than a community.<br /><span>A place to build.</span></h2>
            </div>
            <div className="intro-copy">
              <p className="intro-lede">
                We&apos;re a student-led campus community for anyone who wants to understand how
                cloud technology works, then build something real with it.
              </p>
              <p>
                <b>Our mission</b> is to make AWS and cloud skills approachable for every student
                at Amity University Patna, whatever their branch or starting point.
              </p>
              <p>
                <b>Our vision</b> is a campus where curiosity becomes working projects and where
                builders grow by helping one another.
              </p>
              <p>
                <b>What we do:</b> hands-on workshops, cloud and serverless sessions, hackathons,
                and time to work on ideas together.
              </p>
              <a className="text-link" href="#people">Meet the community <ArrowUpRight size={15} /></a>
              <div className="focus-list">
                {focusAreas.map(({ icon: Icon, label, detail }) => (
                  <div className="focus-row" key={label}>
                    <span className="focus-icon"><Icon size={18} strokeWidth={1.6} /></span>
                    <span className="focus-label">{label}<small>{detail}</small></span>
                    <ArrowUpRight size={15} className="focus-arrow" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="community-note">
            <img src="/assets/sbg-banner.jpg" alt="AWS Student Builder Group banner" loading="lazy" />
            <div><span>01 / 01</span><span>A new generation of builders, finding their cloud.</span><ArrowUpRight size={16} /></div>
          </div>
          <div className="stats-strip" aria-label="Live community statistics">
            <div className="stats-heading"><span>THE COMMUNITY, IN REAL TIME</span><span>DATABASE-VERIFIED</span></div>
            <div className="stats-grid">
              {([
                ["Members", stats?.members],
                ["Events", stats?.events],
                ["Workshops", stats?.workshops],
                ["Projects built", stats?.projects],
              ] as Array<[string, number | null | undefined]>).map(([label, value]) => (
                <div className="stat-item" key={label}>
                  <StatNumber value={value} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p>Published community records only. Counts will appear as records are added.</p>
          </div>
        </section>

        <section className="leader-section section-pad" id="people">
          <div className="section-index section-index-light"><span>02</span><span className="index-rule" /> THE PEOPLE</div>
          <div className="leader-head">
            <div>
              <p className="eyebrow light-eyebrow">ONE COMMUNITY. MANY POSSIBILITIES.</p>
              <h2>Meet your<br /><em>fellow builder.</em></h2>
            </div>
            <p className="leader-caption">Good communities start with people who make space for others to learn, try, and grow.</p>
          </div>
          <article className="leader-card">
            <div className="leader-photo-wrap">
              <img className="leader-photo" src="/assets/ayush-kumar.jpg" alt="Ayush Kumar, AWS Student Builder Group Leader" loading="lazy" />
              <span className="photo-caption">CAMPUS BUILDER / 001</span>
            </div>
            <div className="leader-details">
              <div className="leader-role"><span className="live-dot" /> STUDENT BUILDER GROUP LEADER</div>
              <h3>Ayush Kumar<span>.</span></h3>
              <p className="leader-study">B.Tech CSE · Artificial Intelligence &amp; Machine Learning · Year 2</p>
              <p className="leader-bio">
                At Amity School of Engineering and Technology, Ayush leads campus-wide cloud
                initiatives, brings hands-on workshops to students, and helps grow a builder-first
                developer community. He is also a core team member of AWS User Group Bihar and an
                active hackathon competitor.
              </p>
              <div className="leader-interests">
                <span>CLOUD ARCHITECTURE</span><span>GENERATIVE AI</span><span>FULL-STACK DEVELOPMENT</span>
              </div>
              <div className="leader-foot">
                <span>AMITY UNIVERSITY PATNA<br />PATNA, BIHAR, INDIA</span>
                <span className="leader-monogram">AK<span> / BUILDER</span></span>
              </div>
            </div>
          </article>
          {directoryMembers.length > 0 && (
            <div className="member-directory">
              <div className="member-directory-heading">
                <span>MORE BUILDERS</span>
                <div className="member-filters">
                  <label htmlFor="member-search"><input id="member-search" type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search by name" /></label>
                  {memberTeamNames.length > 0 && (
                    <select value={memberTeam} onChange={(event) => setMemberTeam(event.target.value)} aria-label="Filter members by team">
                      <option value="">All teams</option>
                      {memberTeamNames.map((teamName) => <option key={teamName} value={teamName}>{teamName}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div className="member-directory-grid">
                {visibleMembers.length > 0 ? visibleMembers.map((member) => (
                  <article className="member-card" key={member.id}>
                    {member.photo_url ? <img src={member.photo_url} alt={member.full_name} loading="lazy" /> : <div className="member-avatar">{initialsFor(member.full_name)}</div>}
                    <div><span>{member.designation}</span><h3>{member.full_name}</h3><p>{[member.course, member.department, member.academic_year].filter(Boolean).join(" · ")}</p>{member.bio && <p className="member-bio">{member.bio}</p>}{member.skills.length > 0 && <div className="member-skills">{member.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}<div className="member-socials">{member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a>}{member.github_url && <a href={member.github_url} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a>}<button type="button" className="member-view" onClick={() => setSelectedMember(member)}>View profile <ArrowUpRight size={12} /></button></div></div>
                  </article>
                )) : <p className="member-empty">No builders match that search yet.</p>}
              </div>
            </div>
          )}
          <div className="people-footnote"><span>THE COMMUNITY IS GROWING</span><span>More builder profiles coming soon <ArrowRight size={14} /></span></div>
        </section>

        <section className="events-section section-pad" id="events">
          <div className="section-index"><span>03</span><span className="index-rule" /> WHAT&apos;S HAPPENING</div>
          <div className="section-heading-row">
            <div><p className="eyebrow">LEARN SOMETHING. BUILD SOMETHING.</p><h2>Meet us<br /><span>in the making.</span></h2></div>
            <p className="section-aside">Workshops, cloud sessions, hackathons, and time to work on ideas together. Event details will appear here once they&apos;re confirmed.</p>
          </div>
          {events.length > 0 ? (
            <div className="event-grid">
              {events.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-image">
                    {event.cover_image_url && <img src={event.cover_image_url} alt="" loading="lazy" />}
                    <span>{formatDate(event.starts_at)}</span>
                  </div>
                  <div className="event-card-body">
                    <div className="event-meta"><span>{event.category}</span><span>{event.registration_status.replace(/_/g, " ")}</span></div>
                    <h3>{event.title}</h3>
                    <p>{event.short_description}</p>
                    {event.venue && <span className="event-venue"><MapPin size={13} /> {event.venue}</span>}
                <button className="text-link event-details-button" type="button" onClick={() => { setSelectedEvent(event); setRegistrationState("idle"); }}>
                  View event details <ArrowUpRight size={14} />
                </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-events">
              <div className="empty-calendar"><span>EVENTS</span><span className="calendar-mark">+</span><span>COMING INTO FOCUS</span></div>
              <div className="empty-copy"><span className="empty-overline">{eventsLoaded ? "THE NEXT CHAPTER IS OPEN" : "CHECKING THE COMMUNITY CALENDAR"}</span><h3>{eventsLoaded ? <>Nothing on the calendar<br />just yet.</> : <>Checking for the<br />next gathering.</>}</h3><p>Event details will appear here after they are confirmed and published by the community team.</p><a className="text-link" href="#contact">Say hello <ArrowUpRight size={15} /></a></div>
              <span className="empty-counter">{eventsLoaded ? <>NO EVENTS<br />PUBLISHED</> : <>LIVE DATA<br />LOADING</>}</span>
            </div>
          )}
        </section>

        <section className="gallery-section section-pad" id="gallery">
          <div className="section-index"><span>04</span><span className="index-rule" /> MOMENTS IN THE MAKING</div>
          <div className="section-heading-row">
            <div><p className="eyebrow">THE BUILDER&apos;S JOURNAL</p><h2>Make space<br /><span>for the moments.</span></h2></div>
            <p className="section-aside">A visual log of the people, ideas, and hands-on learning that bring this community together.</p>
          </div>
          {gallery.length > 0 && galleryCategories.length > 1 && (
            <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
              <button type="button" className={galleryCategory === "all" ? "is-active" : ""} onClick={() => setGalleryCategory("all")}>ALL</button>
              {galleryCategories.map((category) => (
                <button type="button" key={category} className={galleryCategory === category ? "is-active" : ""} onClick={() => setGalleryCategory(category)}>{category.toUpperCase()}</button>
              ))}
            </div>
          )}
          <div className={gallery.length > 0 ? "gallery-grid gallery-grid-full" : "gallery-grid"}>
            {gallery.length > 0 ? visibleGallery.map((item) => (
              <button className="gallery-card" type="button" key={item.id} onClick={() => setLightbox(item)} aria-label={`Open ${item.title || item.caption || "community moment"}`}>
                {item.media_type === "video" ? (
                  <video src={item.media_url} poster={item.thumbnail_url ?? undefined} muted preload="metadata" />
                ) : (
                  <img src={item.media_url} alt={item.caption || item.title || "Community gallery"} loading="lazy" />
                )}
                <div><span>{item.category}</span><h3>{item.title || item.caption || "Community moment"}</h3></div>
              </button>
            )) : (
              <>
                <div className="gallery-reel">
                  <video src="/assets/community-reel.mp4" poster="/assets/sbg-banner.jpg" controls muted playsInline preload="metadata" aria-label="AWS Student Builder Group community reel" />
                  <span className="gallery-reel-label">01 / COMMUNITY REEL</span>
                </div>
                <div className="gallery-empty">
                  <span className="empty-overline">THE VISUAL JOURNAL</span>
                  <h3>First moments<br />are still ahead.</h3>
                  <p>Approved community photos and videos will find a home here. This space will grow as we build together.</p>
                  <span className="gallery-empty-mark"><Sparkles size={19} /></span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="updates-section section-pad" id="updates">
          <div className="section-index section-index-light"><span>05</span><span className="index-rule" /> COMMUNITY UPDATES</div>
          <div className="updates-heading"><div><p className="eyebrow light-eyebrow">NEWS FROM THE BUILDERS</p><h2>Notes from<br /><em>the community.</em></h2></div><span>ANNOUNCEMENTS<br />&amp; OPPORTUNITIES</span></div>
          {announcements.length > 0 ? (
            <div className="updates-list">
              {announcements.map((announcement, index) => (
                <article className="update-row" key={announcement.id}>
                  <span className="update-number">0{index + 1}</span>
                  <div className="update-copy"><span>{announcement.category}{announcement.priority === "important" ? " · IMPORTANT" : ""}</span><h3>{announcement.title}</h3><p>{announcement.description}</p></div>
                  <div className="update-date">{announcement.published_at ? formatDate(announcement.published_at) : "COMMUNITY NOTE"}</div>
                  {announcement.external_url && <a href={announcement.external_url} target="_blank" rel="noreferrer" aria-label={`Open ${announcement.title}`}><ArrowUpRight size={17} /></a>}
                </article>
              ))}
            </div>
          ) : (
            <div className="updates-empty"><span className="update-number">—</span><div><span>WHEN THERE&apos;S SOMETHING TO SHARE</span><h3>Good things take a little building.</h3><p>Community announcements, learning opportunities, and event updates will appear here when published.</p></div><span className="update-empty-tag">STAY CURIOUS</span></div>
          )}
        </section>

        <section className="learning-section section-pad" id="learning">
          <div className="section-index section-index-light"><span>06</span><span className="index-rule" /> THE LEARNING LAB</div>
          <div className="learning-head">
            <div><p className="eyebrow light-eyebrow">START WHERE YOU ARE</p><h2>Learn it.<br /><em>Then make it.</em></h2></div>
            <div className="learning-head-note"><BookOpen size={19} /><p>Go at your own pace with trusted learning resources from AWS. No experience needed to get started.</p></div>
          </div>
          <div className="learning-roadmap"><span>YOUR LEARNING PATH</span><div><b>FOUNDATIONS</b><span /><b>BUILDING</b><span /><b>ARCHITECTURE</b></div></div>
          <div className="learning-cards">
            {learningPaths.map((path) => (
              <a className="learning-card" href={path.href} target="_blank" rel="noreferrer" key={path.number}>
                <div className="learning-card-top"><span>{path.number} / {String(learningPaths.length).padStart(2, "0")}</span><ArrowUpRight size={16} /></div>
                <div><span className="learning-services">{path.services}</span><h3>{path.title}</h3><p>{path.description}</p></div>
                <div className="learning-card-bottom"><span>EXPLORE LEARNING</span><ArrowRight size={15} /></div>
              </a>
            ))}
          </div>
          <p className="learning-disclaimer"><Check size={14} /> Learning links lead to official AWS documentation and Skill Builder. Community participation does not grant AWS certification.</p>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div className="section-index"><span>07</span><span className="index-rule" /> FIND YOUR PEOPLE</div>
          <div className="contact-grid">
            <div className="contact-copy">
              <p className="eyebrow">YOUR NEXT IDEA STARTS HERE</p>
              <h2>Come curious.<br /><span>Leave building.</span></h2>
              <p>Whether you&apos;re new to cloud or already shipping projects, there&apos;s room to learn together. Tell us what you&apos;re curious about.</p>
              <div className="contact-place"><MapPin size={16} /><span>AMITY UNIVERSITY PATNA<small>Patna, Bihar, India</small></span></div>
              {siteSettings.contact_email && <a className="contact-email" href={`mailto:${siteSettings.contact_email}`}>{siteSettings.contact_email}<ArrowUpRight size={13} /></a>}
              <div className="contact-links">
                {socialLinks.map(({ key, label, icon: Icon }) => siteSettings[key]
                  ? <a key={key} href={siteSettings[key]} target="_blank" rel="noreferrer" aria-label={`Community on ${label}`}><Icon size={17} /></a>
                  : <span key={key} title={`${label} link coming soon`} aria-hidden="true"><Icon size={17} /></span>)}
              </div>
              {!siteSettings.linkedin_url && !siteSettings.instagram_url && !siteSettings.github_url && <span className="social-note">COMMUNITY LINKS COMING SOON</span>}
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-heading"><Terminal size={17} /><span>START A CONVERSATION</span></div>
              <label htmlFor="name">YOUR NAME</label>
              <input id="name" name="name" autoComplete="name" required maxLength={100} placeholder="What should we call you?" />
              <label htmlFor="email">COLLEGE EMAIL</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@university.edu" />
              <label htmlFor="message">WHAT ARE YOU CURIOUS ABOUT?</label>
              <textarea id="message" name="message" required maxLength={2000} rows={3} placeholder="Cloud, a project idea, your first workshop..." />
              <div className="form-bottom"><span>By sending this, you agree to be contacted about the community.</span><button className="submit-button" disabled={formState === "sending"} type="submit">{formState === "sending" ? "SENDING" : "SEND NOTE"} <Send size={15} /></button></div>
              {formMessage && <p className={`form-message ${formState}`} role="status">{formMessage}</p>}
            </form>
          </div>
        </section>

        <section className="final-banner">
          <img src="/assets/sbg-banner.jpg" alt="" loading="lazy" />
          <div className="final-banner-overlay" />
          <div className="final-banner-content"><span>LEARN CLOUD. BUILD BEYOND. INNOVATE TOGETHER.</span><h2>Ideas don&apos;t build themselves.<br /><em>Let&apos;s get started.</em></h2><a href="#contact" className="button button-orange">Find your people <MoveUpRight size={16} /></a></div>
          <span className="banner-stamp">AMITY<br />PATNA · IN</span>
        </section>
      </main>

      {selectedEvent && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRegistration(); }}>
          <section className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
            <button className="dialog-close" type="button" onClick={closeRegistration} aria-label="Close event details"><X size={20} /></button>
            {registrationState === "success" ? (
              <div className="registration-success">
                <span className="success-mark"><Check size={22} /></span>
                <span className="empty-overline">REGISTRATION RECEIVED</span>
                <h2>You&apos;re on<br />the list.</h2>
                <p>Your registration for <b>{selectedEvent.title}</b> has been saved.</p>
                {registrationCode && <div className="registration-code"><span>YOUR REGISTRATION ID</span><strong>{registrationCode}</strong></div>}
                <button className="button button-orange" type="button" onClick={closeRegistration}>Done <ArrowRight size={15} /></button>
              </div>
            ) : (
              <>
                <div className="dialog-event-info">
                  <span className="eyebrow">EVENT DETAILS · {selectedEvent.category.toUpperCase()}</span>
                  <h2 id="event-dialog-title">{selectedEvent.title}</h2>
                  <p>{selectedEvent.full_description || selectedEvent.short_description}</p>
                  <div className="dialog-facts">
                    <span><b>DATE</b>{formatDate(selectedEvent.starts_at)}</span>
                    {selectedEvent.venue && <span><b>VENUE</b>{selectedEvent.venue}</span>}
                    {selectedEvent.eligibility && <span><b>ELIGIBILITY</b>{selectedEvent.eligibility}</span>}
                    {selectedEvent.registration_deadline && <span><b>REGISTER BY</b>{formatDate(selectedEvent.registration_deadline)}</span>}
                  </div>
                  {selectedEvent.agenda.length > 0 && <div className="dialog-agenda"><b>AGENDA</b>{selectedEvent.agenda.map((item, index) => <p key={`${item.time || "slot"}-${index}`}><span>{item.time}</span>{item.title || item.description}</p>)}</div>}
                  {selectedEvent.speakers.length > 0 && <div className="dialog-speakers"><b>WITH</b>{selectedEvent.speakers.map((speaker, index) => <p key={`${speaker.name || "speaker"}-${index}`}>{speaker.name}{speaker.role ? ` · ${speaker.role}` : ""}</p>)}</div>}
                  {selectedEvent.important_instructions && <div className="dialog-instructions"><b>IMPORTANT INFORMATION</b><p>{selectedEvent.important_instructions}</p></div>}
                  {selectedEvent.capacity !== null && <p className="capacity-note">Event capacity is limited. Registration is subject to availability.</p>}
                </div>
                {selectedEvent.registration_status === "registration_open" ? (
                  <form className="registration-form" onSubmit={handleRegistrationSubmit}>
                    <span className="eyebrow">SAVE YOUR PLACE</span>
                    <label htmlFor="reg-name">FULL NAME</label><input id="reg-name" name="full_name" required maxLength={120} autoComplete="name" />
                    <label htmlFor="reg-email">COLLEGE EMAIL</label><input id="reg-email" name="college_email" type="email" required maxLength={254} autoComplete="email" />
                    <label htmlFor="reg-phone">CONTACT NUMBER</label><input id="reg-phone" name="contact_number" type="tel" required minLength={7} maxLength={24} autoComplete="tel" />
                    <div className="registration-field-pair"><div><label htmlFor="reg-course">COURSE</label><input id="reg-course" name="course" required maxLength={120} /></div><div><label htmlFor="reg-department">DEPARTMENT</label><input id="reg-department" name="department" required maxLength={120} /></div></div>
                    <div className="registration-field-pair"><div><label htmlFor="reg-year">ACADEMIC YEAR</label><input id="reg-year" name="academic_year" required maxLength={40} placeholder="e.g. Year 2" /></div><div><label htmlFor="reg-student-id">STUDENT ID (OPTIONAL)</label><input id="reg-student-id" name="student_id" maxLength={80} /></div></div>
                    <label htmlFor="reg-note">WHY WOULD YOU LIKE TO PARTICIPATE? (OPTIONAL)</label><textarea id="reg-note" name="participation_note" rows={2} maxLength={1000} />
                    <label className="consent-label"><input name="consent_given" type="checkbox" required /> I agree to share these details with the event organizers for registration purposes.</label>
                    {registrationMessage && <p className="form-message error" role="alert">{registrationMessage}</p>}
                    <button className="button button-orange registration-submit" type="submit" disabled={registrationState === "sending"}>{registrationState === "sending" ? "SENDING..." : "REGISTER NOW"} <ArrowRight size={15} /></button>
                    <small className="privacy-note">Your registration details are private and are not shown publicly.</small>
                  </form>
                ) : (
                  <div className="registration-closed"><span className="eyebrow">REGISTRATION</span><h3>{selectedEvent.registration_status.replace(/_/g, " ")}</h3><p>Registration is not currently open for this event.</p><a className="text-link" href="#contact" onClick={closeRegistration}>Contact the community <ArrowUpRight size={14} /></a></div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {selectedMember && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedMember(null); }}>
          <section className="member-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
            <button className="dialog-close" type="button" onClick={() => setSelectedMember(null)} aria-label="Close profile"><X size={20} /></button>
            <div className="member-dialog-photo">
              {selectedMember.photo_url
                ? <img src={selectedMember.photo_url} alt={selectedMember.full_name} />
                : <span>{initialsFor(selectedMember.full_name)}</span>}
            </div>
            <div className="member-dialog-body">
              <span className="eyebrow">{selectedMember.designation.toUpperCase()}{selectedMember.team?.name ? ` · ${selectedMember.team.name.toUpperCase()}` : ""}</span>
              <h2 id="member-dialog-title">{selectedMember.full_name}</h2>
              <p className="member-dialog-meta">{[selectedMember.course, selectedMember.department, selectedMember.academic_year].filter(Boolean).join(" · ")}</p>
              {selectedMember.bio && <p className="member-dialog-bio">{selectedMember.bio}</p>}
              {selectedMember.skills.length > 0 && <div className="member-skills">{selectedMember.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
              <div className="member-socials">
                {selectedMember.linkedin_url && <a href={selectedMember.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a>}
                {selectedMember.github_url && <a href={selectedMember.github_url} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12} /></a>}
              </div>
            </div>
          </section>
        </div>
      )}

      {lightbox && (
        <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setLightbox(null); }}>
          <figure className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title || lightbox.caption || "Community gallery"}>
            <button className="dialog-close" type="button" onClick={() => setLightbox(null)} aria-label="Close image"><X size={20} /></button>
            {lightbox.media_type === "video"
              ? <video src={lightbox.media_url} poster={lightbox.thumbnail_url ?? undefined} controls autoPlay playsInline />
              : <img src={lightbox.media_url} alt={lightbox.caption || lightbox.title || "Community gallery"} />}
            <figcaption><span>{lightbox.category}</span><h3>{lightbox.title || lightbox.caption || "Community moment"}</h3></figcaption>
          </figure>
        </div>
      )}

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-intro">
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark"><img src="/assets/sbg-mark.jpg" alt="" /></span>
              <span className="brand-copy"><strong>BUILDER COMMUNITY</strong><span>AMITY UNIVERSITY PATNA</span></span>
            </a>
            <p className="footer-tagline">Building Skills. Connecting Minds.<br />Creating What&apos;s Next.</p>
            <p className="footer-about">An independent, student-led community for cloud, serverless, and AI learning at Amity University Patna.</p>
          </div>
          <nav className="footer-column" aria-label="Footer navigation">
            <span>EXPLORE</span>
            <a href="#about">About</a><a href="#people">Members</a><a href="#events">Events</a><a href="#gallery">Gallery</a><a href="#updates">Updates</a>
          </nav>
          <nav className="footer-column" aria-label="AWS learning links">
            <span>AWS LEARNING</span>
            {learningPaths.slice(0, 5).map((path) => (
              <a key={path.number} href={path.href} target="_blank" rel="noreferrer">{path.title}</a>
            ))}
          </nav>
          <div className="footer-column">
            <span>CONNECT</span>
            {siteSettings.contact_email && <a href={`mailto:${siteSettings.contact_email}`}>{siteSettings.contact_email}</a>}
            <span className="footer-place">Amity University Patna<br />Patna, Bihar, India</span>
            <div className="footer-socials">
              {socialLinks.map(({ key, label, icon: Icon }) => siteSettings[key]
                ? <a key={key} href={siteSettings[key]} target="_blank" rel="noreferrer" aria-label={`Community on ${label}`}><Icon size={16} /></a>
                : <span key={key} title={`${label} link coming soon`} aria-hidden="true"><Icon size={16} /></span>)}
            </div>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} AWS Builder Community · Amity University Patna</span><span>AN INDEPENDENT STUDENT COMMUNITY. NOT AN OFFICIAL AWS AFFILIATE.</span><a href="#home">BACK TO TOP <ChevronDown size={13} /></a></div>
      </footer>
    </>
  );
}

type AdminResource = "members" | "teams" | "events" | "gallery" | "announcements";
type AdminTab = "overview" | AdminResource | "registrations" | "settings";
type AdminField = { key: string; label: string; type?: string; required?: boolean; wide?: boolean; upload?: boolean };

const adminResources: Array<{ id: AdminResource; label: string; icon: typeof Users }> = [
  { id: "members", label: "Members", icon: Users },
  { id: "teams", label: "Teams", icon: Users },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "announcements", label: "Updates", icon: Megaphone },
];

const adminFields: Record<AdminResource, AdminField[]> = {
  members: [
    { key: "full_name", label: "Full name", required: true },
    { key: "designation", label: "Designation", required: true },
    { key: "department", label: "Department" },
    { key: "course", label: "Course" },
    { key: "academic_year", label: "Academic year" },
    { key: "photo_url", label: "Profile photo path or URL", upload: true, wide: true },
    { key: "bio", label: "Short biography", type: "textarea", wide: true },
    { key: "skills", label: "Skills, separated by commas", wide: true },
    { key: "linkedin_url", label: "LinkedIn URL" },
    { key: "github_url", label: "GitHub URL" },
    { key: "is_published", label: "Publish profile", type: "checkbox" },
  ],
  teams: [
    { key: "name", label: "Team name", required: true },
    { key: "slug", label: "URL slug", required: true },
    { key: "description", label: "Description", type: "textarea", wide: true },
  ],
  events: [
    { key: "title", label: "Event title", required: true },
    { key: "slug", label: "URL slug", required: true },
    { key: "category", label: "Category", required: true },
    { key: "starts_at", label: "Starts at", type: "datetime-local", required: true },
    { key: "ends_at", label: "Ends at", type: "datetime-local" },
    { key: "registration_deadline", label: "Registration deadline", type: "datetime-local" },
    { key: "venue", label: "Venue" },
    { key: "capacity", label: "Capacity", type: "number" },
    { key: "cover_image_url", label: "Event banner path or URL", upload: true, wide: true },
    { key: "short_description", label: "Short description", type: "textarea", required: true, wide: true },
    { key: "full_description", label: "Full description", type: "textarea", wide: true },
    { key: "eligibility", label: "Eligibility", type: "textarea", wide: true },
    { key: "agenda", label: "Agenda · JSON array", type: "textarea", wide: true },
    { key: "speakers", label: "Speakers · JSON array", type: "textarea", wide: true },
    { key: "important_instructions", label: "Important instructions", type: "textarea", wide: true },
    { key: "registration_status", label: "Registration status", type: "event-status" },
    { key: "is_published", label: "Publish event", type: "checkbox" },
  ],
  gallery: [
    { key: "title", label: "Title" },
    { key: "category", label: "Category", required: true },
    { key: "media_type", label: "Media type", type: "media-type", required: true },
    { key: "media_url", label: "Media path or URL", required: true, upload: true, wide: true },
    { key: "caption", label: "Caption", type: "textarea", wide: true },
    { key: "is_published", label: "Publish media", type: "checkbox" },
  ],
  announcements: [
    { key: "title", label: "Title", required: true },
    { key: "slug", label: "URL slug", required: true },
    { key: "category", label: "Category", required: true },
    { key: "priority", label: "Priority", type: "priority" },
    { key: "cover_image_url", label: "Cover image path or URL", upload: true, wide: true },
    { key: "description", label: "Description", type: "textarea", required: true, wide: true },
    { key: "external_url", label: "External link" },
    { key: "is_published", label: "Publish update", type: "checkbox" },
  ],
};

function AdminPanel() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [registrations, setRegistrations] = useState<Record<string, unknown>[]>([]);
  const [managedEvents, setManagedEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationEventFilter, setRegistrationEventFilter] = useState("");
  const [settings, setSettings] = useState<Record<string, unknown>[]>([]);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [draft, setDraft] = useState<Record<string, string | boolean>>({});
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [projectCountInput, setProjectCountInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedCount = settings.find((item) => item.key === "project_count")?.value;
    setProjectCountInput(typeof savedCount === "number" ? String(savedCount) : "");
  }, [settings]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function load() {
      if (tab === "registrations") {
        const query = new URLSearchParams();
        if (registrationSearch) query.set("search", registrationSearch);
        if (registrationEventFilter) query.set("eventId", registrationEventFilter);
        try {
          const [response, eventsResponse] = await Promise.all([
            fetch(`/api/admin/registrations?${query.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch("/api/admin/events", { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const result = await response.json() as { data?: Record<string, unknown>[]; message?: string };
          if (!response.ok) throw new Error(result.message || "Could not load registrations.");
          if (cancelled) return;
          setRegistrations(result.data || []);
          if (eventsResponse.ok) {
            const eventResult = await eventsResponse.json() as { data: Array<{ id: string; title: string }> };
            setManagedEvents(eventResult.data);
          }
        } catch (error) {
          if (!cancelled) setNotice(error instanceof Error ? error.message : "Could not load registrations.");
        }
        return;
      }
      const path = tab === "overview" ? "overview"
          : tab === "settings" ? "settings"
            : tab;
      try {
        const response = await fetch(`/api/admin/${path}`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json() as { data?: Record<string, unknown>[]; message?: string } & Record<string, unknown>;
        if (!response.ok) throw new Error(result.message || "Could not load admin data.");
        if (cancelled) return;
        if (tab === "overview") setOverview(result);
        else if (tab === "settings") setSettings(result.data || []);
        else setRecords(result.data || []);
      } catch (error) {
        if (!cancelled) setNotice(error instanceof Error ? error.message : "Could not load admin data.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [tab, token, registrationSearch, registrationEventFilter]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as { accessToken?: string; message?: string };
      if (!response.ok || !result.accessToken) throw new Error(result.message || "Could not sign in.");
      setToken(result.accessToken);
      setPassword("");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  function beginCreate(resource: AdminResource) {
    const initial: Record<string, string | boolean> = {};
    adminFields[resource].forEach((field) => {
      initial[field.key] = field.type === "checkbox" ? false : field.key === "registration_status" ? "upcoming" : field.key === "media_type" ? "image" : "";
    });
    setEditing(null);
    setDraft(initial);
    setNotice("");
  }

  function beginEdit(resource: AdminResource, record: Record<string, unknown>) {
    const values: Record<string, string | boolean> = {};
    adminFields[resource].forEach((field) => {
      const value = record[field.key];
      if (field.type === "checkbox") values[field.key] = value === true;
      else if (field.key === "skills" && Array.isArray(value)) values[field.key] = value.join(", ");
      else if ((field.key === "agenda" || field.key === "speakers") && Array.isArray(value)) values[field.key] = JSON.stringify(value, null, 2);
      else if (field.type === "datetime-local" && typeof value === "string") values[field.key] = new Date(value).toISOString().slice(0, 16);
      else values[field.key] = typeof value === "string" || typeof value === "number" ? String(value) : "";
    });
    setEditing(record);
    setDraft(values);
    setNotice("");
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminResources.some((resource) => resource.id === tab)) return;
    setBusy(true);
    const resource = tab as AdminResource;
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(draft)) {
      if (typeof value === "boolean") payload[key] = value;
      else if (value === "") continue;
      else if (key === "skills") payload[key] = value.split(",").map((skill) => skill.trim()).filter(Boolean);
      else if (key === "capacity") payload[key] = Number(value);
      else if (["starts_at", "ends_at", "registration_deadline"].includes(key)) payload[key] = new Date(value).toISOString();
      else if (key === "agenda" || key === "speakers") {
        try { payload[key] = JSON.parse(value); } catch { setNotice(`${key} must be valid JSON.`); setBusy(false); return; }
      }
      else payload[key] = value;
    }
    try {
      const isEditing = Boolean(editing?.id);
      const response = await fetch(isEditing ? `/api/admin/${resource}/${editing?.id}` : `/api/admin/${resource}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not save this item.");
      setNotice(isEditing ? "Changes saved." : "Item created.");
      setEditing(null);
      setDraft({});
      const refresh = await fetch(`/api/admin/${resource}`, { headers: { Authorization: `Bearer ${token}` } });
      const refreshed = await refresh.json() as { data: Record<string, unknown>[] };
      setRecords(refreshed.data);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save this item.");
    } finally {
      setBusy(false);
    }
  }

  async function removeRecord(resource: AdminResource, record: Record<string, unknown>) {
    if (!record.id || !window.confirm("Delete this item? This cannot be undone.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${resource}/${record.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Could not delete this item.");
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setNotice("Item deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete this item.");
    } finally {
      setBusy(false);
    }
  }

  async function updateRegistration(record: Record<string, unknown>, status: string) {
    if (!record.id) return;
    const response = await fetch(`/api/admin/registrations/${record.id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) setRegistrations((current) => current.map((item) => item.id === record.id ? { ...item, status } : item));
    else setNotice("Could not update this registration.");
  }

  async function uploadMedia(file: File, fieldKey: string) {
    const formData = new FormData();
    formData.append("file", file);
    setBusy(true);
    setNotice("Uploading media...");
    try {
      const response = await fetch("/api/admin/media", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const result = await response.json() as { path?: string; mediaType?: string; message?: string };
      if (!response.ok || !result.path) throw new Error(result.message || "Could not upload this file.");
      setDraft((current) => ({ ...current, [fieldKey]: result.path!, ...(tab === "gallery" ? { media_type: result.mediaType || "image" } : {}) }));
      setNotice("Upload complete. Save the item to publish it.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not upload this file.");
    } finally {
      setBusy(false);
    }
  }

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      let value: unknown;
      try { value = JSON.parse(settingValue); } catch { value = settingValue; }
      const response = await fetch(`/api/admin/settings/${encodeURIComponent(settingKey)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value, is_public: true }),
      });
      const result = await response.json() as { data?: Record<string, unknown>; message?: string };
      if (!response.ok || !result.data) throw new Error(result.message || "Could not save this setting.");
      setSettings((current) => [...current.filter((item) => item.key !== settingKey), result.data!]);
      setNotice("Setting saved.");
      setSettingKey("");
      setSettingValue("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not save this setting.");
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    const query = registrationEventFilter ? `?eventId=${encodeURIComponent(registrationEventFilter)}` : "";
    const response = await fetch(`/api/admin/registrations/export.csv${query}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) { setNotice("Could not export registrations."); return; }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-registrations.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function updateProjectCount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(new FormData(event.currentTarget).get("project_count"));
    const response = await fetch("/api/admin/settings/project_count", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value, is_public: true }),
    });
    if (response.ok) {
      setNotice("Project count saved.");
      setSettings((current) => [...current.filter((item) => item.key !== "project_count"), { key: "project_count", value, is_public: true }]);
    } else setNotice("Could not save the project count.");
  }

  if (!token) {
    return (
      <main className="admin-login-page">
        <a className="brand" href="/" aria-label="Return to community site"><span className="brand-mark"><img src="/assets/sbg-mark.jpg" alt="" /></span><span className="brand-copy"><strong>BUILDER COMMUNITY</strong><span>ADMINISTRATION</span></span></a>
        <form className="admin-login-card" onSubmit={login}>
          <span className="eyebrow">AUTHORIZED TEAM ONLY</span>
          <h1>Community<br /><span>management.</span></h1>
          <p>Sign in with an authorized community administrator account.</p>
          <label htmlFor="admin-email">EMAIL ADDRESS</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">PASSWORD</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {loginError && <p className="admin-alert" role="alert">{loginError}</p>}
          <button className="button button-orange" disabled={busy} type="submit">{busy ? "SIGNING IN..." : "SIGN IN"} <ArrowRight size={15} /></button>
          <a className="admin-back-link" href="/">← Back to the community website</a>
        </form>
      </main>
    );
  }

  const activeResource = adminResources.find((resource) => resource.id === tab);
  const eventCounts = overview || {};
  const nav = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    ...adminResources,
    { id: "registrations" as const, label: "Registrations", icon: ClipboardList },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="brand" href="/"><span className="brand-mark"><img src="/assets/sbg-mark.jpg" alt="" /></span><span className="brand-copy"><strong>BUILDER COMMUNITY</strong><span>ADMIN CONSOLE</span></span></a>
        <span className="admin-nav-label">WORKSPACE</span>
        <nav aria-label="Admin navigation">{nav.map(({ id, label, icon: Icon }) => <button className={tab === id ? "admin-nav-item active" : "admin-nav-item"} type="button" key={id} onClick={() => { setTab(id); setEditing(null); setDraft({}); setNotice(""); }}><Icon size={16} />{label}</button>)}</nav>
        <div className="admin-sidebar-bottom"><a href="/">View community site <ArrowUpRight size={14} /></a><button type="button" onClick={() => { setToken(""); setOverview(null); setRecords([]); }}>Sign out <LogOut size={14} /></button></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><span>AMITY UNIVERSITY PATNA <i>/</i> ADMINISTRATION</span><span><span className="admin-status-dot" /> SECURE SESSION</span></header>
        <div className="admin-page-heading"><div><p className="eyebrow">COMMUNITY WORKSPACE</p><h1>{nav.find((item) => item.id === tab)?.label}</h1></div>{activeResource && <button className="admin-primary-button" type="button" onClick={() => beginCreate(activeResource.id)}><ImagePlus size={15} /> Create {activeResource.id === "gallery" ? "media" : activeResource.label.slice(0, -1)}</button>}{tab === "registrations" && <button className="admin-primary-button" type="button" onClick={() => void exportCsv()}><Download size={15} /> Export CSV</button>}</div>
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        {tab === "overview" && (
          <>
            <div className="admin-metric-grid">{[
              { label: "Members", value: eventCounts.members },
              { label: "Events", value: eventCounts.events },
              { label: "Registrations", value: eventCounts.registrations },
              { label: "Updates", value: eventCounts.announcements },
            ].map(({ label, value }) => <div className="admin-metric" key={label}><span>{label}</span><strong>{typeof value === "number" ? value : "—"}</strong><small>DATABASE RECORDS</small></div>)}</div>
            <section className="admin-panel"><div className="admin-panel-heading"><h2>Recent activity</h2><span>LIVE FROM ACTIVITY LOG</span></div>{Array.isArray(eventCounts.recentActivity) && eventCounts.recentActivity.length > 0 ? <div className="admin-record-list">{(eventCounts.recentActivity as Record<string, unknown>[]).map((item) => <article className="admin-record" key={String(item.id)}><div><strong>{String(item.action)} · {String(item.entity_type)}</strong><small>{String(item.created_at)}</small></div></article>)}</div> : <p className="admin-empty">No activity has been recorded yet.</p>}</section>
          </>
        )}

        {activeResource && (
          <div className="admin-content-grid">
            <section className="admin-panel"><div className="admin-panel-heading"><h2>{activeResource.label}</h2><span>{records.length} RECORDS</span></div>
              {records.length > 0 ? <div className="admin-record-list">{records.map((record) => <article className="admin-record" key={String(record.id)}><div><strong>{String(record.full_name || record.title || record.name || record.caption || record.slug || "Untitled")}</strong><small>{String(record.designation || record.category || record.slug || "")}{record.is_published === true ? " · PUBLISHED" : " · DRAFT"}</small></div><div className="admin-record-actions"><button type="button" title="Edit item" onClick={() => beginEdit(activeResource.id, record)}><Pencil size={15} /></button><button type="button" title="Delete item" disabled={busy} onClick={() => void removeRecord(activeResource.id, record)}><Trash2 size={15} /></button></div></article>)}</div> : <p className="admin-empty">No records yet. Create one when you&apos;re ready.</p>}
            </section>
            {(editing || Object.keys(draft).length > 0) && <form className="admin-panel admin-editor" onSubmit={saveRecord}><div className="admin-panel-heading"><h2>{editing ? "Edit item" : "New item"}</h2><button className="admin-close-editor" type="button" onClick={() => { setEditing(null); setDraft({}); }} aria-label="Close editor"><X size={17} /></button></div>
              <div className="admin-form-grid">{adminFields[activeResource.id].map((field) => <div className={field.wide ? "admin-field wide" : "admin-field"} key={field.key}>
                {field.type === "checkbox" ? <label className="admin-check-field"><input type="checkbox" checked={draft[field.key] === true} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.checked }))} />{field.label}</label> : <><label htmlFor={`admin-${field.key}`}>{field.label.toUpperCase()}</label>
                  {field.type === "textarea" ? <textarea id={`admin-${field.key}`} value={String(draft[field.key] ?? "")} required={field.required} rows={3} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))} />
                    : field.type === "event-status" ? <select id={`admin-${field.key}`} value={String(draft[field.key] || "upcoming")} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}><option value="upcoming">Upcoming</option><option value="registration_open">Registration open</option><option value="registration_closed">Registration closed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                      : field.type === "media-type" ? <select id={`admin-${field.key}`} value={String(draft[field.key] || "image")} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}><option value="image">Image</option><option value="video">Video</option></select>
                        : field.type === "priority" ? <select id={`admin-${field.key}`} value={String(draft[field.key] || "normal")} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}><option value="normal">Normal</option><option value="important">Important</option></select>
                          : <input id={`admin-${field.key}`} type={field.type || "text"} min={field.type === "number" ? "0" : undefined} value={String(draft[field.key] ?? "")} required={field.required} onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))} />}
                  {field.upload && <label className="admin-upload"><Upload size={13} /> Upload file<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadMedia(file, field.key); }} /></label>}
                </>}
              </div>)}</div>
              <button className="admin-primary-button admin-save" type="submit" disabled={busy}>{busy ? "SAVING..." : editing ? "SAVE CHANGES" : "CREATE ITEM"} <Check size={15} /></button>
            </form>}
          </div>
        )}

        {tab === "registrations" && <section className="admin-panel"><div className="admin-panel-heading"><h2>Event participants</h2><span>PRIVATE · ADMIN ACCESS ONLY</span></div><div className="registration-filters"><input type="search" value={registrationSearch} onChange={(event) => setRegistrationSearch(event.target.value)} placeholder="Search name or college email" aria-label="Search registrations" /><select value={registrationEventFilter} onChange={(event) => setRegistrationEventFilter(event.target.value)} aria-label="Filter registrations by event"><option value="">All events</option>{managedEvents.map((managedEvent) => <option key={managedEvent.id} value={managedEvent.id}>{managedEvent.title}</option>)}</select></div>{registrations.length > 0 ? <div className="registration-table-wrap"><table className="registration-table"><thead><tr><th>NAME</th><th>COLLEGE EMAIL</th><th>CONTACT</th><th>EVENT</th><th>COURSE</th><th>YEAR</th><th>STATUS</th><th>REGISTERED</th></tr></thead><tbody>{registrations.map((row) => <tr key={String(row.id)}><td>{String(row.full_name)}</td><td>{String(row.college_email)}</td><td>{String(row.contact_number)}</td><td>{String((row.event as { title?: string } | null)?.title || row.event_id)}</td><td>{String(row.course)}</td><td>{String(row.academic_year)}</td><td><select value={String(row.status)} onChange={(event) => void updateRegistration(row, event.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></td><td>{formatDate(String(row.created_at))}</td></tr>)}</tbody></table></div> : <p className="admin-empty">No registrations match this filter.</p>}</section>}

        {tab === "settings" && <div className="admin-settings-grid"><section className="admin-panel"><div className="admin-panel-heading"><h2>Public site settings</h2><span>EDITABLE CONTENT</span></div>{settings.length ? settings.map((item) => <div className="admin-setting-row" key={String(item.key)}><span>{String(item.key)}</span><code>{JSON.stringify(item.value)}</code></div>) : <p className="admin-empty">No public settings have been added.</p>}</section><section className="admin-panel"><div className="admin-panel-heading"><h2>Add or update setting</h2><Settings size={15} /></div><form className="admin-setting-form" onSubmit={saveSetting}><label>SETTING KEY<input required pattern="[a-z][a-z0-9_]{1,63}" value={settingKey} onChange={(event) => setSettingKey(event.target.value)} placeholder="e.g. instagram_url" /></label><label>VALUE · TEXT OR JSON<textarea required rows={3} value={settingValue} onChange={(event) => setSettingValue(event.target.value)} placeholder="Paste a URL or JSON value" /></label><button className="admin-primary-button" type="submit" disabled={busy}>SAVE SETTING <Check size={15} /></button></form></section><section className="admin-panel"><div className="admin-panel-heading"><h2>Project count</h2><span>ONLY DISPLAY VERIFIED COUNTS</span></div><form className="admin-project-count" onSubmit={updateProjectCount}><label htmlFor="project-count">Verified completed projects count</label><input id="project-count" name="project_count" type="number" min="0" step="1" required value={projectCountInput} onChange={(event) => setProjectCountInput(event.target.value)} /><button className="admin-primary-button" type="submit">UPDATE COUNT</button></form></section></div>}

        <footer className="admin-footer"><span>Changes are recorded to the community database.</span><span>SUPABASE AUTH · SERVER-SIDE ROLE CHECK</span></footer>
      </main>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-fallback">
          <span className="eyebrow">SOMETHING WENT SIDEWAYS</span>
          <h1>This page hit a snag.</h1>
          <p>Please refresh to keep exploring the community. If it keeps happening, come back in a moment.</p>
          <a className="button button-orange" href="/">Reload the community site</a>
        </main>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      {window.location.pathname === "/admin" ? <AdminPanel /> : <CommunitySite />}
    </ErrorBoundary>
  );
}

export default App;
