import { Lightbulb, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import SuggestionForm from "../components/SuggestionForm";
import { useDocumentTitle } from "../lib/hooks";

const points = [
  { icon: Lightbulb, title: "Any idea counts", body: "Workshops, hackathons, projects, resources or improvements — nothing is too small." },
  { icon: Workflow, title: "Reviewed by the team", body: "Every idea is read by the core team and tracked from new to accepted." },
  { icon: ShieldCheck, title: "Private by default", body: "Your suggestion is never shown publicly. Submit anonymously if you prefer." },
  { icon: Sparkles, title: "You get a reference ID", body: "Keep your reference ID to follow up with the community team." },
];

export default function Suggestions() {
  useDocumentTitle("Student suggestion box");

  return (
    <>
      <PageHero
        index="SUGGESTIONS"
        eyebrow="STUDENT SUGGESTION BOX"
        title="Your ideas can build"
        highlight="what's next."
        intro="Have an idea for a workshop, event, project or community improvement? Share it with us — the community team reads every submission."
      />

      <section className="section-pad content-section">
        <div className="suggestion-page-grid">
          <div className="suggestion-page-side">
            {points.map(({ icon: Icon, title, body }, index) => (
              <Reveal className="suggestion-point-card" key={title} delay={index * 60}>
                <span className="focus-icon">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="suggestion-panel large" delay={80}>
            <SuggestionForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
