import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * The AWS Builder Community mark (/assets/sbg-mark.png) is the original
 * 1600x1600 community emblem with its baked-in white plate alpha-keyed out, so
 * the artwork itself is fully transparent. There is no SVG source, so we do NOT
 * redraw or approximate anything: we slice the ORIGINAL transparent asset into
 * four exact quadrants using background-position on a 200% x 200% background.
 * With every transform back at zero the four pieces tile into a pixel-exact
 * copy of the source image — nothing is invented.
 *
 * Scroll timeline (the section is 200vh with a sticky stage, so the animation is
 * driven entirely by real scroll progress — never autoplay). The phases never
 * overlap, so the copy can only appear once the mark has fully locked:
 *   0.00 → 0.52  the four pieces blast in from the corners, each spinning the
 *                whole way and locking one after another (a staggered click)
 *   0.52 → 0.68  the backdrop plate snaps in BEHIND the assembled logo
 *   0.54 → 0.72  a light sweep rakes across the locked mark
 *   0.70 → 0.90  the brand reveal copy rises into place
 * A scale kick on the whole mark fires at the final lock so the assembly lands
 * with an impact rather than drifting to a stop.
 */
const ASSEMBLE_END = 0.52;
const PLATE_END = 0.68;
const COPY_START = 0.7;

const PIECES = [
  { key: "tl", dx: -1, dy: -1, spin: -250 },
  { key: "tr", dx: 1, dy: -1, spin: 210 },
  { key: "bl", dx: -1, dy: 1, spin: 280 },
  { key: "br", dx: 1, dy: 1, spin: -190 },
] as const;

