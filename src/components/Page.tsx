import type { ReactNode } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import TextReveal from "./TextReveal";

export function PageHero({
  index,
  eyebrow,
  title,
  highlight,
  intro,
  actions,
}: {
  index: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  intro: string;
  actions?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-grid" aria-hidden="true" />
      <div className="floating-dots" aria-hidden="true">
        <span style={{ top: "18%", left: "8%", animationDelay: "0s" }} />
        <span style={{ top: "30%", right: "12%", animationDelay: "2s" }} />
        <span style={{ bottom: "22%", left: "20%", animationDelay: "4s" }} />
        <span style={{ top: "60%", right: "18%", animationDelay: "1s" }} />
      </div>
      <div className="page-hero-inner">
        <div className="section-index section-index-light">
          <span>{index}</span>
          <span className="index-rule" /> {eyebrow}
        </div>
        <h1>
          <TextReveal as="span" mode="word" stagger={55}>
            {title}
          </TextReveal>
          {highlight ? (
            <>
              <br />
              <em>
                <TextReveal as="span" mode="word" stagger={55} delay={200}>
                  {highlight}
                </TextReveal>
              </em>
            </>
          ) : null}
        </h1>
        <p className="page-hero-intro">{intro}</p>
        {actions ? <div className="page-hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="page-state" role="status" aria-live="polite">
      <Loader2 className="spin" size={26} />
      <p>{label}…</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  title,
}: {
  message: string;
  onRetry?: () => void;
  /** Page-level errors render this as the page's sole <h1>. Omit for inline states. */
  title?: string;
}) {
  return (
    <div className="page-state page-state-error" role="alert">
      <TriangleAlert size={26} />
      {title ? <h1 className="page-state-title">{title}</h1> : null}
      <p>{message}</p>
      {onRetry ? (
        <button className="button button-orange" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-state page-state-empty">
      <span className="empty-overline">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
