import type { AtlasContext, AtlasMemory, DailyLog, Mission, StreakSnapshot, TransformationSnapshot, WorkoutDay } from "../../types/gymcord";

function pctChange(current: number, previous: number) {
  if (!previous || !current) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function latestLoggedWorkout(memory: AtlasMemory) {
  return memory.workoutHistory[0];
}

function biggestOpportunity(dayLog: DailyLog, mission: Mission) {
  if (dayLog.protein < 100) return "Bring protein above 100g to support muscle repair.";
  if (dayLog.sleep < 7) return "Protect 7+ hours of sleep to unlock better recovery.";
  const task = mission.tasks.filter((item) => !item.completed).sort((a, b) => a.completionPercentage - b.completionPercentage)[0];
  return task ? `${task.title}: ${Math.ceil(task.target - task.progress)} remaining.` : "Maintain momentum with a short walk or mobility block.";
}

function recoveryStatus(dayLog: DailyLog, transformation?: TransformationSnapshot) {
  if (transformation && transformation.progress.recovery >= 78) return "Great — recovery trend is supporting hard training today.";
  if (dayLog.sleep < 6) return "Limited — sleep is the constraint to solve first.";
  if (dayLog.energy <= 2 || dayLog.mood <= 2) return "Cautious — keep intensity controlled and prioritize basics.";
  return "Ready — energy, mood, and sleep are in a workable range.";
}

function lastWorkoutSummary(memory: AtlasMemory) {
  const workout = latestLoggedWorkout(memory);
  if (!workout) return "No workout logged yet. Atlas will summarize your first session here.";
  return `${workout.date}: ${workout.completedExercises.length} exercises completed${workout.totalVolume ? ` with ${workout.totalVolume} lb logged` : ""}.`;
}

function buildDynamicMessages(memory: AtlasMemory, dayLog: DailyLog, transformation?: TransformationSnapshot) {
  const messages: string[] = [];
  const yesterday = memory.nutritionHistory.find((entry) => entry.date < dayLog.date);
  if (yesterday && yesterday.protein < 100) messages.push(`You missed protein yesterday at ${yesterday.protein}g.`);
  if (dayLog.sleep >= 7 && dayLog.energy >= 4) messages.push("Today's recovery looks great — this is a green-light training day.");

  const glutePoints = Object.values(memory.workoutHistory).length;
  const latestRecovery = memory.recoveryHistory[0];
  const weekSleep = memory.sleepHistory.slice(0, 7).filter((entry) => entry.sleep > 0);
  const averageSleep = weekSleep.length ? weekSleep.reduce((sum, entry) => sum + entry.sleep, 0) / weekSleep.length : 0;

  if (transformation && transformation.progress.strengthProgress > 0) messages.push(`Strength has improved ${transformation.progress.strengthProgress}% across logged sessions.`);
  if (glutePoints >= 3) messages.push(`Glute-focused consistency is building across ${glutePoints} logged workouts.`);
  if (averageSleep > 0 && averageSleep < 7) messages.push("Sleep has limited recovery this week.");
  if (latestRecovery && latestRecovery.energy >= 4 && latestRecovery.mood >= 4) messages.push("Mood and energy are trending positive — use that for quality reps.");

  return messages.slice(0, 4);
}

export function buildAtlasContext({ memory, dayLog, mission, streak, todayWorkout, transformation }: { memory: AtlasMemory; dayLog: DailyLog; mission: Mission; streak: StreakSnapshot; todayWorkout: WorkoutDay; transformation?: TransformationSnapshot }): AtlasContext {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return {
    greeting: `${greeting}${memory.name ? `, ${memory.name.split(" ")[0]}` : ""}.`,
    todayFocus: `${todayWorkout.focus}: ${todayWorkout.title}`,
    recoveryStatus: recoveryStatus(dayLog, transformation),
    biggestOpportunity: biggestOpportunity(dayLog, mission),
    lastWorkoutSummary: lastWorkoutSummary(memory),
    currentStreak: streak.currentStreak,
    missionStatus: `${mission.completionPercentage}% complete · ${mission.earnedXp}/${mission.xpReward} XP earned`,
    coachingMessages: buildDynamicMessages(memory, dayLog, transformation),
  };
}
