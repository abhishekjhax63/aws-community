import { useEffect, useRef, useState } from "react";

/** Animated counter that ticks up when scrolled into view. */
export default function StatNumber({ value }: { value: number | null | undefined }) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof value !== "number") return;
    const node = nodeRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      const duration = 950;
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  if (typeof value !== "number") return <strong>—</strong>;
  return <strong ref={nodeRef}>{display.toLocaleString("en-IN")}</strong>;
}
