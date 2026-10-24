import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Command, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import api from "../api/client";
import "./auth.css";

export interface TaskFlowUser {
  id: string;
  name: string;
  email: string;
}

interface AuthGateProps {
  children: (user: TaskFlowUser, onLogout: () => Promise<void>) => ReactNode;
}

type AuthMode = "login" | "signup";

export default function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<TaskFlowUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<{ user: TaskFlowUser }>("/auth/me")
      .then(response => { if (active) setUser(response.data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const payload = mode === "signup" ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
      const response = await api.post<{ user: TaskFlowUser }>(endpoint, payload);
      setUser(response.data.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not complete your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    try { await api.post("/auth/logout"); }
    finally { setUser(null); setPassword(""); setMode("login"); }
  }

  if (checking) return <div className="auth-loading"><LoaderCircle className="auth-spinner" size={28}/><span>Preparing your workspace…</span></div>;
  if (user) return <>{children(user, onLogout)}</>;

  return <main className="auth-screen">
    <div className="auth-decoration auth-decoration-one"/>
    <div className="auth-decoration auth-decoration-two"/>
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-brand"><span className="auth-brand-mark"><Command size={21} strokeWidth={2.7}/></span><span>taskflow<span className="auth-brand-dot">.</span></span></div>
      <div className="auth-heading">
        <span className="auth-eyebrow">{mode === "signup" ? "YOUR WORK, IN FLOW" : "WELCOME BACK"}</span>
        <h1 id="auth-title">{mode === "signup" ? "Make room for great work." : "Good to see you again."}</h1>
        <p>{mode === "signup" ? "Create your free account and build a workspace that belongs to you." : "Sign in to pick up where you left off."}</p>
      </div>
      <div className="auth-mode-switch" role="tablist" aria-label="Account access">
        <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "selected" : ""} onClick={() => {setMode("signup");setError("");}}>Create account</button>
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => {setMode("login");setError("");}}>Sign in</button>
      </div>
      <form className="auth-form" onSubmit={submit}>
        {mode === "signup" && <label className="auth-field"><span>Your name</span><span className="auth-input-wrap"><UserRound size={17}/><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Alex Morgan" minLength={2} maxLength={80} required/></span></label>}
        <label className="auth-field"><span>Email address</span><span className="auth-input-wrap"><Mail size={17}/><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" maxLength={254} required/></span></label>
        <label className="auth-field"><span>Password</span><span className="auth-input-wrap"><LockKeyhole size={17}/><input type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"} minLength={mode === "signup" ? 8 : 1} maxLength={128} required/><button className="auth-reveal" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="auth-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="auth-spinner" size={17}/> : <>{mode === "signup" ? "Create my account" : "Sign in to TaskFlow"} <ArrowRight size={17}/></>}{busy && <span>Please wait…</span>}</button>
      </form>
      <div className="auth-trust"><CheckCircle2 size={15}/><span>Your tasks are private to your account.</span></div>
      <p className="auth-terms">By continuing, you agree to use TaskFlow responsibly. Keep your password private.</p>
    </section>
    <footer className="auth-footer"><span>© 2026 TaskFlow</span><span><span className="auth-footer-dot"/> A calmer way to get things done</span></footer>
  </main>;
}
