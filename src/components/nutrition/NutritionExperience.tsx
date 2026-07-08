import { useMemo, useState } from "react";
import { useAuth } from "../../auth";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { nutritionRepository, type NutritionSaveResult } from "../../repositories/NutritionRepository";
import type { DailyLog } from "../../types/gymcord";
import { MacroSummary } from "./MacroSummary";
import { MealLogger } from "./MealLogger";
import { MealPhotoCard } from "./MealPhotoCard";
import { NutritionHeader } from "./NutritionHeader";
import { NutritionSummary } from "./NutritionSummary";
import { WaterLogger } from "./WaterLogger";

export function NutritionExperience({ initialLog, date = todayKey(), developer = false }: { initialLog?: DailyLog; date?: string; developer?: boolean }) {
  const auth = useAuth();
  const repository = useMemo(() => nutritionRepository, []);
  const [log, setLog] = useState<DailyLog>(() => initialLog ?? createEmptyDay(date));
  const [result, setResult] = useState<NutritionSaveResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateLog(patch: Partial<DailyLog>) {
    setLog((current) => ({ ...current, ...patch }));
  }

  async function saveNutrition() {
    setSaving(true);
    setError("");
    try {
      const next = await repository.saveNutrition(auth.session, log);
      setResult(next);
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Could not save nutrition log.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={developer ? "dev-page" : "page"}>
      <NutritionHeader date={log.date} provider={repository.providerName} saveResult={result} />
      <MealLogger log={log} onChange={updateLog} />
      <div className="grid">
        <WaterLogger log={log} onChange={updateLog} />
        <MealPhotoCard log={log} onChange={updateLog} />
      </div>
      <MacroSummary log={log} />
      <button className="primary-button" onClick={saveNutrition} disabled={saving}>{saving ? "Saving..." : "Save nutrition log"}</button>
      {error && <p className="error">{error}</p>}
      <NutritionSummary result={result} saveStatus={repository.getLastSaveStatus()} offlineQueueSize={repository.getOfflineQueue().length} />
    </main>
  );
}
