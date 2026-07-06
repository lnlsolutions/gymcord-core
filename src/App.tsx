import { useEffect, useMemo, useState } from "react";

type Page = "home" | "train" | "meals" | "progress" | "coach";
type WorkoutDay = "Day 1" | "Day 2" | "Day 3" | "Day 4";

const workouts = [
  {
    day: "Day 1" as WorkoutDay,
    title: "Heavy Glute Strength",
    focus: "Strength + progressive overload",
    exercises: [
      "DB Hip Thrust 5x8",
      "Bulgarian Split Squat 4x10",
      "RDL 4x10",
      "Step-Ups 3x12",
      "Bridge Hold 3x60s",
    ],
  },
  {
    day: "Day 2" as WorkoutDay,
    title: "Glutes & Hamstrings",
    focus: "Stretch + hinge control",
    exercises: [
      "Single-Leg RDL 4x10",
      "Sumo Squat 4x12",
      "Single-Leg Hip Thrust 3x12",
      "Frog Pumps 3x30",
      "Wall Sit 3x60s",
    ],
  },
  {
    day: "Day 3" as WorkoutDay,
    title: "Glute Pump",
    focus: "Volume + constant tension",
    exercises: [
      "Hip Thrust 4x15",
      "Walking Lunges 3x20",
      "Goblet Squat 3x15",
      "Glute Bridge 3x20",
      "Bridge Pulses 3x40",
    ],
  },
  {
    day: "Day 4" as WorkoutDay,
    title: "Isolation Burnout",
    focus: "Shape + symmetry",
    exercises: [
      "B-Stance Hip Thrust 4x12",
      "Curtsy Lunges 3x15",
      "Donkey Kicks 3x20",
      "Fire Hydrants 3x20",
      "Frog Pumps 100 reps",
    ],
  },
];

