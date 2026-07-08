import type { TrainerClientDetail, TrainerClientSummary } from "../../repositories/TrainerRepository";

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="trainer-metric"><span>{label}</span><strong>{value}</strong></div>;
}

export function TrainerDashboard({ clients, selectedClient, onSelectClient }: { clients: TrainerClientSummary[]; selectedClient: TrainerClientDetail | null; onSelectClient: (clientId: string) => void }) {
  const atRiskCount = clients.filter((client) => client.atRisk).length;
  const unread = clients.reduce((sum, client) => sum + client.unreadMessages, 0);
  const averageAdherence = clients.length ? Math.round(clients.reduce((sum, client) => sum + client.adherence, 0) / clients.length) : 0;

  return (
    <main className="trainer-page">
      <section className="trainer-hero">
        <p className="eyebrow">Trainer OS</p>
        <h1>Client Command Center</h1>
        <p>Manage assigned clients, adherence signals, nutrition compliance, progress photos, messages, and risk flags without changing the member experience.</p>
        <div className="trainer-metrics"><Metric label="Assigned clients" value={clients.length} /><Metric label="Avg adherence" value={`${averageAdherence}%`} /><Metric label="Unread messages" value={unread} /><Metric label="At risk" value={atRiskCount} /></div>
      </section>
      <section className="trainer-grid-layout">
        <div className="trainer-panel"><h2>Assigned clients</h2><div className="trainer-client-list">{clients.map((client) => <button className={`trainer-client-card ${selectedClient?.id === client.id ? "active" : ""}`} key={client.id} onClick={() => onSelectClient(client.id)}><div><strong>{client.name}</strong><span>{client.goal}</span></div><div className="trainer-client-stats"><span>{client.adherence}% adherence</span><span>{client.unreadMessages} unread</span>{client.atRisk && <em>At risk</em>}</div></button>)}</div></div>
        <div className="trainer-panel"><h2>Client adherence</h2>{clients.map((client) => <Metric key={client.id} label={client.name} value={`${client.adherence}%`} />)}</div>
        <div className="trainer-panel"><h2>Latest workout completion</h2>{clients.map((client) => <Metric key={client.id} label={client.name} value={client.latestWorkoutCompletion} />)}</div>
        <div className="trainer-panel"><h2>Nutrition compliance</h2>{clients.map((client) => <Metric key={client.id} label={client.name} value={`${client.nutritionCompliance}%`} />)}</div>
        <div className="trainer-panel"><h2>Progress photo status</h2>{clients.map((client) => <Metric key={client.id} label={client.name} value={client.progressPhotoStatus} />)}</div>
        <div className="trainer-panel danger"><h2>At-risk clients</h2>{clients.filter((client) => client.atRisk).map((client) => <Metric key={client.id} label={client.name} value={client.riskReason ?? "Needs review"} />)}{!atRiskCount && <p className="muted">No active risk flags.</p>}</div>
      </section>
    </main>
  );
}
