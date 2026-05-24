import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, useMe } from "@/components/layout/AppShell";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <AppShell>
      <OnboardingGate>
        <Outlet />
      </OnboardingGate>
    </AppShell>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useMe();
  const [dismissed, setDismissed] = useState(false);
  const needs = !isLoading && data && !data.profile.onboarding_completed && !dismissed;
  return (
    <>
      {children}
      {needs && <OnboardingModal onDone={() => setDismissed(true)} />}
    </>
  );
}
