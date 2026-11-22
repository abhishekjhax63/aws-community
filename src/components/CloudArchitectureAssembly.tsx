import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppWindow,
  ArrowRight,
  Database,
  Mail,
  Monitor,
  Network,
  Pause,
  Play,
  Server,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

type EcosystemServiceId =
  | "ec2"
  | "vpc"
  | "s3"
  | "workspaces"
  | "amplify"
  | "ses"
  | "iam"
  | "appsync";

type EcosystemService = {
  id: EcosystemServiceId;
  name: string;
  category: string;
  detail: string;
  Icon: LucideIcon;
  x: number;
  y: number;
  rotation: number;
};

const ECOSYSTEM_SERVICES: EcosystemService[] = [
  {
    id: "ec2",
    name: "Amazon EC2",
    category: "Servers / Compute",
    detail: "Resizable virtual compute capacity for workloads that need control over their servers.",
    Icon: Server,
    x: 560,
    y: 76,
    rotation: -2,
  },
  {
    id: "vpc",
    name: "Amazon VPC",
    category: "Networking",
    detail: "An isolated virtual network where you define how cloud resources connect.",
    Icon: Network,
    x: 810,
    y: 166,
    rotation: 2,
  },
  {
    id: "s3",
    name: "Amazon S3",
    category: "Storage",
    detail: "Scalable object storage for data, backups, media and application assets.",
    Icon: Database,
    x: 1015,
    y: 380,
    rotation: 2,
  },
  {
    id: "workspaces",
    name: "Amazon WorkSpaces",
    category: "Remote Computing",
    detail: "Managed virtual desktops that users can access from supported devices.",
    Icon: Monitor,
    x: 810,
    y: 594,
    rotation: 2,
  },
  {
    id: "amplify",
    name: "AWS Amplify",
    category: "Mobile",
    detail: "Tools for building, deploying and hosting web and mobile applications.",
    Icon: Smartphone,
    x: 560,
    y: 684,
    rotation: 2,
  },
  {
    id: "ses",
    name: "Amazon SES",
    category: "Email",
    detail: "A cloud email service for sending and receiving application messages.",
    Icon: Mail,
    x: 310,
    y: 594,
    rotation: -2,
  },
  {
    id: "iam",
    name: "AWS IAM",
    category: "Security",
    detail: "Manage identities and permissions that control access to AWS resources.",
    Icon: ShieldCheck,
    x: 105,
    y: 380,
    rotation: -2,
  },
  {
    id: "appsync",
    name: "AWS AppSync",
    category: "Mobile Development",
    detail: "Build application APIs with managed GraphQL and real-time data features.",
    Icon: AppWindow,
    x: 310,
    y: 166,
    rotation: -2,
  },
];

const ECOSYSTEM_VIEW = { width: 1120, height: 760 };
const ECOSYSTEM_CENTER = { x: 560, y: 380 };

function getConnection(service: EcosystemService) {
  const vx = service.x - ECOSYSTEM_CENTER.x;
  const vy = service.y - ECOSYSTEM_CENTER.y;
  const length = Math.hypot(vx, vy) || 1;
  const ux = vx / length;
  const uy = vy / length;
  const centralRadius = 1 / Math.sqrt((ux * ux) / (205 * 205) + (uy * uy) / (145 * 145));
  const serviceRadius = 1 / Math.sqrt((ux * ux) / (100 * 100) + (uy * uy) / (56 * 56));
  const from = {
    x: ECOSYSTEM_CENTER.x + ux * centralRadius,
    y: ECOSYSTEM_CENTER.y + uy * centralRadius,
  };
  const to = { x: service.x - ux * serviceRadius, y: service.y - uy * serviceRadius };
  const bend = (service.id === "vpc" || service.id === "workspaces" || service.id === "ses" || service.id === "appsync") ? 13 : 0;
  const mid = {
    x: (from.x + to.x) / 2 - uy * bend,
    y: (from.y + to.y) / 2 + ux * bend,
  };

  return {
    from,
    to,
    mid,
    path: `M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`,
  };
}

