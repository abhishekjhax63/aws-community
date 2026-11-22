import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type SlidePhoto = { src: string; alt?: string };

type Props = {
  photos: SlidePhoto[];
  interval?: number;
  variant?: "hero" | "cinema";
  className?: string;
  ariaLabel?: string;
  showControls?: boolean;
  showDots?: boolean;
};

/* ------------------------------------------------------------------
   Editorial copy. This lives in its own grid cell beside the
   photographs — never on top of one. The photographs themselves are
   never filtered, tinted, labelled or annotated.
   ------------------------------------------------------------------ */
type Phrase = { eyebrow: string; lead: string; tail: string; note: string };

const PHRASES: Phrase[] = [
  {
    eyebrow: "SECTION 01",
    lead: "BUILT BY",
    tail: "COMMUNITY.",
    note: "Students, faculty and builders turning cloud curiosity into work that ships.",
  },
  {
    eyebrow: "SECTION 02",
    lead: "IDEAS INTO",
    tail: "ACTION.",
    note: "Workshops and build sessions where a rough sketch becomes a running project.",
  },
  {
    eyebrow: "SECTION 03",
    lead: "LEARN. BUILD.",
    tail: "CONNECT.",
    note: "A student-led campus community for anyone starting out with cloud technology.",
  },
  {
    eyebrow: "SECTION 04",
    lead: "WHERE BUILDERS",
    tail: "MEET.",
    note: "Hands-on sessions, hackathons and the quiet time in between to build together.",
  },
  {
    eyebrow: "SECTION 05",
    lead: "CREATING",
    tail: "WHAT'S NEXT.",
    note: "Every event is one more step toward whatever the community builds next.",
  },
];

type LayoutKey = "a" | "b" | "c" | "d";
const LAYOUTS: LayoutKey[] = ["a", "b", "c", "d"];

/** Angular corner cuts for the hero plate, rotated so no edge ever repeats. */
const HERO_CLIPS = [
  "polygon(0 0, 100% 0, 100% 76%, 82% 100%, 0 100%)",
  "polygon(18% 0, 100% 0, 100% 100%, 0 100%, 0 26%)",
  "polygon(0 0, 82% 0, 100% 22%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 78%)",
];

const pad = (n: number) => String(n).padStart(2, "0");

type SlideSpec = {
  layout: LayoutKey;
  phrase: Phrase;
  main: SlidePhoto;
  second: SlidePhoto;
  third: SlidePhoto;
};

/**
 * One slide per photograph, each rendered as a rotating art-directed
 * composition. Every photo in the gallery is used as a real photograph —
 * nothing is fabricated and no image is ever altered.
 */
function buildSlides(photos: SlidePhoto[]): SlideSpec[] {
  const n = photos.length;
  if (!n) return [];
  return photos.map((photo, i) => {
    const layout: LayoutKey =
      n >= 3 ? LAYOUTS[i % LAYOUTS.length] : n === 2 ? (i % 2 === 0 ? "b" : "c") : "c";
    return {
      layout,
      phrase: PHRASES[i % PHRASES.length],
      main: photo,
      second: photos[(i + 1) % n],
      third: photos[(i + 2) % n],
    };
  });
}

/* ------------------------------------------------------------------
   Composition A — large hero photograph with an asymmetrical clipped
   edge, an offset secondary image and bold typography beside it.
   ------------------------------------------------------------------ */
