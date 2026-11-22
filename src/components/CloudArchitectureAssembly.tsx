import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ------------------------------------------------------------------
   SIGNATURE CLOUD ARCHITECTURE ASSEMBLY
   An original, educational visualization — compute, object storage,
   database, networking and serverless modules assembling into a cloud
   architecture. Nothing here implies an official AWS mark: every node
   is an original geometric illustration built from the site's own
   palette. The scene is driven entirely by scroll progress (no autoplay,
   no scroll hijacking, no pinned whitespace beyond the track itself) and
   falls back to the completed architecture when reduced motion is asked
   for or on small screens.
   ------------------------------------------------------------------ */

const VIEW_W = 1000;
const VIEW_H = 640;
/** Cloud core centre, in viewBox units. */
const CORE = { x: 500, y: 250 };

type ServiceId = "ec2" | "s3" | "rds" | "vpc" | "lambda";

type Service = {
  id: ServiceId;
  name: string;
  role: string;
  detail: string;
  /** Final slot centre, in viewBox units. */
  x: number;
  y: number;
  /** Entry offset before assembly, in viewBox units. */
  ox: number;
  oy: number;
};

const SERVICES: Service[] = [
  {
    id: "ec2",
    name: "Amazon EC2",
    role: "Virtual compute capacity",
    detail:
      "Resizable virtual servers in the cloud. Choose an instance type, launch it and scale capacity up or down as demand changes.",
    x: 150,
    y: 126,
    ox: -96,
    oy: -74,
  },
  {
    id: "vpc",
    name: "Amazon VPC",
    role: "Isolated virtual networking",
    detail:
      "A logically isolated network where you define subnets, route tables and gateways so your cloud resources talk to each other safely.",
    x: 850,
    y: 118,
    ox: 96,
    oy: -74,
  },
  {
    id: "s3",
    name: "Amazon S3",
    role: "Scalable object storage",
    detail:
      "Durable object storage for any amount of data — images, backups, logs or static sites — served straight from the cloud.",
    x: 122,
    y: 448,
    ox: -96,
    oy: 74,
  },
  {
    id: "lambda",
    name: "AWS Lambda",
    role: "Event-driven serverless computing",
    detail:
      "Run code in response to events without managing servers. You pay only for the compute time your function actually uses.",
    x: 878,
    y: 438,
    ox: 96,
    oy: 74,
  },
  {
    id: "rds",
    name: "Amazon RDS",
    role: "Managed relational databases",
    detail:
      "Managed relational databases with automated backups, patching and scaling so your team can focus on the application.",
    x: 500,
    y: 578,
    ox: 0,
    oy: 96,
  },
];

/** The four cloud pieces, each with the offset and tilt it enters from. */
const CLOUD_PARTS = [
  { key: "base", ox: -24, oy: 46, rot: -7, cls: "cloud-part--base" },
  { key: "left", ox: -62, oy: -22, rot: -16, cls: "cloud-part--left" },
  { key: "right", ox: 64, oy: -30, rot: 15, cls: "cloud-part--right" },
  { key: "top", ox: 8, oy: -68, rot: 12, cls: "cloud-part--top" },
] as const;

/** Three architectural platforms under the cloud. */
const PLATFORMS = [
  { y: 392, w: 268 },
  { y: 424, w: 356 },
  { y: 456, w: 444 },
] as const;

const STAGES = [
  { at: 0.0, label: "STAGE 01", title: "DISASSEMBLED INFRASTRUCTURE" },
  { at: 0.1, label: "STAGE 02", title: "CLOUD ASSEMBLY" },
  { at: 0.42, label: "STAGE 03", title: "SERVICE MODULE ASSEMBLY" },
  { at: 0.64, label: "STAGE 04", title: "NETWORK ACTIVATION" },
  { at: 0.86, label: "STAGE 05", title: "FINAL CLOUD ARCHITECTURE" },
] as const;

/* Timeline — every value is a fraction of the section's scroll progress. */
const CLOUD: [number, number] = [0.08, 0.36];
const PLATFORM: [number, number] = [0.3, 0.47];
const MODULE: [number, number] = [0.44, 0.68];
const WIRE: [number, number] = [0.66, 0.87];
const FINAL: [number, number] = [0.86, 0.98];
const PACKET_GATE: [number, number] = [0.7, 0.82];

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

function Glyph({ id }: { id: ServiceId }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;
  if (id === "ec2") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="1.5" {...common} />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" {...common} />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" {...common} />
      </svg>
    );
  }
  if (id === "s3") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" {...common} />
        <path d="M4 12l8 3.5 8-3.5" {...common} />
        <path d="M4 16.5 12 20l8-3.5" {...common} />
      </svg>
    );
  }
  if (id === "rds") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="6" rx="7" ry="3" {...common} />
        <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" {...common} />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" {...common} />
      </svg>
    );
  }
  if (id === "vpc") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="2.4" {...common} />
        <circle cx="5" cy="18" r="2.4" {...common} />
        <circle cx="19" cy="18" r="2.4" {...common} />
        <path d="M10.4 7 6.6 15.7M13.6 7l3.8 8.7M7.4 18h9.2" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.4 3 6 13.2h4.6L9.9 21l7.4-10.2h-4.6L13.4 3Z" {...common} />
    </svg>
  );
}

