import type { Achievement, AtlasContext, AtlasConversationEntry, AtlasInsight, AtlasMemory, DailyLog, Mission, Profile, StreakSnapshot, XpSnapshot } from "../../types/gymcord";
import { AtlasConversation } from "./AtlasConversation";

export function Coach({ profile, atlasContext, conversation, atlasMemory, onRememberConversation }: { profile: Profile; dayLog: DailyLog; mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; nextAchievement: Achievement; atlasInsights: AtlasInsight[]; atlasMemory: AtlasMemory; atlasContext: AtlasContext; conversation: AtlasConversationEntry[]; onRememberConversation: (entry: AtlasConversationEntry) => void }) {
  return (
    <>
      <AtlasConversation profile={profile} atlasContext={atlasContext} conversation={conversation} atlasMemory={atlasMemory} onRememberConversation={onRememberConversation} />
      <section className="page premium-home">
        <div className="home-header-card"><p className="eyebrow">Atlas Coach</p><h2>{atlasContext.greeting}</h2><span>Your daily coach for training, meals, recovery, and confidence.</span></div>
        <article className="premium-card"><p className="eyebrow">Today</p><h3>{atlasContext.todayFocus}</h3><p>{atlasContext.biggestOpportunity}</p></article>
        <article className="premium-card"><p className="eyebrow">Suggestions</p>{atlasContext.coachingMessages.map((message) => <div key={message} className="activity-row"><span>{message}</span></div>)}</article>
        <article className="premium-card"><p className="eyebrow">Reminder</p><h3>Atlas is general fitness guidance.</h3><p>Stop if you feel pain and consult a qualified professional for medical conditions, injuries, or diet restrictions.</p></article>
      </section>
    </>
  );
}
