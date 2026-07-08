import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import type { AtlasContext, AtlasConversationEntry, Profile } from "../../types/gymcord";
import { answerAtlasQuestion, createConversationEntry } from "../../lib/engines/conversationEngine";

interface AtlasConversationProps {
  profile: Profile;
  atlasContext: AtlasContext;
  conversation: AtlasConversationEntry[];
  onRememberConversation: (entry: AtlasConversationEntry) => void;
}

function buildPromptSuggestions(profile: Profile, atlasContext: AtlasContext) {
  return [
    `Plan my next workout for ${profile.goal || "my goal"}`,
    atlasContext.biggestOpportunity,
    atlasContext.recoveryStatus.includes("Limited") ? "Help me improve recovery tonight" : "What should I optimize next?",
  ];
}

export function AtlasConversation({ profile, atlasContext, conversation, onRememberConversation }: AtlasConversationProps) {
  const [question, setQuestion] = useState("");
  const suggestions = buildPromptSuggestions(profile, atlasContext);
  const latestConversation = conversation.slice(0, 3);

  function submit(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    const answer = answerAtlasQuestion(trimmed, atlasContext.coachingMessages);
    onRememberConversation(createConversationEntry(trimmed, answer));
    setQuestion("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  return (
    <section className="page atlas-page">
      <div className="atlas-hero panel">
        <div className="atlas-orb"><Bot size={30} /></div>
        <p className="pill"><Sparkles size={14} /> Atlas Memory V1</p>
        <h2>{atlasContext.greeting}</h2>
        <p>{atlasContext.coachingMessages[0] || `I’m tracking ${profile.goal || "your mission"} and will coach from your stored training, nutrition, sleep, and recovery patterns.`}</p>
      </div>

      <div className="panel conversation-shell">
        <div className="message-row assistant">
          <div className="message-bubble">
            {atlasContext.coachingMessages.join(" ") || atlasContext.biggestOpportunity}
          </div>
        </div>

        {latestConversation.map((entry) => (
          <div className="conversation-memory" key={entry.id}>
            <strong>{entry.category} · {new Date(entry.timestamp).toLocaleString()}</strong>
            <p>Q: {entry.question}</p>
            <span>A: {entry.answer}</span>
          </div>
        ))}

        <div className="suggestion-grid">
          {suggestions.map((suggestion) => <button key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>)}
        </div>

        <form className="composer" aria-label="Atlas message composer" onSubmit={handleSubmit}>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask Atlas about training, meals, or recovery" />
          <button aria-label="Send message"><Send size={18} /></button>
        </form>
      </div>
    </section>
  );
}
