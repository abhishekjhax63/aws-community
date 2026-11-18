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
