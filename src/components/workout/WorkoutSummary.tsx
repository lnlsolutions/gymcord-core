import type { Mission, StreakSnapshot, WorkoutDay, XpSnapshot } from "../../types/gymcord";

export function WorkoutSummary({ workout, completedExercises, xp, mission, streak, xpAward }: { workout: WorkoutDay; completedExercises: number; xp: XpSnapshot; mission: Mission; streak: StreakSnapshot; xpAward: number }) {
  return (
    <section className="panel workout-summary">
      <p className="pill">Completion summary</p>
      <h2>{workout.title} saved.</h2>
      <div className="completion-grid">
        <div><strong>{completedExercises}/{workout.exercises.length}</strong><span>Exercises</span></div>
        <div><strong>+{xpAward}</strong><span>XP award</span></div>
        <div><strong>{mission.completionPercentage}%</strong><span>Mission</span></div>
        <div><strong>{streak.currentStreak}</strong><span>Streak</span></div>
      </div>
      <p>Level {xp.currentLevel} · {xp.currentXp}/{xp.xpNeededForNextLevel} XP to next level.</p>
    </section>
  );
}
