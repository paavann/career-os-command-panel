import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create operator account — Bluechip CareerOS™" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Operator account created. Boot sequence engaged.");
    navigate({ to: "/" });
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setLoading(false);
    if (res.error) return toast.error(res.error.message ?? "Google sign-in failed");
    if (res.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <AuthShell title="Enter the transformation OS" subtitle="Spin up your operator profile in 30 seconds.">
      <button
        onClick={onGoogle}
        disabled={loading}
        className="w-full py-3 rounded-xl border border-border bg-card hover:bg-accent/60 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
      >
        Continue with Google
      </button>
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Operator name" value={displayName} onChange={setDisplayName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-brand font-bold text-sm hover:opacity-90 transition-opacity"
        >
          {loading ? "Provisioning…" : "Create account"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground text-center mt-6">
        Already an operator?{" "}
        <Link to="/login" className="text-electric font-semibold">Sign in</Link>
      </p>
    </AuthShell>
  );
}
