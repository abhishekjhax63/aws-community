import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SiteSettingsProvider } from "../lib/site";

/** Shared chrome: navbar, routed page content, footer. Resets scroll on route change. */
export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <SiteSettingsProvider>
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
