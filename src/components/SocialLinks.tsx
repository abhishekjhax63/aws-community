import { ArrowUpRight } from "lucide-react";
import type { SiteSettings } from "../lib/types";
import { getCommunitySocialLinks } from "../lib/socialLinks";
import SocialPlatformIcon from "./SocialPlatformIcon";

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
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.kind === "post" ? "Community post on" : "Community on"} ${link.platform}: ${link.handle}`}
            title={`${link.platform}: ${link.handle}`}
          >
            <SocialPlatformIcon platform={link.platform} />
            {variant !== "footer" && <ArrowUpRight size={11} aria-hidden="true" />}
          </a>
        );
      })}
    </div>
  );
}
