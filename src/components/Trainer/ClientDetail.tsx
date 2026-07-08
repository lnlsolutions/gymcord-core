import type { ReactNode } from "react";
import type { TrainerClientDetail } from "../../repositories/TrainerRepository";

function Section({ title, children }: { title: string; children: ReactNode }) { return <section className="trainer-panel"><h2>{title}</h2>{children}</section>; }
function Line({ label, value }: { label: string; value: ReactNode }) { return <div className="trainer-line"><strong>{label}</strong><span>{value}</span></div>; }

export function ClientDetail({ client, onAddNote, onFlagRisk, onAssignWorkout }: { client: TrainerClientDetail | null; onAddNote: (note: string) => void; onFlagRisk: (reason: string) => void; onAssignWorkout: (workoutId: string) => void }) {
  if (!client) return <section className="trainer-panel"><h2>Client detail</h2><p className="muted">Select a client to review their Trainer OS record.</p></section>;
  return <main className="trainer-page"><section className="trainer-hero compact"><p className="eyebrow">Client Detail</p><h1>{client.name}</h1><p>{client.goal}</p><div className="trainer-actions"><button onClick={() => onAssignWorkout("trainer-foundation-week-1")}>Assign Foundation Week 1</button><button onClick={() => onAddNote(`Check-in completed for ${client.name}`)}>Add sample note</button><button onClick={() => onFlagRisk("Trainer manually flagged for follow-up")}>Flag risk</button></div></section><section className="trainer-detail-grid">
    <Section title="Profile"><Line label="Age / gender" value={`${client.profile.age} · ${client.profile.gender}`} /><Line label="Height" value={client.profile.height} /><Line label="Weight" value={`${client.profile.currentWeight} → ${client.profile.goalWeight}`} /><Line label="Start date" value={client.profile.startDate} /></Section>
    <Section title="Goals"><ul>{client.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></Section>
    <Section title="Injuries"><ul>{client.injuries.map((injury) => <li key={injury}>{injury}</li>)}</ul></Section>
    <Section title="Workout history">{client.workoutHistory.map((item) => <Line key={item.id} label={item.title} value={`${item.completion}% · ${item.completedAt}`} />)}</Section>
    <Section title="Nutrition logs">{client.nutritionLogs.map((item) => <Line key={item.id} label={item.date} value={`${item.calories} kcal · ${item.protein}g protein · ${item.compliance}%`} />)}</Section>
    <Section title="Progress photos metadata">{client.progressPhotos.length ? client.progressPhotos.map((photo) => <Line key={photo.id} label={photo.takenOn} value={`${photo.angle} · ${photo.status}`} />) : <p className="muted">No progress photos this week.</p>}</Section>
    <Section title="Measurements">{client.measurements.map((item) => <Line key={item.date} label={item.date} value={`${item.weight} lb · waist ${item.waist} · chest ${item.chest}`} />)}</Section>
    <Section title="XP / streak status"><Line label="XP" value={`${client.xpStatus.totalXp} · level ${client.xpStatus.level}`} /><Line label="Streak" value={`${client.xpStatus.streakDays} days${client.xpStatus.streakInDanger ? " · in danger" : ""}`} /></Section>
    <Section title="Atlas summary"><p>{client.atlasSummary}</p></Section>
    <Section title="Trainer notes">{client.trainerNotes.length ? client.trainerNotes.map((note) => <Line key={note.id} label={new Date(note.createdAt).toLocaleString()} value={note.note} />) : <p className="muted">No trainer notes yet.</p>}</Section>
  </section></main>;
}
