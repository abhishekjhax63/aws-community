import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../lib/auth";
import { authSetupHint } from "../lib/supabase";
import Reveal from "./Reveal";

/** Shared layout for all /auth/* screens, including the not-configured notice. */
export default function AuthShell({
  eyebrow,
  title,
  highlight,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { configured } = useAuth();

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <Reveal className="auth-panel-intro">
          <span className="eyebrow light-eyebrow">{eyebrow}</span>
          <h1>
            {title}
            {highlight ? (
              <>
                <br />
                <em>{highlight}</em>
              </>
            ) : null}
          </h1>
          <p>{subtitle}</p>
          <ul className="auth-benefits">
            <li>Register for events and track your registrations</li>
            <li>Keep your student profile in one place</li>
            <li>Share ideas through the suggestion box</li>
          </ul>
        </Reveal>

        <Reveal className="auth-card" delay={120}>
          {!configured && (
            <div className="auth-notice" role="alert">
              <ShieldAlert size={16} />
              <span>{authSetupHint}</span>
            </div>
          )}
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </Reveal>
      </div>

      <div className="auth-back">
        <Link className="text-link" to="/">
          ← Back to the community site
        </Link>
      </div>
    </section>
  );
}
