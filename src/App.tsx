import { useEffect, useMemo, useState } from "react";
import { workouts, mealSuggestions } from "./lib/program";
import { WorkoutDayCard } from "./components/WorkoutDayCard";

type Page = "home" | "train" | "meals" | "progress" | "coach";

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
    saved("gc.profile", {
      name: "",
      goal: "",
      startDate: new Date().toISOString().slice(0, 10),
    })
  );

  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => saved("gc.checks", {}));
  const [weights, setWeights] = useState<Record<string, string>>(() => saved("gc.weights", {}));
  const [notes, setNotes] = useState<Record<string, string>>(() => saved("gc.notes", {}));

  const [meals, setMeals] = useState(() =>
    saved("gc.meals", {
      photo: "",
      ingredients: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      snacks: "",
      protein: 0,
      calories: "",
      water: 4,
    })
  );

  const [measurements, setMeasurements] = useState(() =>
    saved("gc.measurements", {
      waist: "",
      hips: "",
      glutes: "",
      weight: "",
    })
  );

  const [photos, setPhotos] = useState(() =>
    saved("gc.photos", {
      before: "",
      after: "",
      side: "",
    })
  );

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

  const score = useMemo(() => {
    let totalScore = 0;
    totalScore += Math.min(40, workoutPct * 0.4);
    totalScore += Math.min(20, Number(meals.protein) / 6.5);
    totalScore += Math.min(15, Number(meals.water) * 2);
    totalScore += photos.before ? 8 : 0;
    totalScore += photos.after ? 8 : 0;
    totalScore += photos.side ? 4 : 0;
    totalScore += measurements.weight || measurements.glutes ? 5 : 0;
    return Math.min(100, Math.round(totalScore));
  }, [workoutPct, meals, photos, measurements]);

  if (!profile.name || !profile.goal) {
    return <Onboarding profile={profile} setProfile={setProfile} />;
  }

  return (
    <div className="app">
      <main className="screen">
        <header className="topbar">
          <div>
            <p className="eyebrow">GymCord Beta</p>
            <h1>{profile.name}</h1>
          </div>
          <div className="avatar">GC</div>
        </header>

        {page === "home" && (
          <Home
            profile={profile}
            workoutPct={workoutPct}
            meals={meals}
            score={score}
            setPage={setPage}
          />
        )}

        {page === "train" && (
          <Train
            activeWorkout={activeWorkout}
            setActiveWorkout={setActiveWorkout}
            checks={checks}
            setChecks={setChecks}
            weights={weights}
            setWeights={setWeights}
            notes={notes}
            setNotes={setNotes}
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
            score={score}
            workoutPct={workoutPct}
            meals={meals}
            photos={photos}
            measurements={measurements}
            profile={profile}
          />
        )}
      </main>

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
    </div>
  );
}

function Onboarding({ profile, setProfile }: any) {
  return (
    <div className="app">
      <main className="screen">
        <section className="page">
          <div className="hero-card">
            <p className="pill">GymCord Beta</p>
            <h2>Start your 7-day transformation.</h2>
            <p>Track workouts, meals, photos, measurements, and get a transformation score.</p>
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
              placeholder="Main goal"
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Home({ profile, workoutPct, meals, score, setPage }: any) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">Today’s Focus</p>
        <h2>{profile.goal}</h2>
        <p>Train hard, log your meals, upload progress, and let GymCord score your consistency.</p>
        <button onClick={() => setPage("train")}>Start Training</button>
      </div>

      <div className="grid">
        <Card label="Workout" value={`${workoutPct}%`} />
        <Card label="Protein" value={`${meals.protein}g`} />
        <Card label="Water" value={`${meals.water} / 8`} />
        <Card label="Score" value={`${score}%`} />
      </div>

      <div className="panel">
        <h3>Today’s Checklist</h3>
        <p>✅ Complete workout</p>
        <p>✅ Upload meal photo</p>
        <p>✅ Edit ingredients/macros</p>
        <p>✅ Hit water + protein target</p>
      </div>
    </section>
  );
}

