import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { useDocumentTitle } from "../../lib/hooks";

export default function Login() {
  useDocumentTitle("Sign in");
  const navigate = useNavigate();
  const location = useLocation();
  const { session, configured } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/profile";

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const email = String(values.email ?? "").trim().toLowerCase();
    const password = String(values.password ?? "");

    if (!email || !password) return setError("Enter your email and password.");
    if (!supabase) return setError("Sign in is not configured for this deployment yet.");

    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email or password is incorrect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in to"
      highlight="your account."
      subtitle="Access your profile, registrations and community activity."
      footer={
        <>
          New here? <Link to="/auth/signup">Create an account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">EMAIL ADDRESS</label>
        <input id="login-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@amity.edu" />

        <label htmlFor="login-password">PASSWORD</label>
        <div className="auth-password">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            maxLength={128}
            autoComplete="current-password"
            placeholder="Your password"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div className="auth-row-between">
          <Link className="text-link" to="/auth/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="form-message error" role="alert">{error}</p>}

        <button className="button button-orange auth-submit" type="submit" disabled={busy || !configured}>
          {busy ? "SIGNING IN…" : "SIGN IN"} <ArrowRight size={15} />
        </button>
      </form>
    </AuthShell>
  );
}
