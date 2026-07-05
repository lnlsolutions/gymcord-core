import { useState } from "react";

type Page = "home" | "workouts" | "progress" | "nutrition" | "community";

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "workouts", label: "Workouts", icon: "🏋️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "nutrition", label: "Nutrition", icon: "🍗" },
  { id: "community", label: "Community", icon: "💬" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">GymCord Core</p>
            <h1>Booty Builder</h1>
          </div>
          <div className="avatar">GC</div>
        </header>

        {page === "home" && <Home />}
        {page === "workouts" && <Placeholder title="Workouts" emoji="🏋️" />}
        {page === "progress" && <Placeholder title="Progress" emoji="📈" />}
        {page === "nutrition" && <Placeholder title="Nutrition" emoji="🍗" />}
        {page === "community" && <Placeholder title="Community" emoji="💬" />}
      </main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
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
    </div>
  );
}

function Home() {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">4-Day Glute Build</p>
        <h2>Build. Grow. Strengthen.</h2>
        <p>Your premium workout app foundation starts here.</p>
        <button>Start Today’s Workout</button>
      </div>

      <div className="grid">
        <Card label="Streak" value="14 days" />
        <Card label="Weekly Progress" value="65%" />
        <Card label="Water" value="6 / 8" />
        <Card label="Protein" value="110g" />
      </div>

      <div className="panel">
        <h3>Today’s Workout</h3>
        <p>Day 1 — Heavy Glute Strength</p>
        <span>Hip thrusts · RDLs · Split squats</span>
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function Placeholder({ title, emoji }: { title: string; emoji: string }) {
  return (
    <section className="page">
      <div className="panel center">
        <div className="big-emoji">{emoji}</div>
        <h2>{title}</h2>
        <p>This section is ready for the next build phase.</p>
      </div>
    </section>
  );
}
