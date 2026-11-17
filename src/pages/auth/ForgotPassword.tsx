import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { useDocumentTitle } from "../../lib/hooks";

type Stage = "request" | "sent" | "recovery" | "done";

export default function ForgotPassword() {
  useDocumentTitle("Reset your password");
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Supabase fires PASSWORD_RECOVERY when the user returns via the emailed link.
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStage("recovery");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const value = String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase();
    if (!value) return setError("Enter the email you registered with.");
    if (!supabase) return setError("Password recovery is not configured for this deployment yet.");

    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/auth/forgot-password`,
      });
      if (resetError) throw resetError;
      setEmail(value);
      setStage("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send the recovery email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const password = String(values.password ?? "");
    const confirm = String(values.confirm_password ?? "");

    if (password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    if (!supabase) return setError("Password recovery is not configured for this deployment yet.");

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setStage("done");
      window.setTimeout(() => navigate("/auth/login", { replace: true }), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't update your password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "recovery" || stage === "done") {
    return (
      <AuthShell
        eyebrow="SET A NEW PASSWORD"
        title="Choose a new"
        highlight="secure password."
        subtitle="You're verified. Set a new password to regain access to your account."
        footer={<Link to="/auth/login">Back to sign in</Link>}
      >
        {stage === "done" ? (
          <p className="form-message success" role="status">
            Password updated. Redirecting you to sign in…
          </p>
        ) : (
          <form className="auth-form" onSubmit={updatePassword} noValidate>
            <label htmlFor="reset-password">NEW PASSWORD</label>
            <input id="reset-password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
            <label htmlFor="reset-confirm">CONFIRM NEW PASSWORD</label>
            <input id="reset-confirm" name="confirm_password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
            {error && <p className="form-message error" role="alert">{error}</p>}
            <button className="button button-orange auth-submit" type="submit" disabled={busy}>
              {busy ? "UPDATING…" : "UPDATE PASSWORD"} <ArrowRight size={15} />
            </button>
          </form>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="PASSWORD RECOVERY"
      title="Reset your"
      highlight="password."
      subtitle="Enter your registered email and we'll send you a secure recovery link."
      footer={<Link to="/auth/login">Back to sign in</Link>}
    >
      {stage === "sent" ? (
        <div className="auth-sent">
          <p className="form-message success" role="status">
            If an account exists for <b>{email}</b>, a recovery link is on its way. Open it on this
            device to set a new password.
          </p>
          <button className="text-link" type="button" onClick={() => setStage("request")}>
            Use a different email
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={requestReset} noValidate>
          <label htmlFor="forgot-email">EMAIL ADDRESS</label>
          <input id="forgot-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@amity.edu" />
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button className="button button-orange auth-submit" type="submit" disabled={busy || !configured}>
            {busy ? "SENDING…" : "SEND RECOVERY LINK"} <ArrowRight size={15} />
          </button>
        </form>
      )}
    </AuthShell>
  );
}
