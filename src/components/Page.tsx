import type { ReactNode } from "react";
import { Loader2, TriangleAlert } from "lucide-react";

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
      <div className="page-hero-inner">
        <div className="section-index section-index-light">
          <span>{index}</span>
          <span className="index-rule" /> {eyebrow}
        </div>
        <h1>
          {title}
          {highlight ? (
            <>
              <br />
              <em>{highlight}</em>
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

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-state page-state-error" role="alert">
      <TriangleAlert size={26} />
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