function CompositionA({
  spec,
  index,
  active,
  panel,
}: CompositionProps) {
  return (
    <article className={`ed-slide ed-slide--a ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <div className="ed-cell ed-cell--text" data-reveal="up">
        <EdText phrase={spec.phrase} num={pad(index + 1)} />
      </div>
      <div className="ed-cell ed-cell--a-media">
        {panel(spec.main, "ed-panel--a-main", "scale", 60)}
        {panel(spec.second, "ed-panel--a-inset", "up", 260)}
        <span className="ed-accent ed-accent--a" aria-hidden="true" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------
   Composition B — two overlapping rectangles of different sizes with
   angular cuts and a small orange accent in the negative space.
   ------------------------------------------------------------------ */
function CompositionB({
  spec,
  index,
  active,
  panel,
}: CompositionProps) {
  return (
    <article className={`ed-slide ed-slide--b ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <div className="ed-cell ed-cell--text" data-reveal="up">
        <EdText phrase={spec.phrase} num={pad(index + 1)} />
      </div>
      <div className="ed-cell ed-cell--b-media">
        {panel(spec.main, "ed-panel--b-main", "right", 80)}
        {panel(spec.second, "ed-panel--b-second", "left", 240)}
        <span className="ed-accent ed-accent--b" aria-hidden="true" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------
   Composition C — a large landscape photograph inside an architectural
   frame with layered border detail, revealed by a clip-path wipe, with
   the editorial typography outside the photograph.
   ------------------------------------------------------------------ */
function CompositionC({
  spec,
  index,
  active,
  panel,
}: CompositionProps) {
  return (
    <article className={`ed-slide ed-slide--c ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <div className="ed-cell ed-cell--c-media">
        <div className="ed-arch" data-reveal="up">
          {panel(spec.main, "ed-panel--c", undefined, 0, true)}
          <span className="ed-arch-tick" aria-hidden="true" />
        </div>
      </div>
      <div className="ed-cell ed-cell--text" data-reveal="up" style={{ "--d": "200ms" } as CSSProperties}>
        <EdText phrase={spec.phrase} num={pad(index + 1)} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------
   Composition D — asymmetric magazine collage: one dominant photograph
   with two smaller supporting photographs beside it.
   ------------------------------------------------------------------ */
function CompositionD({
  spec,
  index,
  active,
  panel,
}: CompositionProps) {
  return (
    <article className={`ed-slide ed-slide--d ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <div className="ed-cell ed-cell--text" data-reveal="up">
        <EdText phrase={spec.phrase} num={pad(index + 1)} />
        <span className="ed-accent ed-accent--d" aria-hidden="true" />
      </div>
      <div className="ed-cell ed-cell--d-main">
        {panel(spec.main, "ed-panel--d-main", "scale", 60)}
      </div>
      <div className="ed-cell ed-cell--d-side">
        {panel(spec.second, "ed-panel--d-s1", "right", 220)}
        {panel(spec.third, "ed-panel--d-s2", "right", 340)}
      </div>
    </article>
  );
}

type PanelFactory = (
  photo: SlidePhoto,
  className: string,
  reveal?: string,
  delay?: number,
  wipe?: boolean,
) => JSX.Element;

type CompositionProps = {
  spec: SlideSpec;
  index: number;
  active: boolean;
  panel: PanelFactory;
};

function EdText({ phrase, num }: { phrase: Phrase; num: string }) {
  return (
    <div className="ed-text">
      <p className="ed-marker">
        <span className="ed-marker-num">{num}</span>
        <span className="ed-marker-rule" aria-hidden="true" />
        <span className="ed-marker-label">{phrase.eyebrow}</span>
      </p>
      <h3 className="ed-headline">
        <span className="ed-headline-line">{phrase.lead}</span>
        <span className="ed-headline-line ed-headline-accent">{phrase.tail}</span>
      </h3>
      <p className="ed-note">{phrase.note}</p>
    </div>
  );
}

/**
 * Editorial photo showcase.
 *
 * Four distinct compositions (A/B/C/D) rotate as the slideshow advances, so
 * no two consecutive slides look alike. Every composition keeps its
 * typography in a dedicated layout column beside the photographs — no title,
 * caption or graphic text is ever placed on top of an image, and the original
 * photographs are never filtered, tinted or annotated.
 *
 * Features: automatic advance, cinematic crossfade, per-composition entrance
 * transitions (scale reveal, horizontal slide, clip-path wipe, layered
 * movement), manual next/previous, pause/resume, an animated progress marker,
 * touch swipe, loading placeholders and a clean empty state when no
 * photographs exist.
 */
export default function PhotoSlideshow({
  photos,
  interval = 5600,
  variant = "cinema",
  className,
  ariaLabel = "Community photographs",
  showControls = true,
  showDots,
}: Props) {
  const count = photos.length;
  const dots = showDots ?? variant === "cinema";
  const isHero = variant === "hero";
  const slides = useMemo(() => buildSlides(photos), [photos]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const startX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const markLoaded = useCallback((src: string) => {
    setLoaded((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  // Automatic advance. Cleared and restarted on every change so manual
  // navigation also resets the timer.
  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setTimeout(() => go(index + 1), interval);
    return () => window.clearTimeout(timer);
  }, [index, paused, count, interval, go]);

  // Keep the index in range if the photo list changes underneath us.
  useEffect(() => {
    setIndex((current) => (current >= count ? 0 : current));
  }, [count]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const from = startX.current;
    startX.current = null;
    if (from === null) return;
    const dx = event.clientX - from;
    if (Math.abs(dx) > 44) go(dx < 0 ? index + 1 : index - 1);
  };

  // Keyboard support (WAI-ARIA carousel pattern): the region itself is
  // focusable, arrow keys move between slides and Space toggles playback.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      setPaused((value) => !value);
    }
  };

  if (count === 0) {
    return (
      <div className={["photo-empty", className].filter(Boolean).join(" ")}>
        <span className="photo-empty-eyebrow">PHOTOGRAPHS</span>
        <h3>No photographs yet.</h3>
        <p>
          Community photographs will appear here once they are uploaded by the admin team — we would
          rather show nothing than invent a memory.
        </p>
      </div>
    );
  }

  const panel: PanelFactory = (photo, className, reveal, delay = 0, wipe = false) => {
    const img = (
      <img
        src={photo.src}
        alt={photo.alt ?? ""}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={() => markLoaded(photo.src)}
        onError={() => markLoaded(photo.src)}
      />
    );
    return (
      <div
        className={`ed-panel ${className}`}
        data-reveal={reveal}
        style={reveal ? ({ "--d": `${delay}ms` } as CSSProperties) : undefined}
      >
        {!loaded[photo.src] && <span className="ed-shimmer" aria-hidden="true" />}
        {wipe ? <span className="ed-wipe">{img}</span> : img}
      </div>
    );
  };

  const compositionProps = (spec: SlideSpec, i: number) => ({
    spec,
    index: i,
    active: i === index,
    panel,
  });

  return (
    <div
      className={["photo-slideshow", `photo-slideshow-${variant}`, className].filter(Boolean).join(" ")}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        startX.current = null;
      }}
    >
      <div className="photo-stage">
        {isHero
          ? photos.map((photo, i) => (
              <div
                key={photo.src}
                className={`ed-slide ed-slide--hero ${i === index ? "is-active" : ""}`}
                aria-hidden={i !== index}
              >
                <div
                  className="ed-panel ed-panel--hero"
                  data-reveal="scale"
                  style={{ clipPath: HERO_CLIPS[i % HERO_CLIPS.length] } as CSSProperties}
                >
                  {!loaded[photo.src] && <span className="ed-shimmer" aria-hidden="true" />}
                  <img
                    src={photo.src}
                    alt={photo.alt ?? ""}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onLoad={() => markLoaded(photo.src)}
                    onError={() => markLoaded(photo.src)}
                  />
                </div>
              </div>
            ))
          : slides.map((spec, i) => {
              const props = compositionProps(spec, i);
              const key = `${spec.main.src}-${i}`;
              if (spec.layout === "a") return <CompositionA key={key} {...props} />;
              if (spec.layout === "b") return <CompositionB key={key} {...props} />;
              if (spec.layout === "c") return <CompositionC key={key} {...props} />;
              return <CompositionD key={key} {...props} />;
            })}
      </div>

      <div className={`ed-bar ${isHero ? "ed-bar--hero" : ""}`}>
        <div className="ed-bar-left">
          <span className="ed-bar-count">
            <b>{pad(index + 1)}</b>
            <i>/</i>
            {pad(count)}
          </span>
          <span className="ed-bar-track" aria-hidden="true">
            <span
              key={`${index}-${paused}`}
              className={`ed-bar-fill ${paused ? "is-paused" : ""}`}
              style={{ animationDuration: `${interval}ms` }}
            />
          </span>
        </div>

        <div className="ed-bar-right">
          {dots && count > 1 && (
            <div className="ed-ticks" role="group" aria-label="Choose slide">
              {slides.map((spec, i) => (
                <button
                  key={`${spec.main.src}-${i}`}
                  type="button"
                  className={`ed-tick ${i === index ? "is-active" : ""}`}
                  aria-current={i === index}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => go(i)}
                >
                  {pad(i + 1)}
                </button>
              ))}
            </div>
          )}

          {showControls && count > 1 && (
            <div className="photo-controls">
              <button
                className="photo-btn"
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="photo-btn photo-btn-toggle"
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
              <button
                className="photo-btn"
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next photograph"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
