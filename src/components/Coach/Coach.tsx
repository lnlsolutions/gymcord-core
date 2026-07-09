import type { Achievement, AtlasContext, AtlasConversationEntry, AtlasInsight, AtlasMemory, DailyLog, Mission, Profile, StreakSnapshot, XpSnapshot } from "../../types/gymcord";
import { RewardCard } from "./RewardCard";
import { AtlasConversation } from "./AtlasConversation";
import { getRewards } from "../../lib/scoring";

export function Coach({ profile, dayLog, mission, xp, streak, nextAchievement, atlasInsights, atlasMemory, atlasContext, conversation, onRememberConversation }: { profile: Profile; dayLog: DailyLog; mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; nextAchievement: Achievement; atlasInsights: AtlasInsight[]; atlasMemory: AtlasMemory; atlasContext: AtlasContext; conversation: AtlasConversationEntry[]; onRememberConversation: (entry: AtlasConversationEntry) => void }) {
  const rewards = getRewards(Math.round((mission.completionPercentage + dayLog.mood * 20 + dayLog.energy * 20) / 3));

  return (
    <>
      <AtlasConversation profile={profile} atlasContext={atlasContext} conversation={conversation} onRememberConversation={onRememberConversation} />
      <section className="page">
        <div className="atlas-dashboard panel">
          <p className="pill">Persistent Coach</p>
          <h2>{atlasContext.greeting}</h2>
          <div className="atlas-status-grid">
            <div><span>Today's focus</span><strong>{atlasContext.todayFocus}</strong></div>
            <div><span>Recovery status</span><strong>{atlasContext.recoveryStatus}</strong></div>
            <div><span>Biggest opportunity</span><strong>{atlasContext.biggestOpportunity}</strong></div>
            <div><span>Last workout</span><strong>{atlasContext.lastWorkoutSummary}</strong></div>
            <div><span>Current streak</span><strong>{atlasContext.currentStreak} days</strong></div>
            <div><span>Mission status</span><strong>{atlasContext.missionStatus}</strong></div>
          </div>
        </div>

        <div className="panel memory-grid-panel">
          <h3>Atlas Memory</h3>
          <div className="memory-grid">
            <div><strong>Name</strong><span>{atlasMemory.name || "Not set"}</span></div>
            <div><strong>Goal</strong><span>{atlasMemory.goal || "Not set"}</span></div>
            <div><strong>Injuries</strong><span>{atlasMemory.injuries.length ? atlasMemory.injuries.join(" · ") : "No injury notes captured"}</span></div>
            <div><strong>Favorite exercises</strong><span>{atlasMemory.favoriteExercises.length ? atlasMemory.favoriteExercises.join(" · ") : "Complete workouts to build favorites"}</span></div>
            <div><strong>Workout history</strong><span>{atlasMemory.workoutHistory.length} logged sessions</span></div>
            <div><strong>Nutrition history</strong><span>{atlasMemory.nutritionHistory.length} daily entries</span></div>
            <div><strong>Sleep history</strong><span>{atlasMemory.sleepHistory.length} sleep entries</span></div>
            <div><strong>Recovery history</strong><span>{atlasMemory.recoveryHistory.length} recovery entries</span></div>
            <div><strong>PR history</strong><span>{atlasMemory.prHistory.length ? atlasMemory.prHistory.map((pr) => `${pr.exercise}: ${pr.value}`).join(" · ") : "No PRs yet"}</span></div>
          </div>
        </div>

        <div className="panel"><h3>Daily Coaching Prompts</h3>{atlasContext.coachingMessages.map((message) => <div key={message} className="coach-card"><strong>Context Engine</strong><p>{message}</p></div>)}</div>
        <div className="panel"><h3>Workout Suggestions</h3><div className="coach-card"><strong>Next session</strong><p>{atlasContext.todayFocus}</p></div><div className="coach-card"><strong>Habit nudge</strong><p>Complete one training action today to protect your {streak.currentStreak} day streak.</p></div></div>
        <div className="panel"><h3>Nutrition Suggestions</h3><div className="coach-card"><strong>Protein target</strong><p>Use today's meals to support {profile.goal || "your current goal"}; log protein and hydration before bed.</p></div></div>
        <div className="panel"><h3>Progress Insights</h3>{atlasInsights.map((item) => <div key={item.message} className="coach-card"><strong>{item.priority} Priority</strong><p>{item.message}</p></div>)}</div>
        <div className="panel"><h3>Goal Reminders</h3><div className="coach-card"><strong>{profile.goal || "Primary goal"}</strong><p>{atlasContext.missionStatus}</p></div></div>
        <div className="panel"><h3>Safety Disclaimer</h3><p>Atlas provides general fitness and nutrition coaching, not medical advice. Stop if you feel pain, and consult a qualified professional for injuries, medical conditions, or diet restrictions.</p></div>
        <div className="panel"><h3>Next Achievement</h3><div className="coach-card"><strong>{nextAchievement.title}</strong><p>{nextAchievement.description}</p><span>{nextAchievement.progress}/{nextAchievement.target} complete</span></div></div>
        <div className="panel"><h3>Reward Progress</h3>{rewards.map((reward) => <RewardCard key={reward.title} reward={reward} />)}</div>
        <div className="panel xp-panel"><h3>Coach Level</h3><p>Level {xp.currentLevel}</p><strong>{xp.currentXp}/{xp.xpNeededForNextLevel} XP · {streak.currentStreak} day streak</strong></div>
      </section>
    </>
  );
}
