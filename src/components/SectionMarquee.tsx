import { Fragment } from "react";

const DEFAULT_PHRASES = [
  "AWS BUILDER COMMUNITY",
  "LEARN CLOUD",
  "BUILD BEYOND",
  "INNOVATE TOGETHER",
];

/**
 * A single-line ticker band that keeps its text moving between sections.
 * The phrase list is rendered twice so the marquee loops seamlessly
 * (the track slides by exactly one copy). Motion is purely transform
 * based and is disabled for users who prefer reduced motion via CSS.
 */
export default function SectionMarquee({
  phrases = DEFAULT_PHRASES,
  tone = "dark",
  speed = 32,
}: {
  phrases?: string[];
  tone?: "light" | "dark";
  speed?: number;
}) {
  return (
    <div className={`section-marquee ${tone}`} aria-hidden="true">
      <div className="section-marquee-track" style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((copy) => (
          <span className="section-marquee-group" key={copy}>
            {phrases.map((phrase, i) => (
              <Fragment key={i}>
                <span className="section-marquee-text">{phrase}</span>
                <span className="section-marquee-dot">✦</span>
              </Fragment>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
