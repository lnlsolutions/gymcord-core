import { useState } from "react";
import type { CreateCheckInInput } from "../../repositories/CheckInRepository";
export function CheckInForm({ memberId, organizationId, onSubmit }: { memberId: string; organizationId?: string; onSubmit: (input: CreateCheckInInput) => void }) {
  const [reflection, setReflection] = useState("I stayed consistent and want one next action from my coach.");
  return <section className="card"><h3>Member Check-in Form</h3><textarea value={reflection} onChange={(event) => setReflection(event.target.value)} rows={4} style={{ width: "100%" }} /><button className="primary-button" type="button" onClick={() => onSubmit({ memberId, organizationId, weekOf: new Date().toISOString().slice(0, 10), goalReflection: reflection, mood: { score: 4 }, energy: { score: 3 }, soreness: { score: 2 }, compliance: { workout: "on_track", nutrition: "partial", workoutPercent: 80, nutritionPercent: 70 }, progressTrend: { direction: "up", summary: "Optimistic member submission ready for repository sync." }, atlasInsights: [], riskFlags: [], followUpTasks: [] })}>Optimistic submit check-in</button></section>;
}
