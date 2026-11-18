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
 * driven entirely by real scroll progress — never autoplay). The three phases
 * never overlap, so the copy can only appear once the mark has fully locked:
 *   0.00 → 0.52  the four pieces fly in from the corners and lock together
 *   0.52 → 0.68  the backdrop plate appears BEHIND the assembled logo
 *   0.70 → 0.90  the brand reveal copy fades up, in its own layout container
 * Nothing sits behind the pieces while they are still in flight.
 */
const ASSEMBLE_END = 0.52;
const PLATE_END = 0.68;
const COPY_START = 0.7;

const PIECES = [
  { key: "tl", dx: -1, dy: -1, rot: -15 },
  { key: "tr", dx: 1, dy: -1, rot: 15 },
  { key: "bl", dx: -1, dy: 1, rot: 15 },
  { key: "br", dx: 1, dy: 1, rot: -15 },
] as const;

function LogoPiece({
  progress,
  pieceKey,
  dx,
  dy,
  rot,
}: {
  progress: MotionValue<number>;
  pieceKey: string;
  dx: number;
  dy: number;
  rot: number;
}) {
  const x = useTransform(progress, [0, ASSEMBLE_END], [`${dx * 260}%`, "0%"]);
  const y = useTransform(progress, [0, ASSEMBLE_END], [`${dy * 190}%`, "0%"]);
  const rotate = useTransform(progress, [0, ASSEMBLE_END], [rot, 0]);
  const scale = useTransform(progress, [0, ASSEMBLE_END], [0.7, 1]);
  const opacity = useTransform(progress, [0, 0.06], [0, 1]);
  // A soft depth shadow while a tile is still in flight; it fades to nothing at
  // the exact moment the piece locks in, so the assembled logo has no seam.
  const depth = useTransform(progress, [0, 0.4, ASSEMBLE_END], [1, 0.4, 0]);
  const boxShadow = useTransform(depth, (v) => `0 18px 40px rgba(0,0,0,${(0.38 * v).toFixed(3)})`);

  return (
    <motion.div
      className={`logo-piece logo-piece-${pieceKey}`}
      style={{ x, y, rotate, scale, opacity, boxShadow }}
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

  // Separate backdrop layer — appears ONLY after the four pieces have locked,
  // and fully settles before the copy starts to reveal.
  const plateOpacity = useTransform(progress, [ASSEMBLE_END, ASSEMBLE_END + 0.12], [0, 1]);
  const plateScale = useTransform(progress, [ASSEMBLE_END, PLATE_END], [0.84, 1]);

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

        <div className="logo-mark">
          <div className="logo-glow" aria-hidden="true" />
          <motion.div
            className="logo-plate"
            aria-hidden="true"
            style={reduce ? undefined : { opacity: plateOpacity, scale: plateScale }}
          />
          {PIECES.map((piece) =>
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
                rot={piece.rot}
              />
            ),
          )}
          <span className="logo-sr-label">AWS Builder Community — Amity University Patna</span>
        </div>

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
