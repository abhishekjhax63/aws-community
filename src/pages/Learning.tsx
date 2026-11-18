import { useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Check, GraduationCap } from "lucide-react";
import { PageHero } from "../components/Page";
import Reveal from "../components/Reveal";
import { learningLevels, learningPaths } from "../data/content";
import { useDocumentTitle } from "../lib/hooks";

export default function Learning() {
  useDocumentTitle("AWS Learning Hub");
  const [level, setLevel] = useState<string>("All");
  const paths = level === "All" ? learningPaths : learningPaths.filter((path) => path.level === level);

  return (
    <>
      <PageHero
        index="LEARNING"
        eyebrow="THE LEARNING LAB"
        title="Learn it."
        highlight="Then make it."
        intro="A guided path from cloud fundamentals to architecture and AI. Every card links to official AWS documentation and Skill Builder — go at your own pace."
      />

      <section className="section-pad content-section bg-grid">
        <div className="section-index">
          <span>01</span>
          <span className="index-rule" /> YOUR ROADMAP
        </div>
        <div className="learning-roadmap learning-roadmap-standalone">
          <span>BEGINNER TO ADVANCED</span>
          <div>
            <b>FOUNDATIONS</b>
            <span />
            <b>BUILDING</b>
            <span />
            <b>ARCHITECTURE</b>
          </div>
        </div>

        <div className="gallery-filters learning-filters" role="group" aria-label="Filter learning paths by level">
          {["All", ...learningLevels].map((item) => (
            <button
              type="button"
              key={item}
              className={level === item ? "is-active" : ""}
              onClick={() => setLevel(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="learning-cards learning-cards-full">
          {paths.map((path, index) => (
            <Reveal className="learning-card" key={path.number} delay={(index % 3) * 60}>
              <div className="learning-card-top">
                <span>
                  {path.number} / {String(learningPaths.length).padStart(2, "0")}
                </span>
                <ArrowUpRight size={16} />
              </div>
              <div>
                <span className="learning-services">{path.services}</span>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <span className="learning-objective">
                  <GraduationCap size={13} /> {path.objective}
                </span>
              </div>
              <div className="learning-card-links">
                <a href={path.href} target="_blank" rel="noreferrer">
                  Docs <ArrowUpRight size={13} />
                </a>
                <a href="https://skillbuilder.aws/" target="_blank" rel="noreferrer">
                  Skill Builder <ArrowRight size={13} />
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="learning-banner">
          <BookOpen size={22} />
          <div>
            <h3>Want a guided session instead?</h3>
            <p>
              Join a community workshop and learn alongside other builders. We host AWS learning
              sessions through the semester.
            </p>
          </div>
          <a className="button button-orange" href="https://skillbuilder.aws/" target="_blank" rel="noreferrer">
            Open Skill Builder <ArrowRight size={15} />
          </a>
        </div>

        <p className="learning-disclaimer">
          <Check size={14} /> Learning links lead to official AWS documentation and Skill Builder.
          Community participation does not grant AWS certification.
        </p>
      </section>
    </>
  );
}
