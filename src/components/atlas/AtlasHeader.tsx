import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import type { AtlasContext, Profile } from "../../types/gymcord";

export function AtlasHeader({ profile, atlasContext }: { profile: Profile; atlasContext: AtlasContext }) {
  return (
    <header className="atlas-coach-header panel">
      <div className="atlas-orb"><Bot size={30} /></div>
      <p className="pill"><Sparkles size={14} /> Atlas Coach V1</p>
      <h2>{atlasContext.greeting}</h2>
      <p>{atlasContext.coachingMessages[0] || `I’m using your repository-backed history to coach ${profile.goal || "today's plan"}.`}</p>
      <div className="atlas-disclaimer"><ShieldCheck size={16} /> Atlas provides fitness and nutrition education only, not medical advice. Talk with a qualified clinician for pain, injury, conditions, or treatment decisions.</div>
    </header>
  );
}
