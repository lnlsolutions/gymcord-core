import type { Achievement, Mission, StreakSnapshot } from "../../types/gymcord";
import { GOALS, clampPercentage } from "./constants";

function achievement(id: string, title: string, description: string, progress: number, target: number): Achievement {
  const completionPercentage = clampPercentage((Math.min(progress, target) / target) * 100);
  return { id, title, description, progress: Math.min(progress, target), target, completionPercentage, unlocked: completionPercentage >= 100 };
}

export function buildAchievements(missions: Mission[], streak: StreakSnapshot): Achievement[] {
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const workoutCompletions = missions.filter((mission) => mission.tasks.find((task) => task.id === "workout")?.completed).length;
  const proteinHits = missions.filter((mission) => mission.tasks.find((task) => task.id === "protein")?.completed).length;
  const recoveryHits = missions.filter((mission) => mission.tasks.find((task) => task.id === "recovery")?.completed).length;

  return [
    achievement("first-workout", "First Workout", "Complete your first training session.", workoutCompletions, 1),
    achievement("three-day-streak", "3 Day Streak", "Build a three-day activity streak.", streak.longestStreak, 3),
    achievement("seven-day-streak", "7 Day Streak", "Keep GymCord active for seven days.", streak.longestStreak, 7),
    achievement("thirty-day-streak", "30 Day Streak", "Become a 30-day consistency athlete.", streak.longestStreak, 30),
    achievement("protein-master", "Protein Master", `Hit ${GOALS.protein}g protein five times.`, proteinHits, 5),
    achievement("recovery-champion", "Recovery Champion", "Complete five recovery checks.", recoveryHits, 5),
    achievement("mission-complete", "Mission Complete", "Complete a full daily mission.", completedMissions, 1),
  ];
}

export function getNextAchievement(achievements: Achievement[]) {
  return achievements.find((achievement) => !achievement.unlocked) || achievements[achievements.length - 1];
}
