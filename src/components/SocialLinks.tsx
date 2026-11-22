import { ArrowUpRight, CalendarDays, Facebook, Github, Globe2, Instagram, Linkedin, Youtube, type LucideIcon } from "lucide-react";
import type { SiteSettings } from "../lib/types";
import { getCommunitySocialLinks } from "../lib/socialLinks";

const icons: Record<string, LucideIcon> = {
  facebook: Facebook,
  github: Github,
  instagram: Instagram,
  linkedin: Linkedin,
  meetup: CalendarDays,
  youtube: Youtube,
};

export default function SocialLinks({
  settings,
  variant = "contact",
}: {
  settings: SiteSettings;
  variant?: "contact" | "footer";
}) {
  const links = getCommunitySocialLinks(settings.social_links);
  return (
    <div className={variant === "footer" ? "footer-socials" : "contact-links"}>
      {links.map((link) => {
        const Icon = icons[link.platform.toLowerCase()] ?? Globe2;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.kind === "post" ? "Community post on" : "Community on"} ${link.platform}: ${link.handle}`}
            title={`${link.platform}: ${link.handle}`}
          >
            <Icon size={variant === "footer" ? 16 : 17} />
            {variant !== "footer" && <ArrowUpRight size={11} aria-hidden="true" />}
          </a>
        );
      })}
    </div>
  );
}
