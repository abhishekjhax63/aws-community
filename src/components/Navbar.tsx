import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/members", label: "Members" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/updates", label: "Updates" },
  { to: "/learning", label: "AWS Learning" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile menu is open: lock background scrolling, close on Escape,
  // and release everything if the viewport grows back to the desktop layout.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnResize = () => {
      if (desktop.matches) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    desktop.addEventListener("change", closeOnResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      desktop.removeEventListener("change", closeOnResize);
    };
  }, [open]);

  const isAdmin = role === "admin" || role === "editor";

  return (
    <header className={scrolled ? "site-header is-scrolled" : "site-header"}>
      <Link className="brand" to="/" aria-label="AWS Builder Community, home">
        <span className="brand-mark" aria-hidden="true">
          <img src="/assets/sbg-mark.png" alt="" width={42} height={42} />
        </span>
        <span className="brand-copy">
          <strong>BUILDER COMMUNITY</strong>
          <span>AMITY UNIVERSITY PATNA</span>
        </span>
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {item.label}
          </NavLink>
        ))}

        <div className="nav-actions">
          {user ? (
            <>
              <Link className="nav-auth-link" to="/profile">My profile</Link>
              {isAdmin && <Link className="nav-auth-link" to="/admin">Admin</Link>}
              <button className="nav-join" type="button" onClick={() => void signOut()}>
                Sign out <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link className="nav-auth-link" to="/auth/login">Sign in</Link>
              <Link className="nav-join" to="/auth/signup">
                Join the community <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
