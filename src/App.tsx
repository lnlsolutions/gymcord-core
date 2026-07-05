import { useEffect, useState } from "react";

type Page = "home" | "workouts" | "progress" | "nutrition" | "community";

const workouts = [
  {
    day: "Day 1",
    title: "Heavy Glute Strength",
    focus: "Hip thrusts, split squats, RDLs",
    exercises: ["DB Hip Thrust 5x8", "Bulgarian Split Squat 4x10", "RDL 4x10", "Step-Ups 3x12", "Bridge Hold 3x60s"],
  },
  {
    day: "Day 2",
    title: "Glutes & Hamstrings",
    focus: "Stretch, hinge, single-leg control",
    exercises: ["Single-Leg RDL 4x10", "Sumo Squat 4x12", "Single-Leg Hip Thrust 3x12", "Frog Pumps 3x30", "Wall Sit 3x60s"],
  },
  {
    day: "Day 3",
    title: "Glute Pump",
    focus: "Volume and constant tension",
    exercises: ["Hip Thrust 4x15", "Walking Lunges 3x20", "Goblet Squat 3x15", "Glute Bridge 3x20", "Bridge Pulses 3x40"],
  },
  {
    day: "Day 4",
    title: "Isolation Burnout",
    focus: "Shape, symmetry, high-rep burn",
    exercises: ["B-Stance Hip Thrust 4x12", "Curtsy Lunges 3x15", "Donkey Kicks 3x20", "Fire Hydrants 3x20", "Frog Pumps 100 reps"],
  },
];

const nav: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "workouts", label: "Workouts", icon: "🏋️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "nutrition", label: "Nutrition", icon: "🍗" },
  { id: "community", label: "Social", icon: "💬" },
];

function saved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [checks, setChecks] = useState<Record<string, boolean>>(() => saved("gc.checks", {}));
  const [water, setWater] = useState(() => saved("gc.water", 4));
  const [protein, setProtein] = useState(() => saved("gc.protein", 80));
  const [measurements, setMeasurements] = useState(() => saved("gc.measurements", { waist: "", hips: "", glutes: "", weight: "" }));

  useEffect(() => localStorage.setItem("gc.checks", JSON.stringify(checks)), [checks]);
  useEffect(() => localStorage.setItem("gc.water", JSON.stringify(water)), [water]);
  useEffect(() => localStorage.setItem("gc.protein", JSON.stringify(protein)), [protein]);
  useEffect(() => localStorage.setItem("gc.measurements", JSON.stringify(measurements)), [measurements]);

  const total = workouts.flatMap((w) => w.exercises).length;
  const done = Object.values(checks).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);

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

        {page === "home" && <Home percent={percent} water={water} protein={protein} />}
        {page === "workouts" && <Workouts checks={checks} setChecks={setChecks} />}
        {page === "progress" && <Progress measurements={measurements} setMeasurements={setMeasurements} percent={percent} />}
        {page === "nutrition" && <Nutrition water={water} setWater={setWater} protein={protein} setProtein={setProtein} />}
        {page === "community" && <Community />}
      </main>

      <nav className="bottom-nav">
        {nav.map((item) => (
          <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Home({ percent, water, protein }: { percent: number; water: number; protein: number }) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">4-Day Glute Build</p>
        <h2>Build. Grow. Strengthen.</h2>
        <p>Premium workout tracking for glute growth, progress, nutrition, and future GymCord white-label gym apps.</p>
        <button>Start Today’s Workout</button>
      </div>

      <div className="grid">
        <Card label="Streak" value="14 days" />
        <Card label="Progress" value={`${percent}%`} />
        <Card label="Water" value={`${water} / 8`} />
        <Card label="Protein" value={`${protein}g`} />
      </div>

      <div className="panel">
        <h3>Today’s Workout</h3>
        <p>Day 1 — Heavy Glute Strength</p>
        <span>Hip thrusts · RDLs · Split squats</span>
      </div>
    </section>
  );
}

function Workouts({ checks, setChecks }: any) {
  return (
    <section className="page">
      {workouts.map((workout) => (
        <div className="panel" key={workout.day}>
          <p className="pill">{workout.day}</p>
          <h3>{workout.title}</h3>
          <span>{workout.focus}</span>
          <div className="exercise-list">
            {workout.exercises.map((ex) => {
              const key = `${workout.day}-${ex}`;
              return (
                <label className="exercise-row" key={key}>
                  <input type="checkbox" checked={!!checks[key]} onChange={() => setChecks({ ...checks, [key]: !checks[key] })} />
                  <span>{ex}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Progress({ measurements, setMeasurements, percent }: any) {
  return (
    <section className="page">
      <div className="panel center">
        <div className="big-emoji">📈</div>
        <h2>{percent}% Complete</h2>
        <p>Your workout completion is saved on this device.</p>
      </div>

      <div className="panel">
        <h3>Measurements</h3>
        {["waist", "hips", "glutes", "weight"].map((field) => (
          <input
            key={field}
            className="input"
            placeholder={field}
            value={measurements[field]}
            onChange={(e) => setMeasurements({ ...measurements, [field]: e.target.value })}
          />
        ))}
      </div>
    </section>
  );
}

function Nutrition({ water, setWater, protein, setProtein }: any) {
  return (
    <section className="page">
      <div className="panel">
        <h3>Water Tracker</h3>
        <div className="counter">
          <button onClick={() => setWater(Math.max(0, water - 1))}>−</button>
          <strong>{water} / 8</strong>
          <button onClick={() => setWater(water + 1)}>+</button>
        </div>
      </div>

      <div className="panel">
        <h3>Protein Tracker</h3>
        <div className="counter">
          <button onClick={() => setProtein(Math.max(0, protein - 10))}>−</button>
          <strong>{protein}g</strong>
          <button onClick={() => setProtein(protein + 10)}>+</button>
        </div>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section className="page">
      <div className="panel center">
        <div className="big-emoji">💬</div>
        <h2>Community</h2>
        <p>Coming next: member feed, trainer posts, gym announcements, and transformation wins.</p>
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
