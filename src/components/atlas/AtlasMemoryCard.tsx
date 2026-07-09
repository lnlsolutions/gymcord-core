import type { AtlasMemory } from "../../types/gymcord";

export function AtlasMemoryCard({ memory }: { memory: AtlasMemory }) {
  return (
    <section className="panel atlas-memory-card">
      <h3>Atlas Memory</h3>
      <div className="memory-grid">
        <div><strong>Name</strong><span>{memory.name || "Not set"}</span></div>
        <div><strong>Goal</strong><span>{memory.goal || "Not set"}</span></div>
        <div><strong>Injuries</strong><span>{memory.injuries.length ? memory.injuries.join(" · ") : "No injury notes captured"}</span></div>
        <div><strong>Favorites</strong><span>{memory.favoriteExercises.length ? memory.favoriteExercises.join(" · ") : "Complete workouts to build favorites"}</span></div>
        <div><strong>Workouts</strong><span>{memory.workoutHistory.length} sessions</span></div>
        <div><strong>Nutrition</strong><span>{memory.nutritionHistory.length} entries</span></div>
        <div><strong>Recovery</strong><span>{memory.recoveryHistory.length} check-ins</span></div>
        <div><strong>PRs</strong><span>{memory.prHistory.length ? memory.prHistory.slice(0, 3).map((pr) => `${pr.exercise}: ${pr.value}`).join(" · ") : "No PRs yet"}</span></div>
      </div>
    </section>
  );
}
