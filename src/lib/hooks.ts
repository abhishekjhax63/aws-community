import { useEffect, useRef, useState } from "react";

const SITE_NAME = "AWS Builder Community · Amity University Patna";

/** Sets the document title for a page and restores on unmount. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} | AWS Builder Community`;
    return () => {
      document.title = previous || SITE_NAME;
    };
  }, [title]);
}

/** Resets window scroll when a route mounts. */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);
}

/**
 * Adds a reveal-on-scroll class to an element. Returns a ref to attach.
 * Honours prefers-reduced-motion by revealing immediately.
 * Uses a single shared observer per threshold for performance.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.14) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/**
 * Adds a magnetic cursor pull to every `.button` on the page.
 * Desktop pointers only — disabled for touch devices and reduced motion.
 * Uses one delegated pointer listener so it also covers dynamically added
 * buttons (modals, admin editors) without touching each component.
 */
export function useMagneticButtons() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let current: HTMLElement | null = null;
    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      pending = null;
      el.style.setProperty("--mx", `${x.toFixed(2)}px`);
      el.style.setProperty("--my", `${y.toFixed(2)}px`);
    };

    const release = (el: HTMLElement) => {
      el.classList.remove("is-magnetic");
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const button = (event.target as Element | null)?.closest?.(".button") as HTMLElement | null;
      if (!button || button.hasAttribute("disabled")) {
        if (current) { release(current); current = null; }
        return;
      }
      if (current && current !== button) release(current);
      current = button;
      button.classList.add("is-magnetic");
      const rect = button.getBoundingClientRect();
      pending = {
        el: button,
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 12,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 10,
      };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onOut = (event: PointerEvent) => {
      const button = (event.target as Element | null)?.closest?.(".button") as HTMLElement | null;
      if (!button || button !== current) return;
      const related = event.relatedTarget as Node | null;
      if (related && button.contains(related)) return;
      release(button);
      current = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      if (frame) cancelAnimationFrame(frame);
      if (current) release(current);
      current = null;
    };
  }, []);
}

/** Countdown ticker: returns the number of milliseconds until a target date. */
export function useCountdown(target: string | null | undefined) {
  const [remaining, setRemaining] = useState(() =>
    target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0,
  );

  useEffect(() => {
    if (!target) {
      setRemaining(0);
      return;
    }
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: remaining <= 0,
  };
}
