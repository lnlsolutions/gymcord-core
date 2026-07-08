export type RestTimerPreset = 60 | 90 | "custom";

export interface RestTimerSnapshot {
  duration: number;
  remaining: number;
  running: boolean;
  completed: boolean;
  progressPercentage: number;
  label: string;
  hapticEvent: "idle" | "tick" | "complete";
}

export function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function buildRestTimer(duration: number, remaining: number, running: boolean, completed: boolean): RestTimerSnapshot {
  return {
    duration,
    remaining,
    running,
    completed,
    progressPercentage: duration ? Math.max(0, Math.min(100, (remaining / duration) * 100)) : 0,
    label: formatTimer(remaining),
    hapticEvent: completed ? "complete" : running ? "tick" : "idle",
  };
}

export function resolveTimerDuration(preset: RestTimerPreset, customSeconds: number) {
  return preset === "custom" ? Math.max(10, Math.min(600, customSeconds || 10)) : preset;
}
