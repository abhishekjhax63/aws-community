import { PageHero } from "../components/Page";
import { SocialMediaCards } from "../components/SocialMediaSection";
import { useDocumentTitle } from "../lib/hooks";

export default function Socials() {
  useDocumentTitle("Community social links");

  return (
    <>
      <PageHero
        index="CONNECT"
        eyebrow="THE COMMUNITY, ONLINE"
        title="Stay connected."
        highlight="Build together."
        intro="Follow our community for event announcements, learning resources, project showcases and opportunities to connect with fellow builders."
      />
      <section className="social-page section-pad" aria-label="Verified community social links">
        <SocialMediaCards />
      </section>
    </>
  );
}
