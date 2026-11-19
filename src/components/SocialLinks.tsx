import { CalendarDays, Github, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { SiteSettings } from "../lib/types";

type SocialLink = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
};

export const socialKeys: SocialLink[] = [
  {
    key: "linkedin_url",
    label: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/posts/aws-student-builder-group-at-amity-university_promptpixel-thrillanza-amityuniversitypatna-activity-7510907739657711616-L5HQ?utm_source=share&utm_medium=member_android&rcm=ACoAAGFWtMsBpUrjxTYOUfoDp2ZTYQuGv2hJDs8",
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/sbg.community?jplx=MTdvcmpseWN1dDMyeA==",
  },
  {
    key: "meetup_url",
    label: "Meetup",
    icon: CalendarDays,
    href: "https://www.meetup.com/aws-sbg-at-amity-university-patna-campus/?eventOrigin=home_groups_you_organize",
  },
  {
    key: "youtube_url",
    label: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@awssbg_26?si=1wSdBrEWbPD6Vrow",
  },
  { key: "github_url", label: "GitHub", icon: Github },
];

export default function SocialLinks({
  settings,
  variant = "contact",
}: {
  settings: SiteSettings;
  variant?: "contact" | "footer";
}) {
  return (
    <div className={variant === "footer" ? "footer-socials" : "contact-links"}>
      {socialKeys.map(({ key, label, icon: Icon, href }) => {
        const url = href ?? settings[key];
        return url ? (
          <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={`Community on ${label}`} title={label}>
            <Icon size={variant === "footer" ? 16 : 17} />
          </a>
        ) : (
          <span key={key} title={`${label} link coming soon`} aria-hidden="true">
            <Icon size={variant === "footer" ? 16 : 17} />
          </span>
        );
      })}
    </div>
  );
}
