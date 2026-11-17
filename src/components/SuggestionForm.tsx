import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Send } from "lucide-react";
import { suggestionCategories } from "../data/content";
import { submitSuggestion } from "../lib/api";
import { useAuth } from "../lib/auth";

type Status = "idle" | "sending" | "success" | "error";

export default function SuggestionForm({ compact = false }: { compact?: boolean }) {
  const { session } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setMessage("");

    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await submitSuggestion(
        {
          name: anonymous ? "" : String(values.name ?? ""),
          email: anonymous ? "" : String(values.email ?? ""),
          category: String(values.category ?? ""),
          title: String(values.title ?? ""),
          details: String(values.details ?? ""),
          is_anonymous: anonymous,
        },
        session?.access_token ?? null,
      );
      setReference(result.reference_id);
      setStatus("success");
      form.reset();
      setAnonymous(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "We couldn't save your idea right now.");
    }
  }

  if (status === "success") {
    return (
      <div className={compact ? "suggestion-success compact" : "suggestion-success"}>
        <span className="success-mark">
          <Check size={22} />
        </span>
        <span className="empty-overline">IDEA RECEIVED</span>
        <h3>Thank you for sharing.</h3>
        <p>
          Your idea is with the community team. Keep this reference ID to follow up with us.
        </p>
        <div className="registration-code">
          <span>YOUR REFERENCE ID</span>
          <strong>{reference}</strong>
        </div>
        <button className="text-link" type="button" onClick={() => { setStatus("idle"); setReference(""); }}>
          Share another idea
        </button>
      </div>
    );
  }

  return (
    <form className={compact ? "suggestion-form compact" : "suggestion-form"} onSubmit={handleSubmit}>
      <div className="form-heading">
        <Send size={16} />
        <span>SHARE AN IDEA</span>
      </div>

      <div className="suggestion-fields">
        <div className="suggestion-field">
          <label htmlFor="sug-name">NAME</label>
          <input
            id="sug-name"
            name="name"
            maxLength={120}
            required={!anonymous}
            disabled={anonymous}
            autoComplete="name"
            placeholder={anonymous ? "Anonymous" : "Your name"}
          />
        </div>
        <div className="suggestion-field">
          <label htmlFor="sug-email">EMAIL</label>
          <input
            id="sug-email"
            name="email"
            type="email"
            maxLength={254}
            required={!anonymous}
            disabled={anonymous}
            autoComplete="email"
            placeholder={anonymous ? "Hidden" : "you@amity.edu"}
          />
        </div>
        <div className="suggestion-field">
          <label htmlFor="sug-category">CATEGORY</label>
          <select id="sug-category" name="category" required defaultValue="">
            <option value="" disabled>
              Choose a category
            </option>
            {suggestionCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="suggestion-field">
          <label htmlFor="sug-title">SUGGESTION TITLE</label>
          <input id="sug-title" name="title" required maxLength={160} placeholder="A short, clear headline" />
        </div>
      </div>

      <div className="suggestion-field">
        <label htmlFor="sug-details">DETAILED SUGGESTION</label>
        <textarea
          id="sug-details"
          name="details"
          required
          rows={compact ? 3 : 5}
          maxLength={4000}
          placeholder="Describe your idea, how it would help the community, and anything we should know."
        />
      </div>

      <label className="consent-label">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
        />
        Submit this idea anonymously
      </label>

      {status === "error" && message ? (
        <p className="form-message error" role="alert">
          {message}
        </p>
      ) : null}

      <button className="button button-orange suggestion-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "SUBMITTING…" : "SUBMIT YOUR IDEA"}
        <ArrowRight size={15} />
      </button>
      <small className="privacy-note">
        Your suggestion is private and is only visible to the community team.
      </small>
    </form>
  );
}
