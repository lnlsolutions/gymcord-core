import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { trainerRepository } from "../../repositories";
import type { Trainer } from "../../types/domain";

interface TrainerOSProps {
  developer?: boolean;
}

const demoTrainer: Trainer = {
  id: "trainer_demo",
  userId: "trainer_demo_user",
  organizationIds: ["org_demo"],
  specialties: ["Strength", "Nutrition", "Habit coaching"],
  bio: "Trainer OS command center is wired through repository abstractions for mock and Supabase modes.",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export function TrainerOS({ developer = false }: TrainerOSProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [source, setSource] = useState<"cache" | "remote" | "mock">("mock");
  const [status, setStatus] = useState("Loading Trainer OS through repositories…");

  useEffect(() => {
    let active = true;
    trainerRepository.list({ organizationId: "org_demo" })
      .then((result) => {
        if (!active) return;
        setTrainers(result.data.items.length ? result.data.items : [demoTrainer]);
        setSource(result.source);
        setStatus("Trainer OS repository check passed.");
      })
      .catch((error: Error) => {
        if (!active) return;
        setTrainers([demoTrainer]);
        setStatus(`Repository fallback active: ${error.message}`);
      });
    return () => { active = false; };
  }, []);

  const repositoryMode = useMemo(() => appConfig.backend.provider === "supabase" ? "Supabase via repositories" : "Mock/local via repositories", []);

  return (
    <main className="trainer-os-shell">
      <section className="hero-card">
        <p className="eyebrow">{developer ? "Developer" : "Trainer"} OS</p>
        <h1>Trainer command center</h1>
        <p>Manage coaching operations without importing backend SDKs in UI surfaces.</p>
      </section>

      <section className="grid two-columns">
        <article className="panel-card">
          <h2>Repository status</h2>
          <ul className="check-list">
            <li>Mode: {repositoryMode}</li>
            <li>Source: {source}</li>
            <li>{status}</li>
            <li>Supabase access remains isolated to provider/auth infrastructure.</li>
          </ul>
        </article>

        <article className="panel-card">
          <h2>Active trainers</h2>
          {trainers.map((trainer) => (
            <div className="trainer-card" key={trainer.id}>
              <strong>{trainer.id}</strong>
              <p>{trainer.bio ?? "No bio yet."}</p>
              <small>{trainer.specialties.join(" • ") || "General coaching"}</small>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
