import type { Page } from "../../types/gymcord";

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "workouts", label: "Workouts", icon: "◇" },
  { id: "journal", label: "Journal", icon: "◷" },
  { id: "atlas", label: "Atlas", icon: "✦" },
  { id: "menu", label: "Menu", icon: "☰" },
];

export function BottomNav({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => (
        <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}>
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
