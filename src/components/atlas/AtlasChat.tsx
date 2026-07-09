import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import type { AtlasContext, AtlasConversationEntry } from "../../types/gymcord";
import { answerAtlasQuestion, createConversationEntry } from "../../lib/engines/conversationEngine";
import { AtlasMessage } from "./AtlasMessage";
import { AtlasPromptCards } from "./AtlasPromptCards";

export function AtlasChat({ atlasContext, conversation, prompts, onRememberConversation }: { atlasContext: AtlasContext; conversation: AtlasConversationEntry[]; prompts: { title: string; prompt: string }[]; onRememberConversation: (entry: AtlasConversationEntry) => void }) {
  const [question, setQuestion] = useState("");

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
    <section className="panel atlas-chat-shell">
      <div className="message-row assistant"><div className="message-bubble">{atlasContext.coachingMessages.join(" ") || atlasContext.biggestOpportunity}</div></div>
      <AtlasPromptCards prompts={prompts} onSelect={submit} />
      <div className="atlas-history" aria-label="Atlas conversation history">
        {conversation.slice(0, 8).map((entry) => <AtlasMessage key={entry.id} entry={entry} />)}
        {!conversation.length && <p className="empty-state">No conversation history yet. Ask Atlas for a workout, nutrition idea, or habit nudge.</p>}
      </div>
      <form className="composer" aria-label="Atlas message composer" onSubmit={handleSubmit}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask Atlas about training, meals, recovery, or progress" />
        <button aria-label="Send message"><Send size={18} /></button>
      </form>
    </section>
  );
}
