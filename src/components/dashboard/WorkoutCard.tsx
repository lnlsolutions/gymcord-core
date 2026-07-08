import type { WorkoutDay } from "../../types/gymcord";
import { DashboardPanel, ProgressBar } from "./cardUtils";
export function WorkoutCard({ workout, completion, onOpen }: { workout: WorkoutDay; completion: number; onOpen?: () => void }) {
  return <DashboardPanel title={workout.title} eyebrow="Today's workout" action={<span>{workout.duration} min</span>}><p>{workout.focus}</p><ProgressBar value={completion} /><p className="muted-line">{workout.exercises.length} movements planned</p><button className="secondary-button" onClick={onOpen}>Open session</button></DashboardPanel>;
}
