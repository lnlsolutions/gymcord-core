import type { Page } from "../../types/gymcord";

const nav: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "train", label: "Train", icon: "🏋️" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "progress", label: "Progress", icon: "📅" },
  { id: "coach", label: "Coach", icon: "🤖" },
];

export function BottomNav({
  page,
  setPage,
}: {
  page: Page;
  setPage: (page: Page) => void;
}) {
  return (
    <nav className="bottom-nav">
      {nav.map((item) => (
        <button
          key={item.id}
          className={page === item.id ? "active" : ""}
          onClick={() => setPage(item.id)}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}
