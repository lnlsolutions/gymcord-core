import { useMemo } from "react";
import { appConfig } from "../../config";
import { getSupabaseEnvironmentStatus } from "../../config/supabase";

const checks = ["Connection", "Authentication", "Realtime", "Storage", "Database", "Environment", "Health"] as const;

export function DeveloperSupabase() {
  const env = useMemo(() => getSupabaseEnvironmentStatus(), []);
  const providerEnabled = appConfig.backend.provider === "supabase";
  const healthy = providerEnabled && env.configured;

  const statusFor = (label: string) => {
    if (label === "Environment") return env.configured ? "Configured" : `Missing ${env.missing.join(", ")}`;
    if (label === "Health") return healthy ? "Ready" : "Action required";
    return healthy ? "Ready" : "Waiting for configuration";
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-pink-300">Developer</p>
          <h1 className="text-3xl font-bold">Supabase Production Integration</h1>
          <p className="mt-2 text-slate-300">Provider: {appConfig.backend.provider}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {checks.map((label) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">{label}</h2>
                <span className={`rounded-full px-3 py-1 text-xs ${healthy || label === "Environment" && env.configured ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>{statusFor(label)}</span>
              </div>
            </article>
          ))}
        </div>

        <pre className="overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-200">{JSON.stringify({ configured: env.configured, missing: env.missing, url: env.values.url, storageBucket: env.values.storageBucket, realtimeChannel: env.values.realtimeChannel, schema: env.values.schema }, null, 2)}</pre>
      </section>
    </main>
  );
}
