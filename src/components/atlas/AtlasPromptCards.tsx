import type { AtlasContext, DailyLog, Mission, Profile, WorkoutDay } from "../../types/gymcord";

export function buildAtlasPrompts(profile: Profile, context: AtlasContext, mission: Mission, dayLog: DailyLog, workout: WorkoutDay) {
  const nextTask = mission.tasks.find((task) => !task.completed);
  return [
    { title: "Daily coaching prompt", prompt: `Coach me through today's highest-impact action for ${profile.goal || "my goal"}.` },
    { title: "Workout suggestion", prompt: `Suggest a ${workout.duration}-minute ${workout.focus} workout based on ${workout.title}.` },
    { title: "Nutrition suggestion", prompt: `Help me hit protein and hydration today. Current protein: ${dayLog.protein}g, water: ${dayLog.water} glasses.` },
    { title: "Progress insight", prompt: context.biggestOpportunity },
    { title: "Goal reminder", prompt: `Remind me why ${profile.goal || "my goal"} matters and what to do next.` },
    { title: "Habit nudge", prompt: nextTask ? `Nudge me to complete ${nextTask.title}.` : "Give me a habit nudge to protect today's momentum." },
  ];
}

export function AtlasPromptCards({ prompts, onSelect }: { prompts: { title: string; prompt: string }[]; onSelect: (prompt: string) => void }) {
  return <div className="atlas-prompt-grid">{prompts.map((card) => <button key={card.title} onClick={() => onSelect(card.prompt)}><strong>{card.title}</strong><span>{card.prompt}</span></button>)}</div>;
}
