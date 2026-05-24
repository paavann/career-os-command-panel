import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  GraduationCap,
  Users,
  CalendarDays,
  Trophy,
  User,
  Crown,
  Flame,
  Coins,
  Zap,
} from "lucide-react";

const nav = [
  { to: "/", label: "Command", icon: LayoutDashboard, exact: true },
  { to: "/journey", label: "Journey", icon: Compass },
  { to: "/tools", label: "C.A.R.E.E.R.", icon: Sparkles },
  { to: "/ai", label: "AI Hub", icon: Zap },
  { to: "/courses", label: "Learn", icon: GraduationCap },
  { to: "/community", label: "Community", icon: Users },
  { to: "/events", label: "Live", icon: CalendarDays },
  { to: "/missions", label: "Missions", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/pricing", label: "Tiers", icon: Crown },
];

export function AppShell() {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-navy-soft/40 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-6 py-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-brand grid place-items-center font-display font-black text-sm">C</div>
            <div className="leading-tight">
              <div className="font-display font-extrabold tracking-tight">Bluechip CareerOS<span className="text-gold">™</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">v1.0 · live</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-accent text-foreground ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-electric shadow-[0_0_8px_var(--electric)]" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-xl border border-border bg-gradient-to-br from-purple/15 to-electric/10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Career Power Index</div>
          <div className="font-display font-black text-3xl text-gradient-brand">842</div>
          <div className="text-xs text-muted-foreground mt-1">Top 4% globally</div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        <div className="lg:hidden flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-brand grid place-items-center font-display font-black text-xs">C</div>
          <span className="font-display font-extrabold tracking-tight">Bluechip CareerOS™</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Pill icon={<span className="size-2 rounded-full bg-gold shadow-glow-gold" />} label="LVL 12" />
          <Pill icon={<Zap className="size-3 text-gold" />} label="4,280 XP" />
          <Pill icon={<Coins className="size-3 text-electric" />} label="150" />
          <Pill icon={<Flame className="size-3 text-orange-400" />} label="7 day" />
          <div className="size-9 rounded-full bg-gradient-to-tr from-purple to-electric ring-2 ring-border ml-1" />
        </div>
      </div>
    </header>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-border text-[11px] font-mono font-medium">
      {icon}
      <span>{label}</span>
    </div>
  );
}
