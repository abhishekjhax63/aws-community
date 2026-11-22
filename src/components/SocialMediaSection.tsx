import {
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../lib/site";
import { getCommunitySocialLinks } from "../lib/socialLinks";
import SocialPlatformIcon from "./SocialPlatformIcon";

export function SocialMediaCards({ compact = false }: { compact?: boolean }) {
  const settings = useSiteSettings();
  const links = getCommunitySocialLinks(settings.social_links);
  if (links.length === 0) return null;

  return (
    <div className={compact ? "social-card-grid is-compact" : "social-card-grid"}>
      {links.map((link) => {
        const platformClass = link.platform.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return (
          <a
            className={`social-card social-card--${platformClass}`}
            href={link.url}
            key={link.id}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.kind === "post" ? "View community post on" : "Visit"} ${link.platform}: ${link.handle}`}
          >
            <span className="social-card-icon">
              <SocialPlatformIcon platform={link.platform} />
            </span>
            <span className="social-card-copy">
              <span className="social-card-platform">{link.platform}</span>
              <strong>{link.handle}</strong>
              <span className="social-card-action">
                {link.kind === "post" ? "View community post" : "Visit profile"}
                <ArrowUpRight size={13} />
              </span>
            </span>
            <ArrowUpRight className="social-card-external" size={16} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

export default function SocialMediaSection({ preview = false }: { preview?: boolean }) {
  return (
    <section className="social-hub section-pad" aria-labelledby={preview ? "home-social-title" : "social-title"}>
      <div className="social-hub-head">
        <div>
          <p className="eyebrow light-eyebrow">THE COMMUNITY, ONLINE</p>
          <h2 id={preview ? "home-social-title" : "social-title"}>
            Stay Connected. <em>Build Together.</em>
          </h2>
          <p>
            Follow our community for event announcements, learning resources, project showcases and
            opportunities to connect with fellow builders.
          </p>
        </div>
        {preview && (
          <Link className="text-link text-link-light" to="/socials">
            All community links <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
      <SocialMediaCards compact={preview} />
    </section>
  );
}
