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
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
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
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
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