function EcosystemCore({
  progress,
  gradientPrefix,
  className = "",
}: {
  progress: MotionValue<number>;
  gradientPrefix: string;
  className?: string;
}) {
  const y = useTransform(progress, [0, 0.5], [14, 0]);
  const scale = useTransform(progress, [0, 0.5], [0.9, 1]);
  const rotate = useTransform(progress, [0, 0.52], [-1.2, 0]);
  const shineX = useTransform(progress, [0, 0.52], [-8, 0]);
  const outlineProgress = useTransform(progress, [0, 0.5], [0.16, 1]);

  return (
    <div className={`ecosystem-core-position ${className}`}>
      <motion.div className="ecosystem-core" style={{ y, scale, rotate }}>
        <svg viewBox="0 0 440 280" role="img" aria-labelledby={`${gradientPrefix}-title`}>
          <title id={`${gradientPrefix}-title`}>Cloud infrastructure connected to AWS service examples</title>
          <defs>
            <linearGradient id={`${gradientPrefix}-fill`} x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="62%" stopColor="#e8edf3" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id={`${gradientPrefix}-shine`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.16" />
            </linearGradient>
            <clipPath id={`${gradientPrefix}-clip`}>
              <path d="M111 225C66 225 38 197 38 160c0-34 25-63 61-68 9-42 46-70 91-70 39 0 72 22 86 55 13-10 28-15 45-15 41 0 74 32 75 73 33 7 54 31 54 61 0 31-25 53-61 53H111Z" />
            </clipPath>
            <filter id={`${gradientPrefix}-shadow`} x="-20%" y="-25%" width="140%" height="160%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="7" />
              <feOffset dy="9" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.22" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            className="ecosystem-core-shadow"
            d="M111 225C66 225 38 197 38 160c0-34 25-63 61-68 9-42 46-70 91-70 39 0 72 22 86 55 13-10 28-15 45-15 41 0 74 32 75 73 33 7 54 31 54 61 0 31-25 53-61 53H111Z"
            fill={`url(#${gradientPrefix}-fill)`}
            stroke="#ff9900"
            strokeWidth="4"
            filter={`url(#${gradientPrefix}-shadow)`}
            style={{ pathLength: outlineProgress }}
          />
          <g clipPath={`url(#${gradientPrefix}-clip)`}>
            <motion.path
              d="M104 217c-32-6-49-27-49-56 0-24 17-45 42-52 10-40 43-64 82-64 31 0 57 14 72 37-39-12-80-4-108 18-28 21-39 62-23 98 7 16 17 28 33 38-17-2-34-8-49-19Z"
              fill={`url(#${gradientPrefix}-shine)`}
              style={{ x: shineX }}
            />
            <path d="M92 208c67 25 190 30 292 0" fill="none" stroke="#ffffff" strokeOpacity="0.72" strokeWidth="3" />
            <path d="M121 228c73 13 173 12 248-2" fill="none" stroke="#ff9900" strokeOpacity="0.8" strokeWidth="4" />
          </g>
          <text className="ecosystem-core-wordmark" x="220" y="145" textAnchor="middle">CLOUD</text>
          <path d="M160 160h120" stroke="#ff9900" strokeWidth="3" />
          <text className="ecosystem-core-caption" x="220" y="184" textAnchor="middle">INFRASTRUCTURE</text>
        </svg>
      </motion.div>
    </div>
  );
}

function ServiceCloudShape({ id }: { id: string }) {
  return (
    <svg className="ecosystem-service-shape" viewBox="0 0 220 135" aria-hidden="true">
      <defs>
        <linearGradient id={`service-${id}-fill`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dce4ed" />
        </linearGradient>
      </defs>
      <path
        d="M47 119C22 119 8 104 8 84c0-19 14-34 34-37 5-25 26-40 51-40 22 0 40 12 47 31 7-6 16-9 25-9 22 0 39 17 40 39 18 4 29 16 29 31 0 13-12 22-29 22H47Z"
        fill={`url(#service-${id}-fill)`}
        stroke="#ff9900"
        strokeWidth="2"
      />
      <path
        d="M45 112c-17-4-27-14-27-29 0-13 9-23 23-27 6-20 23-31 43-31 17 0 31 7 40 20"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function OrbitService({
  service,
  index,
  progress,
  selected,
  onSelect,
}: {
  service: EcosystemService;
  index: number;
  progress: MotionValue<number>;
  selected: boolean;
  onSelect: () => void;
}) {
  const start = 0.06 + index * 0.025;
  const inwardX = (ECOSYSTEM_CENTER.x - service.x) * 0.16;
  const inwardY = (ECOSYSTEM_CENTER.y - service.y) * 0.16;
  const x = useTransform(progress, [start, 0.56], [inwardX, 0]);
  const y = useTransform(progress, [start, 0.56], [inwardY, 0]);
  const rotate = useTransform(progress, [start, 0.56], [service.rotation, 0]);
  const scale = useTransform(progress, [start, 0.56], [0.82, 1]);
  const { Icon } = service;

  return (
    <div
      className="ecosystem-orbit-slot"
      style={{ left: `${(service.x / ECOSYSTEM_VIEW.width) * 100}%`, top: `${(service.y / ECOSYSTEM_VIEW.height) * 100}%` }}
    >
      <motion.button
        type="button"
        className={`ecosystem-service${selected ? " is-selected" : ""}`}
        style={{ x, y, rotate, scale }}
        onClick={onSelect}
        onFocus={onSelect}
        aria-pressed={selected}
      >
        <ServiceCloudShape id={service.id} />
        <span className="ecosystem-service-content">
          <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
          <span className="ecosystem-service-name">{service.name}</span>
          <span className="ecosystem-service-category">{service.category}</span>
        </span>
      </motion.button>
    </div>
  );
}

function FlowPacket({
  clock,
  from,
  mid,
  to,
  offset,
  reverse,
}: {
  clock: MotionValue<number>;
  from: { x: number; y: number };
  mid: { x: number; y: number };
  to: { x: number; y: number };
  offset: number;
  reverse: boolean;
}) {
  const progress = useTransform(clock, (value) => {
    const point = (value + offset) % 1;
    return reverse ? 1 - point : point;
  });
  const x = useTransform(progress, (value) => {
    const inverse = 1 - value;
    return inverse * inverse * from.x + 2 * inverse * value * mid.x + value * value * to.x;
  });
  const y = useTransform(progress, (value) => {
    const inverse = 1 - value;
    return inverse * inverse * from.y + 2 * inverse * value * mid.y + value * value * to.y;
  });

  return <motion.circle className="ecosystem-flow-packet" cx={from.x} cy={from.y} r="3.5" style={{ x, y }} />;
}

function EcosystemConnection({
  service,
  index,
  progress,
  clock,
  selected,
  animatePackets,
}: {
  service: EcosystemService;
  index: number;
  progress: MotionValue<number>;
  clock: MotionValue<number>;
  selected: boolean;
  animatePackets: boolean;
}) {
  const connection = getConnection(service);
  const start = 0.04 + index * 0.018;
  const pathLength = useTransform(progress, [start, 0.58], [0, 1]);
  const nodeScale = useTransform(progress, [0.42, 0.58], [0.7, 1]);

  return (
    <g>
      <motion.path
        className={`ecosystem-connection${selected ? " is-selected" : ""}`}
        d={connection.path}
        style={{ pathLength }}
      />
      <motion.circle
        className={`ecosystem-connection-node${selected ? " is-selected" : ""}`}
        cx={connection.to.x}
        cy={connection.to.y}
        r="4"
        style={{ scale: nodeScale }}
      />
      {animatePackets && (
        <>
          <FlowPacket
            clock={clock}
            from={connection.from}
            mid={connection.mid}
            to={connection.to}
            offset={index * 0.105}
            reverse={index % 2 === 1}
          />
          <FlowPacket
            clock={clock}
            from={connection.from}
            mid={connection.mid}
            to={connection.to}
            offset={(index * 0.105 + 0.5) % 1}
            reverse={index % 2 === 0}
          />
        </>
      )}
    </g>
  );
}

function MobileService({
  service,
  selected,
  onSelect,
}: {
  service: EcosystemService;
  selected: boolean;
  onSelect: () => void;
}) {
  const { Icon } = service;
  return (
    <button
      type="button"
      className={`ecosystem-mobile-service${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      onFocus={onSelect}
      aria-pressed={selected}
    >
      <ServiceCloudShape id={`mobile-${service.id}`} />
      <span className="ecosystem-mobile-service-content">
        <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
        <span className="ecosystem-mobile-service-name">{service.name}</span>
        <span className="ecosystem-mobile-service-category">{service.category}</span>
      </span>
    </button>
  );
}

export default function CloudArchitectureAssembly() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<EcosystemServiceId>("ec2");
  const [paused, setPaused] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const instanceId = useId().replace(/:/g, "");
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 82%", "center center"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 105, damping: 27, mass: 0.55 });
  const complete = useMotionValue(1);
  const assembly = reduce ? complete : progress;
  const inView = useInView(sectionRef, { amount: 0.12 });
  const clock = useMotionValue(0);
  const active = ECOSYSTEM_SERVICES.find((service) => service.id === selected) ?? ECOSYSTEM_SERVICES[0];

  useMotionValueEvent(assembly, "change", (value) => {
    setAssembled(value >= 0.58);
  });

  useAnimationFrame((time) => {
    if (reduce || paused || !inView) return;
    clock.set((time % 5200) / 5200);
  });

  return (
    <section className="cloud-ecosystem" id="cloud-architecture" ref={sectionRef}>
      <div className="ecosystem-shell">
        <header className="ecosystem-heading">
          <div>
            <p className="ecosystem-eyebrow">EXPLORE THE CLOUD</p>
            <h2>Everything. <em>Connected.</em></h2>
            <p className="ecosystem-description">
              Discover how compute, storage, networking and other AWS services work together to
              power modern applications.
            </p>
          </div>
          <Link className="button button-orange ecosystem-learning-link" to="/learning">
            Explore AWS Learning <ArrowRight size={15} />
          </Link>
        </header>

        <div className="ecosystem-diagram" role="group" aria-label="Interactive AWS service ecosystem">
          <svg
            className="ecosystem-connections"
            viewBox={`0 0 ${ECOSYSTEM_VIEW.width} ${ECOSYSTEM_VIEW.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {ECOSYSTEM_SERVICES.map((service, index) => {
              return (
                <EcosystemConnection
                  key={`connection-${service.id}`}
                  service={service}
                  index={index}
                  progress={assembly}
                  clock={clock}
                  selected={selected === service.id}
                  animatePackets={!reduce && !paused && inView && assembled}
                />
              );
            })}
          </svg>

          <EcosystemCore progress={assembly} gradientPrefix={`${instanceId}-desktop`} className="ecosystem-core-desktop" />
          {ECOSYSTEM_SERVICES.map((service, index) => (
            <OrbitService
              key={service.id}
              service={service}
              index={index}
              progress={assembly}
              selected={selected === service.id}
              onSelect={() => setSelected(service.id)}
            />
          ))}
        </div>

        <div className="ecosystem-mobile-network">
          <EcosystemCore progress={assembly} gradientPrefix={`${instanceId}-mobile`} className="ecosystem-core-mobile" />
          <div className="ecosystem-mobile-modules">
            {ECOSYSTEM_SERVICES.map((service) => (
              <MobileService
                key={`mobile-${service.id}`}
                service={service}
                selected={selected === service.id}
                onSelect={() => setSelected(service.id)}
              />
            ))}
          </div>
        </div>

        <div className="ecosystem-info">
          <div className="ecosystem-info-copy" aria-live="polite">
            <span className="ecosystem-info-label">SERVICE EXAMPLE</span>
            <h3>{active.name} <span>/ {active.category}</span></h3>
            <p>{active.detail}</p>
          </div>
          <button
            type="button"
            className="ecosystem-motion-toggle"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? "Resume cloud data flow animation" : "Pause cloud data flow animation"}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
        <p className="ecosystem-disclaimer">
          Illustrative AWS service examples only. This is not a deployed architecture or live service status.
        </p>
      </div>
    </section>
  );
}
