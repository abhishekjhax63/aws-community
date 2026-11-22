import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import { SiteSettingsProvider } from "../lib/site";
import { useMagneticButtons } from "../lib/hooks";

const DEFAULT_DESCRIPTION =
  "Learn cloud. Build beyond. Innovate together with the AWS-focused student builder community at Amity University Patna.";

/** Page-specific meta descriptions keyed by route prefix — the longest match wins. */
const ROUTE_DESCRIPTIONS: Record<string, string> = {
  "/about": "Who we are — the student-led AWS Student Builder Group at Amity University Patna and the values behind it.",
  "/members": "Meet the student builders, leads and mentors of the AWS Student Builder Group at Amity University Patna.",
  "/events": "Workshops, build sessions and hackathons hosted by the AWS Student Builder Group at Amity University Patna.",
  "/gallery": "Photographs from community events, workshops and build sessions at Amity University Patna.",
  "/updates": "Announcements and updates from the AWS Student Builder Group at Amity University Patna.",
  "/socials": "Verified social links for the AWS Student Builder Group at Amity University Patna.",
  "/learning": "Curated AWS learning paths and cloud resources for students at Amity University Patna.",
  "/suggestions": "Share ideas and suggestions with the AWS Student Builder Group at Amity University Patna.",
};

function resolveDescription(path: string) {
  let best = DEFAULT_DESCRIPTION;
  let bestLength = -1;
  for (const prefix of Object.keys(ROUTE_DESCRIPTIONS)) {
    if ((path === prefix || path.startsWith(`${prefix}/`)) && prefix.length > bestLength) {
      best = ROUTE_DESCRIPTIONS[prefix];
      bestLength = prefix.length;
    }
  }
  return best;
}

/** Shared chrome: navbar, routed page content, footer. Resets scroll on route change. */
export default function Layout() {
  const { pathname } = useLocation();

  // Magnetic cursor pull on CTA buttons (desktop pointers only).
  useMagneticButtons();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  // Keep a single canonical URL and a page-specific meta description in the
  // document head. Private areas (auth, profile, admin) are excluded so they
  // are never advertised through the canonical tag.
  useEffect(() => {
    const isPrivate = ["/auth", "/profile", "/admin"].some((prefix) => pathname.startsWith(prefix));
    const existing = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (isPrivate) {
      existing?.remove();
      if (description) description.content = DEFAULT_DESCRIPTION;
      return;
    }
    const link = existing ?? document.createElement("link");
    if (!existing) {
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}${pathname}`;
    if (description) description.content = resolveDescription(pathname);
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
