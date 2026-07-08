import { Bot, Send, Sparkles } from "lucide-react";
import type { DailyLog, Profile } from "../../types/gymcord";

interface AtlasConversationProps {
  profile: Profile;
  dayLog: DailyLog;
}

function buildPromptSuggestions(profile: Profile, dayLog: DailyLog) {
  return [
    `Plan my next workout for ${profile.goal || "my goal"}`,
    dayLog.protein < 100 ? "How can I hit protein today?" : "Review my nutrition momentum",
    dayLog.sleep < 7 ? "Help me improve recovery tonight" : "What should I optimize next?",
  ];
}

export function AtlasConversation({ profile, dayLog }: AtlasConversationProps) {
  const suggestions = buildPromptSuggestions(profile, dayLog);

  return (
    <section className="page atlas-page">
      <div className="atlas-hero panel">
        <div className="atlas-orb"><Bot size={30} /></div>
        <p className="pill"><Sparkles size={14} /> Atlas AI</p>
        <h2>Hi {profile.name.split(" ")[0] || "there"}, I’m Atlas.</h2>
        <p>
          I’m designed as GymCord’s extensible intelligence layer for training,
          nutrition, recovery, progress, and gym retention workflows.
        </p>
      </div>

      <div className="panel conversation-shell">
        <div className="message-row assistant">
          <div className="message-bubble">
            Based on today’s data, your best next action is to complete your
            training session and move protein toward 130g. What would you like
            to optimize first?
          </div>
        </div>

        <div className="suggestion-grid">
          {suggestions.map((suggestion) => <button key={suggestion}>{suggestion}</button>)}
        </div>

        <div className="composer" aria-label="Atlas message composer">
          <input placeholder="Ask Atlas about training, meals, or recovery" />
          <button aria-label="Send message"><Send size={18} /></button>
        </div>
      </div>
    </section>
  );
}