function Train({
  activeWorkout,
  setActiveWorkout,
  checks,
  setChecks,
  weights,
  setWeights,
  notes,
  setNotes,
  timer,
  setTimer,
  running,
  setRunning,
}: any) {
  if (activeWorkout) {
    return (
      <section className="page">
        <button className="back-btn" onClick={() => setActiveWorkout(null)}>
          ← Back to Workouts
        </button>

        <div className="panel">
          <p className="pill">{activeWorkout.day}</p>
          <h3>{activeWorkout.title}</h3>
          <span>{activeWorkout.focus}</span>

          <div className="timer-box">
            <strong>
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </strong>
            <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start Rest"}</button>
            <button
              onClick={() => {
                setTimer(90);
                setRunning(false);
              }}
            >
              Reset
            </button>
          </div>

          <div className="exercise-list">
            {activeWorkout.exercises.map((ex: string) => {
              const key = `${activeWorkout.day}-${ex}`;
              return (
                <div className="exercise-card" key={key}>
                  <label className="exercise-row">
                    <input
                      type="checkbox"
                      checked={!!checks[key]}
                      onChange={() => setChecks({ ...checks, [key]: !checks[key] })}
                    />
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
            placeholder="Workout notes..."
            value={notes[activeWorkout.day] || ""}
            onChange={(e) => setNotes({ ...notes, [activeWorkout.day]: e.target.value })}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      {workouts.map((workout) => (
        <WorkoutDayCard key={workout.day} workout={workout} onStart={() => setActiveWorkout(workout)} />
      ))}
    </section>
  );
}

function Meals({ meals, setMeals }: any) {
  const uploadMeal = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMeals({ ...meals, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <section className="page">
      <div className="panel">
        <h3>Meal Photo</h3>
        <p>Upload a meal photo. For now, edit ingredients manually. AI breakdown comes next.</p>
        {meals.photo && <img className="progress-photo" src={meals.photo} alt="Meal" />}
        <input className="file" type="file" accept="image/*" onChange={(e) => uploadMeal(e.target.files?.[0])} />
      </div>

      <div className="panel">
        <h3>Editable Breakdown</h3>
        <textarea
          className="textarea tall"
          placeholder="Ingredients + amounts. Example: 2 eggs, 1 cup rice, 6 oz chicken..."
          value={meals.ingredients}
          onChange={(e) => setMeals({ ...meals, ingredients: e.target.value })}
        />
        <input
          className="input"
          placeholder="Calories"
          value={meals.calories}
          onChange={(e) => setMeals({ ...meals, calories: e.target.value })}
        />
      </div>

      <div className="grid">
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
            <strong>{meals.water}</strong>
            <button onClick={() => setMeals({ ...meals, water: meals.water + 1 })}>+</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Meal Suggestions</h3>
        {mealSuggestions.map((meal) => (
          <div className="meal-suggestion" key={meal.title}>
            <strong>{meal.title}</strong>
            <p>{meal.meal}</p>
            <span>{meal.protein} protein · {meal.calories} calories</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Progress({ measurements, setMeasurements, photos, setPhotos }: any) {
  const uploadPhoto = (type: "before" | "after" | "side", file?: File) => {
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

      {["before", "side", "after"].map((type) => (
        <div className="panel" key={type}>
          <h3>{type} Photo</h3>
          {photos[type] && <img className="progress-photo" src={photos[type]} alt={type} />}
          <input
            className="file"
            type="file"
            accept="image/*"
            onChange={(e) => uploadPhoto(type as any, e.target.files?.[0])}
          />
        </div>
      ))}
    </section>
  );
}

function Coach({ score, workoutPct, meals, photos, measurements, profile }: any) {
  const feedback =
    score >= 85
      ? "You are reward eligible. Keep consistency high and verify progress with updated photos."
      : workoutPct < 50
      ? "Finish more workouts. Training consistency is your biggest gap."
      : meals.protein < 100
      ? "Increase protein closer to 100–130g per day."
      : !photos.before
      ? "Upload your before photo to improve progress verification."
      : !measurements.weight
      ? "Add measurements so the coach can better track progress."
      : "You are close. Keep logging meals and training consistently.";

  return (
    <section className="page">
      <div className={score >= 85 ? "panel center reward-ready" : "panel center"}>
        <div className="big-emoji">🤖</div>
        <h2>{score}% Score</h2>
        <p>{score >= 85 ? "Reward eligible" : "Keep building"}</p>
      </div>

      <div className="panel">
        <h3>Coach Feedback</h3>
        <p>{feedback}</p>
        <span>Goal: {profile.goal}</span>
      </div>

      <div className="panel">
        <h3>Reward Rules</h3>
        <p>85%+ score unlocks eligibility.</p>
        <span>Score includes workouts, meals, protein, water, photos, and measurements.</span>
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
