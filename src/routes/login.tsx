import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — Bluechip CareerOS™" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back, operator.");
    navigate({ to: (redirect as any) ?? "/" });
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setLoading(false);
    if (res.error) return toast.error(res.error.message ?? "Google sign-in failed");
    if (res.redirected) return;
    navigate({ to: (redirect as any) ?? "/" });
  };

  return (
    <AuthShell title="Re-enter the operating system" subtitle="Pick up your trajectory where you left off.">
      <button
        onClick={onGoogle}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-border bg-card hover:bg-accent/60 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <Divider />
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-brand font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {loading ? "Authenticating…" : "Sign in"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-6">
        New operator?{" "}
        <Link to="/signup" className="text-electric font-semibold">Create account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden border-r border-border bg-navy-soft/40">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-electric/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-purple/20 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center font-display font-black text-sm">C</div>
            <div className="font-display font-extrabold tracking-tight">Bluechip CareerOS<span className="text-gold">™</span></div>
          </Link>
          <div className="space-y-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric">Operator Access</div>
            <h2 className="font-display font-black text-5xl leading-tight tracking-tight">
              Become <span className="text-gradient-brand">impossible to ignore.</span>
            </h2>
            <p className="text-muted-foreground max-w-md">
              The AI-powered transformation OS used by top 4% career operators. Authority. Reach. Revenue. Compounded daily.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <Stat n="12k+" l="Operators" />
            <Stat n="93%" l="Land top role" />
            <Stat n="+38%" l="Avg comp lift" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-electric mb-3">// Authentication</div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-foreground font-display font-bold text-lg">{n}</div>
      <div>{l}</div>
    </div>
  );
}

export function Field({
  label, type = "text", value, onChange, required,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-electric focus:ring-1 focus:ring-electric outline-none text-sm font-medium transition-colors"
      />
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">or</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