function LogoPiece({
  progress,
  pieceKey,
  dx,
  dy,
  spin,
  index,
}: {
  progress: MotionValue<number>;
  pieceKey: string;
  dx: number;
  dy: number;
  spin: number;
  index: number;
}) {
  // Each piece locks a touch earlier than the next, so they land like a
  // four-beat "click" instead of a single soft settle.
  const end = ASSEMBLE_END - (PIECES.length - 1 - index) * 0.045;
  const x = useTransform(progress, [0, end], [`${dx * 340}%`, "0%"]);
  const y = useTransform(progress, [0, end], [`${dy * 260}%`, "0%"]);
  // Spin the full way in, overshoot just past zero, then settle — a snappy
  // whip-crack landing.
  const rotate = useTransform(
    progress,
    [0, end * 0.84, end],
    [spin, -Math.sign(spin) * 14, 0],
  );
  const scale = useTransform(progress, [0, end * 0.86, end], [0.3, 1.16, 1]);
  // Depth: pieces rush forward from behind the plane as they arrive.
  const z = useTransform(progress, [0, end], [-260, 0]);
  const opacity = useTransform(progress, [0, 0.05], [0, 1]);
  // A heavier shadow while a tile is still in flight; it fades to nothing at the
  // exact moment the piece locks in, so the assembled logo has no seam.
  const depth = useTransform(progress, [0, end * 0.7, end], [1, 0.45, 0]);
  const boxShadow = useTransform(depth, (v) => `0 28px 64px rgba(0,0,0,${(0.44 * v).toFixed(3)})`);

  return (
    <motion.div
      className={`logo-piece logo-piece-${pieceKey}`}
      style={{
        x,
        y,
        z,
        rotate,
        scale,
        opacity,
        boxShadow,
        transformPerspective: 900,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Scroll-driven four-piece assembly of the existing community logo, followed by
 * a backdrop reveal and an editorial brand reveal. Falls back to a static,
 * fully assembled logo when reduced motion is requested.
 */
export default function LogoAssembly() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  // The whole mark kicks outward on the final lock so the assembly hits.
  const markScale = useTransform(
    progress,
    [ASSEMBLE_END - 0.06, ASSEMBLE_END, ASSEMBLE_END + 0.06],
    [1, 1.05, 1],
  );

  // Backdrop layer — snaps in ONLY after the four pieces have locked.
  const plateOpacity = useTransform(progress, [ASSEMBLE_END, ASSEMBLE_END + 0.1], [0, 1]);
  const plateScale = useTransform(progress, [ASSEMBLE_END, PLATE_END], [0.78, 1]);
  const plateRotate = useTransform(progress, [ASSEMBLE_END, PLATE_END], [-5, 0]);

  // The glow swells into a burst as the pieces slam home, then eases back.
  const glowOpacity = useTransform(
    progress,
    [0, 0.34, ASSEMBLE_END, PLATE_END],
    [0, 0.4, 1, 0.72],
  );
  const glowScale = useTransform(progress, [0.34, ASSEMBLE_END, PLATE_END], [0.7, 1.5, 1]);

  // A light sweep rakes across the mark right after it locks.
  const sweepX = useTransform(progress, [0.54, 0.72], ["-110%", "270%"]);
  const sweepOpacity = useTransform(progress, [0.54, 0.58, 0.7, 0.72], [0, 0.95, 0.95, 0]);

  const eyebrowOpacity = useTransform(progress, [0, 0.1], [0, 1]);

  // The copy reveals only after the plate has finished. Each line travels the
  // last stretch upward into its true layout position, so the resting place is
  // always the document-flow position — never a transform offset.
  const lineOneOpacity = useTransform(progress, [COPY_START, COPY_START + 0.1], [0, 1]);
  const lineOneY = useTransform(progress, [COPY_START, COPY_START + 0.1], [34, 0]);
  const lineTwoOpacity = useTransform(progress, [COPY_START + 0.05, COPY_START + 0.15], [0, 1]);
  const lineTwoY = useTransform(progress, [COPY_START + 0.05, COPY_START + 0.15], [24, 0]);
  const tagOpacity = useTransform(progress, [COPY_START + 0.1, COPY_START + 0.2], [0, 1]);
  const tagY = useTransform(progress, [COPY_START + 0.1, COPY_START + 0.2], [16, 0]);

  return (
    <section className="logo-assembly" ref={sectionRef} aria-label="AWS Builder Community — the community mark">
      <div className="logo-stage">
        <motion.div
          className="logo-stage-head"
          style={reduce ? undefined : { opacity: eyebrowOpacity }}
        >
          <span>THE COMMUNITY MARK</span>
          <span className="logo-stage-hint">SCROLL TO ASSEMBLE</span>
        </motion.div>

        <motion.div
          className="logo-mark"
          style={reduce ? undefined : { scale: markScale }}
        >
          <motion.div
            className="logo-glow"
            aria-hidden="true"
            style={reduce ? undefined : { opacity: glowOpacity, scale: glowScale }}
          />
          <motion.div
            className="logo-plate"
            aria-hidden="true"
            style={reduce ? undefined : { opacity: plateOpacity, scale: plateScale, rotate: plateRotate }}
          />
          {PIECES.map((piece, index) =>
            reduce ? (
              <div
                key={piece.key}
                className={`logo-piece logo-piece-${piece.key}`}
                aria-hidden="true"
              />
            ) : (
              <LogoPiece
                key={piece.key}
                progress={progress}
                pieceKey={piece.key}
                dx={piece.dx}
                dy={piece.dy}
                spin={piece.spin}
                index={index}
              />
            ),
          )}
          <div className="logo-sweep-clip" aria-hidden="true">
            <motion.div
              className="logo-sweep"
              style={reduce ? { opacity: 0 } : { x: sweepX, opacity: sweepOpacity }}
            />
          </div>
          <span className="logo-sr-label">AWS Builder Community — Amity University Patna</span>
        </motion.div>

        <div className="logo-words">
          <motion.h2 style={reduce ? undefined : { opacity: lineOneOpacity, y: lineOneY }}>
            AWS BUILDER COMMUNITY
          </motion.h2>
          <motion.p
            className="logo-words-institution"
            style={reduce ? undefined : { opacity: lineTwoOpacity, y: lineTwoY }}
          >
            Amity University Patna
          </motion.p>
          <motion.p
            className="logo-words-tagline"
            style={reduce ? undefined : { opacity: tagOpacity, y: tagY }}
          >
            Four pieces. One vision. Building the future.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
