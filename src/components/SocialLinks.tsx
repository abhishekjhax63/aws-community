import { Github, Instagram, Linkedin } from "lucide-react";
import type { SiteSettings } from "../lib/types";

export const socialKeys = [
  { key: "linkedin_url", label: "LinkedIn", icon: Linkedin },
  { key: "instagram_url", label: "Instagram", icon: Instagram },
  { key: "github_url", label: "GitHub", icon: Github },
] as const;

export default function SocialLinks({
  settings,
  variant = "contact",
}: {
  settings: SiteSettings;
  variant?: "contact" | "footer";
}) {
  return (
    <div className={variant === "footer" ? "footer-socials" : "contact-links"}>
      {socialKeys.map(({ key, label, icon: Icon }) =>
        settings[key] ? (
          <a key={key} href={settings[key]} target="_blank" rel="noreferrer" aria-label={`Community on ${label}`}>
            <Icon size={variant === "footer" ? 16 : 17} />
          </a>
        ) : (
          <span key={key} title={`${label} link coming soon`} aria-hidden="true">
            <Icon size={variant === "footer" ? 16 : 17} />
          </span>
        ),
      )}
    </div>
  );
}
