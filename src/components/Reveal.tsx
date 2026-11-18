import type { ReactNode } from "react";
import { useReveal } from "../lib/hooks";

type RevealVariant = "up" | "fade" | "scale" | "blur";

/**
 * Wraps content and animates it in when it scrolls into view.
 * Supports multiple reveal variants and staggered delays.
 * Honours prefers-reduced-motion by revealing immediately.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  variant = "up",
  amount = 0.14,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "aside" | "li" | "span";
  delay?: number;
  variant?: RevealVariant;
  amount?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(amount);
  return (
    <Tag
      ref={ref as never}
      className={[
        className,
        "reveal",
        `reveal-${variant}`,
        visible ? "is-visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
