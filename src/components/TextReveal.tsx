import { Fragment, useMemo } from "react";
import { useReveal } from "../lib/hooks";

type SplitMode = "word" | "line" | "char";

/**
 * Animated text reveal — reveals the text in simple, opacity + transform steps
 * when it scrolls into view. Honours prefers-reduced-motion by showing the text
 * straight away.
 *
 * Word tokens are rendered as `inline-block` spans so each word animates on its
 * own, but the spaces BETWEEN them are real text nodes. That matters: a space
 * wrapped inside an inline-block is not a line-break opportunity, so an
 * all-inline-block heading would refuse to wrap and overflow its container.
 */
export default function TextReveal({
  children,
  as: Tag = "h2",
  className,
  mode = "word",
  stagger = 60,
  delay = 0,
}: {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  mode?: SplitMode;
  stagger?: number;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLElement>(0.2);

  const tokens = useMemo(() => {
    if (mode === "line") return children.split("\n");
    if (mode === "char") return Array.from(children);
    return children.split(" ");
  }, [children, mode]);

  return (
    <Tag ref={ref as never} className={className} aria-label={children}>
      {tokens.map((token, i) => {
        const style = {
          transitionDelay: `${delay + i * stagger}ms`,
          display: mode === "line" ? "block" : "inline-block",
        } as const;

        return (
          <Fragment key={i}>
            <span className={`text-reveal-token ${visible ? "is-visible" : ""}`} style={style}>
              {token}
            </span>
            {/* A real space keeps natural wrapping between the animated words. */}
            {mode === "word" && i < tokens.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
