import type { AppMode } from "../../repositories/AppShellRepository";
const modes: AppMode[] = ["consumer", "trainer", "gym", "admin"];
export function RoleModeSwitcher({ mode, onModeChange }: { mode: AppMode; onModeChange: (mode: AppMode) => void }) {
  return <div className="role-switcher">{modes.map((item) => <button key={item} className={item === mode ? "active" : ""} onClick={() => onModeChange(item)}>{item}</button>)}</div>;
}
