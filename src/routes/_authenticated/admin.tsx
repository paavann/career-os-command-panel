import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Shield, BarChart3, Users, Trophy, Brain, ArrowLeft } from "lucide-react";
import { getMe } from "@/lib/me.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/missions", label: "Missions", icon: Trophy },
  { to: "/admin/ai-usage", label: "AI Usage", icon: Brain },
];

function AdminLayout() {
  const fetchMe = useServerFn(getMe);
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => fetchMe() });
  const { location } = useRouterState();

  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!data?.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <Shield className="size-12 mx-auto text-muted-foreground" />
        <h1 className="font-display font-bold text-2xl mt-4">Restricted</h1>
        <p className="text-sm text-muted-foreground mt-2">Admin access required.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 text-electric text-sm">
          <ArrowLeft className="size-3" /> Back to Command
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-10 rounded-lg bg-gradient-brand grid place-items-center">
          <Shield className="size-5 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-electric">Operator Console</div>
          <h1 className="font-display font-black text-3xl">Admin Panel</h1>
        </div>
      </div>
      <nav className="flex gap-1 border-b border-border mt-6 mb-8">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to);
          return (
            <Link key={t.to} to={t.to as any}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active ? "border-electric text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="size-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}
