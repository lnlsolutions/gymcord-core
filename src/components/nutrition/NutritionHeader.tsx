import type { NutritionSaveResult } from "../../repositories/NutritionRepository";

export function NutritionHeader({ date, provider, saveResult }: { date: string; provider: string; saveResult?: NutritionSaveResult | null }) {
  return (
    <header className="topbar nutrition-topbar">
      <div>
        <p className="eyebrow">Nutrition Mission</p>
        <h1>Fuel Log</h1>
        <p className="muted">{date} · Provider: {provider}</p>
      </div>
      <div className="avatar">{saveResult?.completionState === "complete" ? "✓" : "🥗"}</div>
    </header>
  );
}
