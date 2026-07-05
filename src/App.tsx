import { useEffect, useState } from "react";

type Page = "home" | "train" | "meals" | "progress" | "profile";

const workouts = [
  { day: "Day 1", title: "Heavy Glute Strength", exercises: ["DB Hip Thrust 5x8", "Bulgarian Split Squat 4x10", "RDL 4x10", "Step-Ups 3x12", "Bridge Hold 3x60s"] },
  { day: "Day 2", title: "Glutes & Hamstrings", exercises: ["Single-Leg RDL 4x10", "Sumo Squat 4x12", "Single-Leg Hip Thrust 3x12", "Frog Pumps 3x30", "Wall Sit 3x60s"] },
  { day: "Day 3", title: "Glute Pump", exercises: ["Hip Thrust 4x15", "Walking Lunges 3x20", "Goblet Squat 3x15", "Glute Bridge 3x20", "Bridge Pulses 3x40"] },
  { day: "Day 4", title: "Isolation Burnout", exercises: ["B-Stance Hip Thrust 4x12", "Curtsy Lunges 3x15", "Donkey Kicks 3x20", "Fire Hydrants 3x20", "Frog Pumps 100 reps"] },
];

const nav: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "train", label: "Train", icon: "🏋️" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "progress", label: "Progress", icon: "📸" },
  { id: "profile", label: "Profile", icon: "👤" },
];

function saved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [checks, setChecks] = useState<Record<string, boolean>>(() => saved("bb.checks", {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => saved("bb.notes", {}));
  const [meals, setMeals] = useState(() => saved("bb.meals", { breakfast: "", lunch: "", dinner: "", snacks: "", protein: 0, water: 4 }));
  const [measurements, setMeasurements] = useState(() => saved("bb.measurements", { waist: "", hips: "", glutes: "", weight: "" }));
  const [photos, setPhotos] = useState(() => saved("bb.photos", { before: "", after: "" }));

  useEffect(() => localStorage.setItem("bb.checks", JSON.stringify(checks)), [checks]);
  useEffect(() => localStorage.setItem("bb.notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem("bb.meals", JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem("bb.measurements", JSON.stringify(measurements)), [measurements]);
  useEffect(() => localStorage.setItem("bb.photos", JSON.stringify(photos)), [photos]);

  const total = workouts.flatMap((w) => w.exercises).length;
  const complete = Object.values(checks).filter(Boolean).length;
  const percent = Math.round((complete / total) * 100);

  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">7-Day Beta Tracker</p>
            <h1>Booty Builder</h1>
          </div>
          <div className="avatar">BB</div>
        </header>

        {page === "home" && <Home percent={percent} meals={meals} setPage={setPage} />}
        {page === "train" && <Train checks={checks} setChecks={setChecks} notes={notes} setNotes={setNotes} />}
        {page === "meals" && <Meals meals={meals} setMeals={setMeals} />}
        {page === "progress" && <Progress measurements={measurements} setMeasurements={setMeasurements} photos={photos} setPhotos={setPhotos} />}
        {page === "profile" && <Profile setChecks={setChecks} setNotes={setNotes} setMeals={setMeals} setMeasurements={setMeasurements} setPhotos={setPhotos} />}
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

function Home({ percent, meals, setPage }: any) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">Week 1 Tracker</p>
        <h2>Track every day.</h2>
        <p>Log workouts, meals, protein, water, measurements, and before/after photos for your 7-day beta test.</p>
        <button onClick={() => setPage("train")}>Start Workout</button>
      </div>

      <div className="grid">
        <Card label="Workouts" value={`${percent}%`} />
        <Card label="Water" value={`${meals.water} / 8`} />
        <Card label="Protein" value={`${meals.protein}g`} />
        <Card label="Goal" value="7 days" />
      </div>

      <div className="panel">
        <h3>Today’s Checklist</h3>
        <p>✅ Complete workout or active recovery</p>
        <p>✅ Log meals and protein</p>
        <p>✅ Track water</p>
        <p>✅ Add notes if needed</p>
      </div>
    </section>
  );
}

function Train({ checks, setChecks, notes, setNotes }: any) {
  return (
    <section className="page">
      {workouts.map((workout) => (
        <div className="panel" key={workout.day}>
          <p className="pill">{workout.day}</p>
          <h3>{workout.title}</h3>

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

          <textarea
            className="textarea"
            placeholder="Workout notes: weight used, soreness, form cues..."
            value={notes[workout.day] || ""}
            onChange={(e) => setNotes({ ...notes, [workout.day]: e.target.value })}
          />
        </div>
      ))}
    </section>
  );
}

function Meals({ meals, setMeals }: any) {
  return (
    <section className="page">
      <div className="panel">
        <h3>Daily Meals</h3>
        {["breakfast", "lunch", "dinner", "snacks"].map((field) => (
          <textarea
            key={field}
            className="textarea"
            placeholder={field}
            value={meals[field]}
            onChange={(e) => setMeals({ ...meals, [field]: e.target.value })}
          />
        ))}
      </div>

      <div className="panel">
        <h3>Protein</h3>
        <div className="counter">
          <button onClick={() => setMeals({ ...meals, protein: Math.max(0, meals.protein - 10) })}>−</button>
          <strong>{meals.protein}g</strong>
          <button onClick={() => setMeals({ ...meals, protein: meals.protein + 10 })}>+</button>
        </div>
      </div>

      <div className="panel">
        <h3>Water</h3>
        <div className="counter">
          <button onClick={() => setMeals({ ...meals, water: Math.max(0, meals.water - 1) })}>−</button>
          <strong>{meals.water} / 8</strong>
          <button onClick={() => setMeals({ ...meals, water: meals.water + 1 })}>+</button>
        </div>
      </div>
    </section>
  );
}

function Progress({ measurements, setMeasurements, photos, setPhotos }: any) {
  const uploadPhoto = (type: "before" | "after", file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotos({ ...photos, [type]: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <section className="page">
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

      <div className="panel">
        <h3>Before Photo</h3>
        {photos.before && <img className="progress-photo" src={photos.before} alt="Before" />}
        <input className="file" type="file" accept="image/*" onChange={(e) => uploadPhoto("before", e.target.files?.[0])} />
      </div>

      <div className="panel">
        <h3>After Photo</h3>
        {photos.after && <img className="progress-photo" src={photos.after} alt="After" />}
        <input className="file" type="file" accept="image/*" onChange={(e) => uploadPhoto("after", e.target.files?.[0])} />
      </div>
    </section>
  );
}

function Profile({ setChecks, setNotes, setMeals, setMeasurements, setPhotos }: any) {
  function resetAll() {
    if (!confirm("Reset all beta tracking data?")) return;
    localStorage.clear();
    setChecks({});
    setNotes({});
    setMeals({ breakfast: "", lunch: "", dinner: "", snacks: "", protein: 0, water: 4 });
    setMeasurements({ waist: "", hips: "", glutes: "", weight: "" });
    setPhotos({ before: "", after: "" });
  }

  return (
    <section className="page">
      <div className="panel center">
        <div className="big-emoji">👤</div>
        <h2>Beta Tester</h2>
        <p>Use this for one full week. Data saves on this device.</p>
      </div>

      <div className="panel">
        <h3>Testing Instructions</h3>
        <p>1. Add before photo on Day 1.</p>
        <p>2. Track all workouts and meals daily.</p>
        <p>3. Add after photo at the end of the week.</p>
        <p>4. Review progress and notes.</p>
      </div>

      <button className="danger" onClick={resetAll}>Reset All Data</button>
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
