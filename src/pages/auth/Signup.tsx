import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { useDocumentTitle } from "../../lib/hooks";

export default function Signup() {
  useDocumentTitle("Create your account");
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const fullName = String(values.full_name ?? "").trim();
    const email = String(values.email ?? "").trim().toLowerCase();
    const password = String(values.password ?? "");
    const confirm = String(values.confirm_password ?? "");
    const consent = values.consent === "on";

    if (!fullName || fullName.length > 120) return setError("Please enter your full name.");
    if (password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    if (!consent) return setError("Please accept the terms and privacy notice to continue.");
    if (!supabase) return setError("Student accounts are not configured for this deployment yet.");

    setBusy(true);
    try {
      const { data: result, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      if (signUpError) throw signUpError;

      if (result.session) {
        navigate("/profile", { replace: true });
        return;
      }
      navigate(`/auth/verify?email=${encodeURIComponent(email)}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="CREATE ACCOUNT"
      title="Join the"
      highlight="builder community."
      subtitle="Create your student account to register for events and keep track of everything in one place."
      footer={
        <>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="signup-name">FULL NAME</label>
        <input id="signup-name" name="full_name" required maxLength={120} autoComplete="name" placeholder="Your full name" />

        <label htmlFor="signup-email">EMAIL ADDRESS</label>
        <input id="signup-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@amity.edu" />

        <label htmlFor="signup-password">PASSWORD</label>
        <div className="auth-password">
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <label htmlFor="signup-confirm">CONFIRM PASSWORD</label>
        <input id="signup-confirm" name="confirm_password" type={showPassword ? "text" : "password"} required minLength={8} maxLength={128} autoComplete="new-password" />

        <label className="consent-label">
          <input name="consent" type="checkbox" required /> I agree to the terms of use and privacy notice for this student community.
        </label>

        {error && <p className="form-message error" role="alert">{error}</p>}

        <button className="button button-orange auth-submit" type="submit" disabled={busy || !configured}>
          {busy ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"} <ArrowRight size={15} />
        </button>
        <p className="auth-hint">We&apos;ll email you a 6-digit verification code to activate your account.</p>
      </form>
    </AuthShell>
  );
}
