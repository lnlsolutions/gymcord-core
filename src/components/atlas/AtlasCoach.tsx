import type { AtlasContext, AtlasConversationEntry, AtlasInsight, AtlasMemory, DailyLog, Mission, Profile, StreakSnapshot, WorkoutDay } from "../../types/gymcord";
import { AtlasChat } from "./AtlasChat";
import { AtlasHeader } from "./AtlasHeader";
import { AtlasInsights } from "./AtlasInsights";
import { AtlasMemoryCard } from "./AtlasMemoryCard";
import { buildAtlasPrompts } from "./AtlasPromptCards";

export function AtlasCoach({ profile, dayLog, mission, streak, todayWorkout, atlasInsights, atlasMemory, atlasContext, conversation, onRememberConversation }: { profile: Profile; dayLog: DailyLog; mission: Mission; streak: StreakSnapshot; todayWorkout: WorkoutDay; atlasInsights: AtlasInsight[]; atlasMemory: AtlasMemory; atlasContext: AtlasContext; conversation: AtlasConversationEntry[]; onRememberConversation: (entry: AtlasConversationEntry) => void }) {
  const prompts = buildAtlasPrompts(profile, atlasContext, mission, dayLog, todayWorkout);

  return (
    <section className="page atlas-coach-page">
      <AtlasHeader profile={profile} atlasContext={atlasContext} />
      <AtlasChat atlasContext={atlasContext} conversation={conversation} prompts={prompts} onRememberConversation={onRememberConversation} />
      <AtlasInsights insights={atlasInsights} context={atlasContext} mission={mission} streak={streak} />
      <AtlasMemoryCard memory={atlasMemory} />
    </section>
  );
}
