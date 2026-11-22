import { Facebook, Github, Globe2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fallbackIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  github: Github,
};

export default function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const name = platform.toLowerCase();
  const classNames = ["social-platform-mark", className].filter(Boolean).join(" ");

  if (name.includes("instagram")) {
    return (
      <svg className={classNames} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.1" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4.05" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.65" cy="6.55" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name.includes("youtube")) {
    return (
      <svg className={classNames} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M23.5 6.3a3 3 0 0 0-2.1-2.12C19.55 3.65 12 3.65 12 3.65s-7.55 0-9.4.53A3 3 0 0 0 .5 6.3C0 8.16 0 12 0 12s0 3.84.5 5.7a3 3 0 0 0 2.1 2.12c1.85.53 9.4.53 9.4.53s7.55 0 9.4-.53a3 3 0 0 0 2.1-2.12C24 15.84 24 12 24 12s0-3.84-.5-5.7Z"
          fill="currentColor"
        />
        <path d="m9.55 15.45 6.27-3.45-6.27-3.45v6.9Z" fill="#fff" />
      </svg>
    );
  }

  if (name.includes("linkedin")) {
    return (
      <svg className={classNames} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"
        />
      </svg>
    );
  }

  if (name.includes("meetup")) {
    return (
      <svg className={classNames} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4.2 18V7.2l3.2 4.35 3.2-4.35V18m2.4 0V7.2l3.2 4.35 3.2-4.35V18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const Icon = fallbackIcons[name] ?? Globe2;
  return <Icon className={classNames} aria-hidden="true" strokeWidth={1.8} />;
}
