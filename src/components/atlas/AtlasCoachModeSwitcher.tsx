import type { AtlasCoachMode } from "../../repositories/AtlasRepository";
const modes: AtlasCoachMode[] = ["consumer", "trainer-assisted", "gym-member", "admin-debug"];
export function AtlasCoachModeSwitcher({ mode, onChange }: { mode: AtlasCoachMode; onChange: (mode: AtlasCoachMode) => void }) { return <section className="panel"><h3>Coach mode</h3><div className="filter-row">{modes.map((item) => <button key={item} className={item === mode ? "primary" : "secondary"} onClick={() => onChange(item)}>{item}</button>)}</div></section>; }
