import { createWorkoutDay, type ProgramWorkoutDay } from "../../repositories";
import { WorkoutDayBuilder } from "./WorkoutDayBuilder";
export function WeeklyScheduleBuilder({ schedule, onChange }: { schedule: ProgramWorkoutDay[]; onChange: (schedule: ProgramWorkoutDay[]) => void }) {
  return <section className="panel-card"><div className="section-heading"><h2>Weekly schedule builder</h2><button className="ghost-button" onClick={() => onChange([...schedule, createWorkoutDay()])}>Add workout day</button></div>{schedule.map((day) => <WorkoutDayBuilder key={day.id} day={day} onChange={(next) => onChange(schedule.map((item) => item.id === day.id ? next : item))} onRemove={() => onChange(schedule.filter((item) => item.id !== day.id))} />)}</section>;
}