/** A single cloud piece travelling into its final tile position. */
function CloudPart({
  progress,
  piece,
  index,
}: {
  progress: MotionValue<number>;
  piece: (typeof CLOUD_PARTS)[number];
  index: number;
}) {
  const start = CLOUD[0] + index * 0.018;
  const end = CLOUD[1] + index * 0.012;
  const x = useTransform(progress, [start, end], [`${piece.ox}%`, "0%"]);
  const y = useTransform(progress, [start, end], [`${piece.oy}%`, "0%"]);
  const rotate = useTransform(
    progress,
    [start, end * 0.88, end],
    [piece.rot, -piece.rot * 0.18, 0],
  );
  const scale = useTransform(progress, [start, end], [0.78, 1]);
  const opacity = useTransform(progress, [0, start], [0.7, 1]);

  return (
    <motion.span className={`cloud-part ${piece.cls}`} style={{ x, y, rotate, scale, opacity }} aria-hidden="true" />
  );
}

/** A service module that flies into its slot and can be selected. */
function ServiceModule({
  progress,
  service,
  index,
  selected,
  onSelect,
}: {
  progress: MotionValue<number>;
  service: Service;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const start = MODULE[0] + index * 0.03;
  const end = MODULE[1];
  const x = useTransform(progress, [start, end], [service.ox, 0]);
  const y = useTransform(progress, [start, end], [service.oy, 0]);
  const opacity = useTransform(progress, [0, start], [0.65, 1]);
  const scale = useTransform(progress, [start, end], [0.86, 1]);

  return (
    <div
      className="cloud-module-slot"
      style={{ left: pct(service.x, VIEW_W), top: pct(service.y, VIEW_H) }}
    >
      <motion.button
        type="button"
        className={`cloud-module${selected ? " is-selected" : ""}`}
        style={{ x, y, opacity, scale }}
        onClick={onSelect}
        aria-pressed={selected}
      >
        <span className="cloud-module-icon">
          <Glyph id={service.id} />
        </span>
        <span className="cloud-module-body">
          <span className="cloud-module-name">{service.name}</span>
          <span className="cloud-module-role">{service.role}</span>
        </span>
      </motion.button>
    </div>
  );
}

/** A data packet travelling one of the activated connection paths. */
function Packet({
  clock,
  from,
  to,
  offset,
}: {
  clock: MotionValue<number>;
  from: { x: number; y: number };
  to: { x: number; y: number };
  offset: number;
}) {
  const at = useTransform(clock, (value) => (value + offset) % 1);
  const x = useTransform(at, [0, 1], [0, to.x - from.x]);
  const y = useTransform(at, [0, 1], [0, to.y - from.y]);
  const opacity = useTransform(at, [0, 0.12, 0.86, 1], [0, 1, 1, 0]);
  return (
    <motion.circle
      className="cloud-packet"
      r={4.5}
      cx={from.x}
      cy={from.y}
      style={{ x, y, opacity }}
    />
  );
}

export default function CloudArchitectureAssembly() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  // Resolved up front so the first paint already matches the static layout —
  // no visible reflow when the scene switches on small screens.
  const [staticMode, setStaticMode] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches,
  );
  const [selected, setSelected] = useState<ServiceId>("ec2");
  const [stage, setStage] = useState(0);

  // Small screens and reduced-motion users get the completed architecture in a
  // dedicated stacked composition instead of the pinned desktop scene.
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const sync = () => setStaticMode(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const still = staticMode || Boolean(reduce);
  const assembled = useMotionValue(1);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const sprung = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const progress = still ? assembled : sprung;

  const inView = useInView(trackRef, { amount: 0.1 });

  // Scroll-driven stage readout (re-renders only when the stage changes).
  useMotionValueEvent(progress, "change", (value) => {
    let next = 0;
    for (let i = STAGES.length - 1; i >= 0; i -= 1) {
      if (value >= STAGES[i].at) {
        next = i;
        break;
      }
    }
    setStage((current) => (current === next ? current : next));
  });

  // A slow packet clock, only while the scene is on screen and motion is on.
  const clock = useMotionValue(0);
  useAnimationFrame((time) => {
    if (still || !inView) return;
    clock.set((time % 3600) / 3600);
  });

  const glowOpacity = useTransform(progress, CLOUD, [0, 1]);
  const platformProgress = useTransform(progress, PLATFORM, [0, 1]);
  const wireDraw = useTransform(progress, WIRE, [0, 1]);
  const packetOpacity = useTransform(progress, PACKET_GATE, [0, 1]);
  const finalOpacity = useTransform(progress, FINAL, [0, 1]);
  const finalY = useTransform(progress, FINAL, [14, 0]);

  const active = SERVICES.find((service) => service.id === selected) ?? SERVICES[0];

  return (
    <section className="cloud-assembly" id="cloud-architecture">
      <div className="cloud-track" ref={trackRef}>
        <div className="cloud-stage">
          <div className="cloud-head">
            <p className="cloud-eyebrow">THE ARCHITECTURE OF TOMORROW</p>
            <h2 className="cloud-title">Build Above the Cloud.</h2>
            <p className="cloud-desc">
              Explore how compute, storage, databases and networking work together to power modern
              cloud applications.
            </p>
          </div>

          <div className="cloud-scene">
            <div className="cloud-visual">
              <div className="cloud-scene-grid" aria-hidden="true" />

              {/* Connection paths light up after the modules lock in. */}
              <svg
                className="cloud-wires"
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                {SERVICES.map((service) => {
                  const endX = service.x + (CORE.x - service.x) * 0.6;
                  const endY = service.y + (CORE.y - service.y) * 0.6;
                  const dx = endX - service.x;
                  const dy = endY - service.y;
                  const len = Math.hypot(dx, dy) || 1;
                  const bowX = service.x + dx / 2 + (-dy / len) * 24;
                  const bowY = service.y + dy / 2 + (dx / len) * 24;
                  return (
                    <g key={`wire-${service.id}`}>
                      <motion.path
                        className="cloud-wire"
                        d={`M ${service.x} ${service.y} Q ${bowX} ${bowY} ${endX} ${endY}`}
                        style={{ pathLength: wireDraw, opacity: wireDraw }}
                      />
                      <motion.circle
                        className="cloud-node"
                        cx={endX}
                        cy={endY}
                        r={5}
                        style={{ opacity: wireDraw }}
                      />
                    </g>
                  );
                })}
                <motion.g style={{ opacity: packetOpacity }}>
                  {SERVICES.map((service, index) => {
                    const endX = service.x + (CORE.x - service.x) * 0.6;
                    const endY = service.y + (CORE.y - service.y) * 0.6;
                    return (
                      <Packet
                        key={`packet-${service.id}`}
                        clock={clock}
                        from={{ x: service.x, y: service.y }}
                        to={{ x: endX, y: endY }}
                        offset={index * 0.19}
                      />
                    );
                  })}
                </motion.g>
              </svg>

              {/* Architectural platforms beneath the cloud. */}
              <div className="cloud-platforms" aria-hidden="true">
                {PLATFORMS.map((platform) => (
                  <motion.span
                    key={`platform-${platform.y}`}
                    className="cloud-platform"
                    style={{
                      top: pct(platform.y, VIEW_H),
                      width: pct(platform.w, VIEW_W),
                      opacity: platformProgress,
                      scaleX: platformProgress,
                    }}
                  />
                ))}
              </div>

              {/* Cloud core — assembles from separate geometric pieces. */}
              <div className="cloud-core" aria-hidden="true">
                <motion.span className="cloud-glow" style={{ opacity: glowOpacity }} />
                {CLOUD_PARTS.map((part, index) => (
                  <CloudPart key={part.key} progress={progress} piece={part} index={index} />
                ))}
              </div>

              {/* Service modules — clickable, each with its own identity. */}
              <div className="cloud-modules">
                {SERVICES.map((service, index) => (
                  <ServiceModule
                    key={service.id}
                    progress={progress}
                    service={service}
                    index={index}
                    selected={selected === service.id}
                    onSelect={() => setSelected(service.id)}
                  />
                ))}
              </div>

              <motion.p className="cloud-final" style={{ opacity: finalOpacity, y: finalY }}>
                COMPUTE. STORAGE. NETWORK. INNOVATION.
              </motion.p>
            </div>
          </div>

          <div className="cloud-hud">
            <span className="cloud-hud-stage">{STAGES[stage].label}</span>
            <span className="cloud-hud-line" aria-hidden="true" />
            <span className="cloud-hud-title">{STAGES[stage].title}</span>
          </div>
        </div>
      </div>

      <div className="cloud-panel">
        <div className="cloud-panel-copy" aria-live="polite">
          <span className="cloud-panel-eyebrow">SERVICE MODULE</span>
          <h3>{active.name}</h3>
          <p>{active.detail}</p>
        </div>
        <div className="cloud-panel-tabs" role="group" aria-label="Choose a cloud service module">
          {SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              className={selected === service.id ? "is-active" : undefined}
              onClick={() => setSelected(service.id)}
              aria-pressed={selected === service.id}
            >
              {service.name.replace("Amazon ", "").replace("AWS ", "")}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
