import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import { useDocumentTitle } from "../lib/hooks";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <section className="notfound section-pad">
      <span className="eyebrow">404 · LOST IN THE CLOUD</span>
      <h1>
        This page hasn&apos;t
        <br />
        <span>been built yet.</span>
      </h1>
      <p>
        The link you followed doesn&apos;t exist here. Let&apos;s get you back to the community.
      </p>
      <div className="notfound-actions">
        <Link className="button button-orange" to="/">
          Back to home <ArrowRight size={15} />
        </Link>
        <Link className="text-link" to="/events">
          <Compass size={15} /> Explore events
        </Link>
      </div>
    </section>
  );
}
