import { Fragment, useState } from "react";
import { Pause, Play } from "lucide-react";

const DEFAULT_PHRASES = [
  "LEARN CLOUD",
  "BUILD TOGETHER",
  "INNOVATE",
  "CONNECT",
  "CREATE",
];

/**
 * Compact editorial ticker. Its repeated phrase group makes the transform
 * loop seamless; the visible pause control and reduced-motion rule keep it
 * comfortable to read.
 */
export default function SectionMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="section-marquee" role="group" aria-label="Community focus">
      <div
        className={`section-marquee-track${paused ? " is-paused" : ""}`}
        aria-hidden="true"
      >
        {[0, 1].map((copy) => (
          <span className="section-marquee-group" key={copy}>
            {DEFAULT_PHRASES.map((phrase, i) => (
              <Fragment key={i}>
                <span className="section-marquee-text">{phrase}</span>
                <span className="section-marquee-dot" />
              </Fragment>
            ))}
          </span>
        ))}
      </div>
      <button
        className="section-marquee-toggle"
        type="button"
        aria-label={paused ? "Resume ticker animation" : "Pause ticker animation"}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </div>
  );
}
