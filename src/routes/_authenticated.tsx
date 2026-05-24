import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Only hydrate session on the client; SSR has no session to check.
    if (typeof window === "undefined") return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  // Guard against SSR flash: only render shell once we know we're on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
