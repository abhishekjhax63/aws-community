import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import { SiteSettingsProvider } from "../lib/site";
import { useMagneticButtons } from "../lib/hooks";

/** Shared chrome: navbar, routed page content, footer. Resets scroll on route change. */
export default function Layout() {
  const { pathname } = useLocation();

  // Magnetic cursor pull on CTA buttons (desktop pointers only).
  useMagneticButtons();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  // Keep a single canonical URL in the document head. Private areas
  // (auth, profile, admin) are excluded so they are never advertised.
  useEffect(() => {
    const isPrivate = ["/auth", "/profile", "/admin"].some((prefix) => pathname.startsWith(prefix));
    const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (isPrivate) {
      existing?.remove();
      return;
    }
    const link = existing ?? document.createElement("link");
    if (!existing) {
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}${pathname}`;
  }, [pathname]);

  return (
    <SiteSettingsProvider>
      <ScrollProgress />
      <div className="site-shell" id="top">
        <Navbar />
        <main className="site-main">
          <div key={pathname} className="route-fade">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </SiteSettingsProvider>
  );
}
