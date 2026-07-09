import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import type { DailyLog } from "../../types/gymcord";
import { progressRepository, type ProgressRepositoryState } from "../../repositories/ProgressRepository";
import { ProgressHeader } from "./ProgressHeader";
import { MeasurementLogger } from "./MeasurementLogger";
import { WeightTracker } from "./WeightTracker";
import { BodyMeasurements } from "./BodyMeasurements";
import { ProgressPhotoLogger } from "./ProgressPhotoLogger";
import { ProgressTimeline } from "./ProgressTimeline";
import { ProgressSummary } from "./ProgressSummary";

export function ProgressExperience({ logs, selectedDate, dayLog, updateDay }: { logs: Record<string, DailyLog>; selectedDate: string; dayLog: DailyLog; updateDay: (patch: Partial<DailyLog>) => void }) {
  const auth = useAuth();
  const [state, setState] = useState<ProgressRepositoryState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { progressRepository.load(auth.session, selectedDate).then(setState).catch(() => undefined); }, [auth.session, selectedDate]);

  function saveProgress(nextLog = dayLog) {
    setSaving(true);
    progressRepository.saveProgress(auth.session, { date: selectedDate, log: nextLog, logs: { ...logs, [selectedDate]: nextLog } })
      .then(setState)
      .finally(() => setSaving(false));
  }

  function patchLog(patch: Partial<DailyLog>) {
    const nextLog = { ...dayLog, ...patch };
    updateDay(patch);
    saveProgress(nextLog);
  }

  return <section className="page transformation-progress-page"><ProgressHeader provider={state?.provider ?? progressRepository.providerName} score={state?.transformationScore ?? 0} saveStatus={saving ? "Saving progress..." : state?.saveStatus ?? progressRepository.getLastSaveStatus()} /><div className="grid"><WeightTracker measurements={dayLog.measurements} history={state?.weightHistory ?? []} onChange={(measurements) => patchLog({ measurements })} /><MeasurementLogger measurements={dayLog.measurements} onChange={(measurements) => patchLog({ measurements })} /></div><ProgressPhotoLogger photos={dayLog.photos} metadata={state?.progressPhotoMetadata ?? []} onChange={(photos) => patchLog({ photos })} /><div className="grid"><BodyMeasurements measurements={dayLog.measurements} /><ProgressSummary state={state} /></div><ProgressTimeline items={state?.timeline ?? []} /></section>;
}
