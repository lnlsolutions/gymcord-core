import { Bot, ChevronRight } from "lucide-react";
import type { AtlasInsight } from "../../types/gymcord";
export function AtlasCard({ insights, onOpen }: { insights: AtlasInsight[]; onOpen?: () => void }) { return <button className="atlas-entry-card" onClick={onOpen}><div className="atlas-orb"><Bot size={24} /></div><div><p className="eyebrow">Atlas greeting</p><h3>{insights[0]?.message || "Ask Atlas what to do next."}</h3><span>{insights[1]?.message || "Your dashboard is synced from the repository layer."}</span></div><ChevronRight size={22} /></button>; }
