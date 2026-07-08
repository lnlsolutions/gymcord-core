import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { apiClient } from "../../api/client";
import { appConfig } from "../../config";
import { saved } from "../../lib/storage";
import type { Profile } from "../../types/gymcord";

async function readRow(path: string) {
  try {
    const result = await apiClient.get<unknown>(path, { retryAttempts: appConfig.backend.retryAttempts, timeoutMs: appConfig.backend.timeoutMs });
    return result.data;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to load row." };
  }
}

export function DeveloperOnboardingFlow() {
  const auth = useAuth();
  const [userRow, setUserRow] = useState<unknown>(null);
  const [organizationRow, setOrganizationRow] = useState<unknown>(null);
  const [profileRow, setProfileRow] = useState<unknown>(null);
  const complete = saved(appConfig.storageKeys.profileComplete, false);
  const localProfile = saved<Profile | null>(appConfig.storageKeys.profile, null);

  useEffect(() => {
    const userId = auth.session?.user.id;
    const orgId = auth.session?.user.activeOrganizationId;
    const role = auth.session?.user.roles[0] === "trainer" ? "trainerProfiles" : "memberProfiles";
    if (!userId) return;
    void readRow(`/users/${userId}`).then(setUserRow);
    if (orgId) void readRow(`/organizations/${orgId}`).then(setOrganizationRow);
    void readRow(`/${role}/${localProfile?.id ?? userId}`).then(setProfileRow);
  }, [auth.session, localProfile?.id]);

  return <main className="screen dev-screen">
    <section className="hero-card"><p className="eyebrow">Developer</p><h1>Onboarding flow</h1><p>Supabase and mock-mode state used by signup, onboarding, and session restore.</p></section>
    <section className="panel"><h2>Auth session</h2><pre>{JSON.stringify(auth.session, null, 2)}</pre></section>
    <section className="panel"><h2>User row</h2><pre>{JSON.stringify(userRow, null, 2)}</pre></section>
    <section className="panel"><h2>Organization row</h2><pre>{JSON.stringify(organizationRow ?? auth.session?.organization, null, 2)}</pre></section>
    <section className="panel"><h2>Profile row</h2><pre>{JSON.stringify(profileRow, null, 2)}</pre></section>
    <section className="panel"><h2>Onboarding completion</h2><pre>{JSON.stringify({ complete, localProfile }, null, 2)}</pre></section>
  </main>;
}
