import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ClipboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, MailCheck } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { supabase } from "../../lib/supabase";
import { useDocumentTitle } from "../../lib/hooks";

const OTP_LENGTH = 6;

export default function Verify() {
  useDocumentTitle("Verify your email");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });
    if (clean && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    inputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const token = digits.join("");
    if (token.length !== OTP_LENGTH) return setError("Enter the complete 6-digit code.");
    if (!email) return setError("We don't know which email to verify. Please sign up again.");
    if (!supabase) return setError("Account verification is not configured for this deployment.");

    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
      if (verifyError) throw verifyError;
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is invalid or has expired. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError("");
    setNotice("");
    if (!email || !supabase) {
      setError("We can't resend the code without a valid email address.");
      return;
    }
    try {
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
      if (resendError) throw resendError;
      setNotice("A new verification code is on its way.");
      setCooldown(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't resend the code. Please try again shortly.");
    }
  }

  return (
    <AuthShell
      eyebrow="EMAIL VERIFICATION"
      title="Verify your"
      highlight="student email."
      subtitle={email ? `Enter the 6-digit code we sent to ${email}.` : "Enter the 6-digit code we emailed you."}
      footer={
        <>
          Wrong email? <Link to="/auth/signup">Create the account again</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={verify}>
        <div className="otp-row" role="group" aria-label="Verification code">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => setDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <div className="otp-status">
          <span className="otp-email">
            <MailCheck size={14} /> {email || "your email"}
          </span>
          <button className="text-link" type="button" onClick={resend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>

        {error && <p className="form-message error" role="alert">{error}</p>}
        {notice && <p className="form-message success" role="status">{notice}</p>}

        <button className="button button-orange auth-submit" type="submit" disabled={busy}>
          {busy ? "VERIFYING…" : "VERIFY & ACTIVATE"} <ArrowRight size={15} />
        </button>
        <p className="auth-hint">
          Your account is activated only after Supabase confirms this code on the server.
        </p>
      </form>
    </AuthShell>
  );
}
