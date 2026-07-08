import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { useAuth } from "../../auth";
import { createBackendProvider } from "../../api/client";
import { OrganizationRepository } from "../../repositories/OrganizationRepository";
import { realtimeService } from "../../services/realtime";
import { keyValueStorage } from "../../services/storage";
import { EventTypes } from "../../core/events";
import { supabaseTableMap } from "../../api/providers/SupabaseProvider";

interface CheckRow {
  label: string;
  value: string;
  detail?: string;
}

function StatusCard({ title, rows }: { title: string; rows: CheckRow[] }) {
  return (
    <section className="dev-card">
      <h2>{title}</h2>
      <div className="dev-grid">
        {rows.map((row) => (
          <div className="dev-row" key={row.label}>
            <strong>{row.label}</strong>
            <span>{row.value}</span>
            {row.detail && <small>{row.detail}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DeveloperDataFlow() {
  const auth = useAuth();
  const provider = useMemo(() => createBackendProvider(), []);
  const repository = useMemo(() => new OrganizationRepository(provider), [provider]);
  const [organization, setOrganization] = useState("checking...");
  const [sampleRead, setSampleRead] = useState("pending");
  const [sampleWrite, setSampleWrite] = useState("dry-run pending");
  const [realtime, setRealtime] = useState("checking...");
  const [storage, setStorage] = useState("checking...");

  useEffect(() => {
    let active = true;

    repository.list()
      .then((result) => {
        if (!active) return;
        const first = result.data.items[0];
        setOrganization(first ? `${first.name} (${first.slug})` : "No organizations returned");
        setSampleRead(`${result.source}: ${result.data.items.length} organization(s)`);
        setSampleWrite(`dry-run OK: PATCH /organizations/${first?.id ?? "<id>"} { settings }`);
      })
      .catch((error: Error) => {
        if (!active) return;
        setOrganization("Unavailable");
        setSampleRead(`failed: ${error.message}`);
        setSampleWrite("dry-run skipped until read succeeds");
      });

    realtimeService.connect()
      .then(() => realtimeService.publish(EventTypes.NotificationCreated, {
        id: `dev-data-flow-${Date.now()}`,
        title: "Developer data-flow ping",
        body: "Dry-run realtime verification event.",
        createdAt: new Date().toISOString(),
      }, "dev-data-flow"))
      .then((event) => active && setRealtime(`connected; published ${event.type}`))
      .catch((error: Error) => active && setRealtime(`failed: ${error.message}`));

    try {
      keyValueStorage.set("gc.dev.dataFlow", { checkedAt: new Date().toISOString() });
      const stored = keyValueStorage.get<{ checkedAt?: string }>("gc.dev.dataFlow", {});
      setStorage(stored.checkedAt ? `local storage OK: ${stored.checkedAt}` : "local storage fallback returned empty value");
    } catch (error) {
      setStorage(error instanceof Error ? `failed: ${error.message}` : "failed");
    }

    return () => { active = false; };
  }, [repository]);

  return (
    <main className="dev-page">
      <header className="dev-header">
        <p className="eyebrow">GymCord Developer Verification</p>
        <h1>Data Flow</h1>
        <p>Read-only diagnostics for repository wiring, provider selection, realtime, and browser storage.</p>
      </header>

      <StatusCard title="Runtime" rows={[
        { label: "Active provider", value: provider.name, detail: `Configured as ${appConfig.backend.provider}` },
        { label: "Supabase env", value: appConfig.backend.supabase.url && appConfig.backend.supabase.anonKey ? "configured" : "not configured", detail: appConfig.backend.provider === "mock" ? "Mock mode does not require Supabase environment variables." : undefined },
        { label: "Auth status", value: auth.status, detail: auth.session?.user.email ?? "No active user session" },
      ]} />

      <StatusCard title="Repository Checks" rows={[
        { label: "Organization", value: organization },
        { label: "Sample repository read", value: sampleRead },
        { label: "Sample repository write dry-run", value: sampleWrite, detail: "No mutation is sent from this verification page." },
      ]} />

      <StatusCard title="Services" rows={[
        { label: "Realtime status", value: realtime },
        { label: "Storage status", value: storage },
      ]} />

      <section className="dev-card">
        <h2>Supabase table mapping</h2>
        <pre>{JSON.stringify(supabaseTableMap, null, 2)}</pre>
      </section>
    </main>
  );
}
