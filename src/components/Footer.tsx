import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronUp } from "lucide-react";
import { learningPaths } from "../data/content";
import { useSiteSettings } from "../lib/site";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";

const exploreLinks = [
  { to: "/about", label: "About" },
  { to: "/members", label: "Members" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/updates", label: "Updates" },
  { to: "/suggestions", label: "Suggestion box" },
];

export default function Footer() {
  const settings = useSiteSettings();

  return (
    <footer className="site-footer">
      <Reveal className="footer-top" amount={0.08}>
        <div className="footer-intro">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <img src="/assets/sbg-mark.png" alt="" width={42} height={42} />
            </span>
            <span className="brand-copy">
              <strong>BUILDER COMMUNITY</strong>
              <span>AMITY UNIVERSITY PATNA</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Building Skills. Connecting Minds.
            <br />
            Creating What&apos;s Next.
          </p>
          <p className="footer-about">
            An independent, student-led community for cloud, serverless, and AI learning at Amity
            University Patna.
          </p>
        </div>

        <nav className="footer-column" aria-label="Footer navigation">
          <span>EXPLORE</span>
          {exploreLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="footer-column" aria-label="AWS learning links">
          <span>AWS LEARNING</span>
          {learningPaths.slice(0, 5).map((path) => (
            <a key={path.number} href={path.href} target="_blank" rel="noreferrer">
              {path.title}
            </a>
          ))}
          <Link to="/learning">
            All learning paths <ArrowUpRight size={12} />
          </Link>
        </nav>

        <div className="footer-column">
          <span>CONNECT</span>
          {settings.contact_email ? (
            <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
          ) : null}
          <span className="footer-place">
            Amity University Patna
            <br />
            Patna, Bihar, India
          </span>
          <SocialLinks settings={settings} variant="footer" />
          <div className="footer-column-auth">
            <Link to="/auth/login">Sign in</Link>
            <Link to="/auth/signup">Create account</Link>
          </div>
        </div>
      </Reveal>

      <Reveal className="footer-bottom" delay={120} amount={0.08}>
        <span>© {new Date().getFullYear()} AWS Builder Community · Amity University Patna</span>
        <span>AN INDEPENDENT STUDENT COMMUNITY. NOT AN OFFICIAL AWS AFFILIATE.</span>
        <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          BACK TO TOP <ChevronUp size={13} />
        </a>
      </Reveal>
    </footer>
  );
}
