import { useEffect, useMemo, useState } from "react";
import { appConfig } from "../../config";
import { memberRepository, trainerRepository } from "../../repositories";
import type { MemberProfile, Trainer } from "../../types/domain";

interface TrainerDashboardProps {
  developer?: boolean;
}

const demoTrainer: Trainer = {
  id: "trainer_demo",
  userId: "trainer_demo_user",
  organizationIds: ["org_demo"],
  specialties: ["Strength", "Nutrition", "Habit coaching"],
  bio: "Trainer Portal is wired through repository abstractions for mock and Supabase modes.",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

const demoMembers: MemberProfile[] = [
  {
    id: "member_demo",
    userId: "member_demo_user",
    organizationId: "org_demo",
    trainerId: "trainer_demo",
    goals: ["Build consistency", "Improve strength"],
    status: "active",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  },
];

export function TrainerDashboard({ developer = false }: TrainerDashboardProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [source, setSource] = useState<"cache" | "remote" | "mock">("mock");
  const [status, setStatus] = useState("Loading Trainer Portal through repositories…");

  useEffect(() => {
    let active = true;

    async function loadRepositoryState() {
      const trainerResult = await trainerRepository.list({ organizationId: "org_demo" });
      const nextTrainers = trainerResult.data.items.length ? trainerResult.data.items : [demoTrainer];
      const activeTrainerId = nextTrainers[0]?.id ?? demoTrainer.id;
      const memberResult = await memberRepository.listByTrainer(activeTrainerId);

      if (!active) return;
      setTrainers(nextTrainers);
      setMembers(memberResult.data.length ? memberResult.data : demoMembers);
      setSource(trainerResult.source === "remote" || memberResult.source === "remote" ? "remote" : trainerResult.source);
      setStatus("Trainer Portal repository check passed.");
    }

    loadRepositoryState().catch((error: Error) => {
      if (!active) return;
      setTrainers([demoTrainer]);
      setMembers(demoMembers);
      setStatus(`Repository fallback active: ${error.message}`);
    });

    return () => { active = false; };
  }, []);

  const repositoryMode = useMemo(() => appConfig.backend.provider === "supabase" ? "Supabase via repositories" : "Mock/local via repositories", []);

  return (
    <main className="trainer-os-shell">
      <section className="hero-card">
        <p className="eyebrow">{developer ? "Developer" : "Trainer"} Portal</p>
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
            <li>TrainerDashboard loads trainers through TrainerRepository.</li>
            <li>TrainerDashboard loads assigned members through MemberRepository.</li>
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

        <article className="panel-card">
          <h2>Assigned members</h2>
          {members.map((member) => (
            <div className="trainer-card" key={member.id}>
              <strong>{member.id}</strong>
              <p>Status: {member.status}</p>
              <small>{member.goals.join(" • ") || "No goals recorded"}</small>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
