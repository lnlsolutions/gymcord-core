import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { createEmptyDay, todayKey } from "../../lib/storage";
import { progressRepository, type ProgressRepositoryState } from "../../repositories/ProgressRepository";

export function DeveloperProgress() {
  const auth = useAuth();
  const [state, setState] = useState<ProgressRepositoryState | null>(null);
  const [status, setStatus] = useState("Preparing progress repository validation...");

  useEffect(() => {
    const date = todayKey();
    const log = { ...createEmptyDay(date), measurements: { weight: "184", waist: "33", hips: "39", glutes: "40", thighs: "23", arms: "14", chest: "41" }, photos: { front: "progress/front-dev.jpg", side: "progress/side-dev.jpg", back: "progress/back-dev.jpg" } };
    progressRepository.saveProgress(auth.session, { date, log, logs: { [date]: log } })
      .then((next) => { setState(next); setStatus("Progress save completed through ProgressRepository."); })
      .catch((error: Error) => setStatus(`Progress validation failed: ${error.message}`));
  }, [auth.session]);

  return <main className="page dev-page"><div className="panel hero-panel"><p className="eyebrow">Developer validation</p><h1>Progress Experience Check</h1><p>{status}</p></div><div className="grid"><div className="panel"><h3>Active provider</h3><p>{state?.provider ?? progressRepository.providerName}</p></div><div className="panel"><h3>Save status</h3><p>{state?.saveStatus ?? progressRepository.getLastSaveStatus()}</p><p>Offline queue: {state?.offlineQueue.length ?? progressRepository.getOfflineQueue().length}</p></div><div className="panel"><h3>Measurements</h3><pre>{JSON.stringify(state?.measurements, null, 2)}</pre></div><div className="panel"><h3>Weight history</h3><pre>{JSON.stringify(state?.weightHistory, null, 2)}</pre></div><div className="panel"><h3>Progress photo metadata</h3><pre>{JSON.stringify(state?.progressPhotoMetadata, null, 2)}</pre></div><div className="panel"><h3>Transformation score</h3><p>{state?.transformationScore ?? "—"}</p></div><div className="panel"><h3>XP event</h3><pre>{JSON.stringify(state?.xpEvent, null, 2)}</pre></div><div className="panel"><h3>Mission update</h3><pre>{JSON.stringify(state?.missionUpdate, null, 2)}</pre></div><div className="panel"><h3>Streak update</h3><pre>{JSON.stringify(state?.streakUpdate, null, 2)}</pre></div></div></main>;
}
