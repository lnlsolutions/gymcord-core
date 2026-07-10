import { FormEvent, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import type { AtlasContext, AtlasConversationEntry, AtlasMemory, Profile } from "../../types/gymcord";
import { answerAtlasQuestion, createMockAtlasConversationEntry } from "../../lib/engines/conversationEngine";
import { atlasCoachRepository } from "../../repositories/AtlasCoachRepository";

interface AtlasConversationProps {
  profile: Profile;
  atlasContext: AtlasContext;
  conversation: AtlasConversationEntry[];
  atlasMemory: AtlasMemory;
  onRememberConversation: (entry: AtlasConversationEntry) => void;
}

function buildPromptSuggestions(profile: Profile, atlasContext: AtlasContext) {
  return [
    `Plan my next workout for ${profile.goal || "my goal"}`,
    atlasContext.biggestOpportunity,
    atlasContext.recoveryStatus.includes("Limited") ? "Help me improve recovery tonight" : "What should I optimize next?",
  ];
}

export function AtlasConversation({ profile, atlasContext, conversation, atlasMemory, onRememberConversation }: AtlasConversationProps) {
  const [question, setQuestion] = useState("");
  const suggestions = buildPromptSuggestions(profile, atlasContext);
  const latestConversation = conversation.slice(0, 3);

  function submit(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    const answer = answerAtlasQuestion(trimmed, atlasContext.coachingMessages);
    onRememberConversation(createMockAtlasConversationEntry({ question: trimmed, answer, memory: atlasMemory, provider: atlasCoachRepository.providerName, userGoal: profile.goal }));
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
        <p className="pill"><Sparkles size={14} /> Atlas Coach</p>
        <h2>{atlasContext.greeting}</h2>
        <p>{atlasContext.coachingMessages[0] || `I’m here to help with training, meals, sleep, and recovery today.`}</p>
      </div>

      <div className="panel conversation-shell">
        <div className="message-row assistant">
          <div className="message-bubble">
            {atlasContext.coachingMessages.join(" ") || atlasContext.biggestOpportunity}
          </div>
        </div>

        {latestConversation.map((entry) => (
          <div className="conversation-memory" key={entry.id}>
            <strong>{new Date(entry.timestamp).toLocaleString()}</strong>
            <p>{entry.question}</p>
            <span>{entry.answer}</span>
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