const nav: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "train", label: "Train", icon: "🏋️" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "progress", label: "Progress", icon: "📸" },
  { id: "coach", label: "Coach", icon: "🤖" },
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
  const [profile, setProfile] = useState(() =>
    saved("gc.profile", { name: "", goal: "", startDate: new Date().toISOString().slice(0, 10) })
  );
  const [checks, setChecks] = useState<Record<string, boolean>>(() => saved("gc.checks", {}));
  const [weights, setWeights] = useState<Record<string, string>>(() => saved("gc.weights", {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => saved("gc.notes", {}));
  const [meals, setMeals] = useState(() =>
    saved("gc.meals", { breakfast: "", lunch: "", dinner: "", snacks: "", protein: 0, water: 4, calories: "" })
  );
  const [measurements, setMeasurements] = useState(() =>
    saved("gc.measurements", { waist: "", hips: "", glutes: "", weight: "" })
  );
  const [photos, setPhotos] = useState(() => saved("gc.photos", { before: "", after: "" }));
  const [activeDay, setActiveDay] = useState<WorkoutDay>("Day 1");
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => localStorage.setItem("gc.profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("gc.checks", JSON.stringify(checks)), [checks]);
  useEffect(() => localStorage.setItem("gc.weights", JSON.stringify(weights)), [weights]);
  useEffect(() => localStorage.setItem("gc.notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem("gc.meals", JSON.stringify(meals)), [meals]);
  useEffect(() => localStorage.setItem("gc.measurements", JSON.stringify(measurements)), [measurements]);
  useEffect(() => localStorage.setItem("gc.photos", JSON.stringify(photos)), [photos]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setRunning(false);
          return 90;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  const total = workouts.flatMap((w) => w.exercises).length;
  const complete = Object.values(checks).filter(Boolean).length;
  const workoutPct = Math.round((complete / total) * 100);

  const transformationScore = useMemo(() => {
    let score = 0;
    score += Math.min(40, workoutPct * 0.4);
    score += Math.min(20, Number(meals.protein) / 6.5);
    score += Math.min(15, Number(meals.water) * 2);
    score += photos.before ? 10 : 0;
    score += photos.after ? 10 : 0;
    score += measurements.weight || measurements.glutes ? 5 : 0;
    return Math.min(100, Math.round(score));
  }, [workoutPct, meals, photos, measurements]);

  const rewardEligible = transformationScore >= 85;
  const memberName = profile.name || "Beta Tester";

  if (!profile.name || !profile.goal) {
    return <Onboarding profile={profile} setProfile={setProfile} />;
  }

  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">GymCord 2.0 Beta</p>
            <h1>{memberName}</h1>
          </div>
          <div className="avatar">GC</div>
        </header>

        {page === "home" && (
          <Home
            profile={profile}
            workoutPct={workoutPct}
            meals={meals}
            score={transformationScore}
            rewardEligible={rewardEligible}
            setPage={setPage}
          />
        )}

        {page === "train" && (
          <Train
            checks={checks}
            setChecks={setChecks}
            weights={weights}
            setWeights={setWeights}
            notes={notes}
            setNotes={setNotes}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            timer={timer}
            setTimer={setTimer}
            running={running}
            setRunning={setRunning}
          />
        )}

        {page === "meals" && <Meals meals={meals} setMeals={setMeals} />}

        {page === "progress" && (
          <Progress
            measurements={measurements}
            setMeasurements={setMeasurements}
            photos={photos}
            setPhotos={setPhotos}
          />
        )}

        {page === "coach" && (
          <Coach
            score={transformationScore}
            rewardEligible={rewardEligible}
            workoutPct={workoutPct}
            meals={meals}
            profile={profile}
            setProfile={setProfile}
            setChecks={setChecks}
            setWeights={setWeights}
            setNotes={setNotes}
            setMeals={setMeals}
            setMeasurements={setMeasurements}
            setPhotos={setPhotos}
          />
        )}
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

function Onboarding({ profile, setProfile }: any) {
  return (
    <div className="app">
      <main className="screen">
        <section className="page">
          <div className="hero-card">
            <p className="pill">Welcome to GymCord</p>
            <h2>Your 7-day beta starts now.</h2>
            <p>Set your name and physical goal. Your app will track workouts, meals, progress photos, and transformation score.</p>
          </div>

          <div className="panel">
            <h3>Create Profile</h3>
            <input
              className="input"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Main goal: grow glutes, lose fat, tone, strength..."
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Home({ profile, workoutPct, meals, score, rewardEligible, setPage }: any) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">Today’s Plan</p>
        <h2>{profile.goal}</h2>
        <p>Complete today’s workout, hit protein, drink water, and update your progress to raise your transformation score.</p>
        <button onClick={() => setPage("train")}>Start Workout</button>
      </div>

      <div className="grid">
        <Card label="Workouts" value={`${workoutPct}%`} />
        <Card label="Protein" value={`${meals.protein}g`} />
        <Card label="Water" value={`${meals.water} / 8`} />
        <Card label="Score" value={`${score}%`} />
      </div>

      <div className={rewardEligible ? "panel reward-ready" : "panel"}>
        <h3>{rewardEligible ? "Reward Eligible 🎁" : "Reward Progress"}</h3>
        <p>{rewardEligible ? "You reached the beta reward threshold." : "Reach 85% transformation score to unlock reward eligibility."}</p>
        <span>Rewards may include: free month, Starbucks, Amazon gift card, prepaid debit, or gym perks.</span>
      </div>

      <div className="panel">
        <h3>Daily Checklist</h3>
        <p>✅ Complete workout or active recovery</p>
        <p>✅ Log meals, protein, and water</p>
        <p>✅ Add notes and weights used</p>
        <p>✅ Update photos/measurements weekly</p>
      </div>
    </section>
  );
}

function Train({
  checks,
  setChecks,
  weights,
  setWeights,
  notes,
  setNotes,
  activeDay,
  setActiveDay,
  timer,
  setTimer,
  running,
  setRunning,
}: any) {
  const workout = workouts.find((w) => w.day === activeDay)!;

  return (
    <section className="page">
      <div className="day-tabs">
        {workouts.map((w) => (
          <button key={w.day} className={activeDay === w.day ? "active" : ""} onClick={() => setActiveDay(w.day)}>
            {w.day}
          </button>
        ))}
      </div>

      <div className="panel">
        <p className="pill">{workout.day}</p>
        <h3>{workout.title}</h3>
        <span>{workout.focus}</span>

        <div className="timer-box">
          <strong>{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</strong>
          <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start Rest"}</button>
          <button onClick={() => { setTimer(90); setRunning(false); }}>Reset</button>
        </div>

        <div className="exercise-list">
          {workout.exercises.map((ex) => {
            const key = `${workout.day}-${ex}`;
            return (
              <div className="exercise-card" key={key}>
                <label className="exercise-row">
                  <input type="checkbox" checked={!!checks[key]} onChange={() => setChecks({ ...checks, [key]: !checks[key] })} />
                  <span>{ex}</span>
                </label>
                <input
                  className="input"
                  placeholder="Weight used / reps / notes"
                  value={weights[key] || ""}
                  onChange={(e) => setWeights({ ...weights, [key]: e.target.value })}
                />
              </div>
            );
          })}
        </div>

        <textarea
          className="textarea"
          placeholder="Workout notes: soreness, energy, form cues, wins..."
          value={notes[workout.day] || ""}
          onChange={(e) => setNotes({ ...notes, [workout.day]: e.target.value })}
        />
      </div>
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
        <input
          className="input"
          placeholder="Calories"
          value={meals.calories}
          onChange={(e) => setMeals({ ...meals, calories: e.target.value })}
        />
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

      <div className="photo-grid">
        <div className="panel">
          <h3>Before</h3>
          {photos.before && <img className="progress-photo" src={photos.before} alt="Before" />}
          <input className="file" type="file" accept="image/*" onChange={(e) => uploadPhoto("before", e.target.files?.[0])} />
        </div>

        <div className="panel">
          <h3>After</h3>
          {photos.after && <img className="progress-photo" src={photos.after} alt="After" />}
          <input className="file" type="file" accept="image/*" onChange={(e) => uploadPhoto("after", e.target.files?.[0])} />
        </div>
      </div>
    </section>
  );
}

function Coach({
  score,
  rewardEligible,
  workoutPct,
  meals,
  profile,
  setProfile,
  setChecks,
  setWeights,
  setNotes,
  setMeals,
  setMeasurements,
  setPhotos,
}: any) {
  const feedback =
    score >= 85
      ? "You are reward eligible. Keep consistency high and verify progress with updated photos."
      : workoutPct < 50
      ? "Your workout completion is the biggest opportunity. Finish more sessions this week."
      : meals.protein < 100
      ? "Protein is limiting your score. Increase your daily target closer to 100–130g."
      : meals.water < 6
      ? "Hydration needs improvement. Aim for at least 6–8 glasses daily."
      : "You are close. Add progress photos and measurements to improve verification.";

  function resetAll() {
    if (!confirm("Reset all GymCord beta data?")) return;
    localStorage.clear();
    setProfile({ name: "", goal: "", startDate: new Date().toISOString().slice(0, 10) });
    setChecks({});
    setWeights({});
    setNotes({});
    setMeals({ breakfast: "", lunch: "", dinner: "", snacks: "", protein: 0, water: 4, calories: "" });
    setMeasurements({ waist: "", hips: "", glutes: "", weight: "" });
    setPhotos({ before: "", after: "" });
  }

  return (
    <section className="page">
      <div className={rewardEligible ? "panel center reward-ready" : "panel center"}>
        <div className="big-emoji">🤖</div>
        <h2>{score}% Score</h2>
        <p>{rewardEligible ? "Reward eligible" : "Keep building toward reward eligibility"}</p>
      </div>

      <div className="panel">
        <h3>AI Coach Feedback</h3>
        <p>{feedback}</p>
        <span>Goal: {profile.goal}</span>
      </div>

      <div className="panel">
        <h3>Reward Rules</h3>
        <p>85%+ transformation score unlocks eligibility.</p>
        <span>Score includes workouts, meals, protein, water, measurements, and photos.</span>
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
