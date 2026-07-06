import { useEffect, useMemo, useState } from "react";
import { workouts, mealSuggestions } from "./lib/program";
import { WorkoutDayCard } from "./components/WorkoutDayCard";

type Page = "home" | "train" | "meals" | "progress" | "coach";

const nav: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "train", label: "Train", icon: "🏋️" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "progress", label: "Progress", icon: "📅" },
  { id: "coach", label: "Coach", icon: "🤖" },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyDay = {
  checks: {},
  weights: {},
  notes: {},
  mealPhoto: "",
  ingredients: "",
  calories: "",
  protein: 0,
  water: 4,
  measurements: { waist: "", hips: "", glutes: "", weight: "" },
  photos: { front: "", side: "", back: "" },
};

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
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [profile, setProfile] = useState(() =>
    saved("gc.profile", {
      name: "",
      goal: "",
      startDate: todayKey(),
    })
  );

  const [logs, setLogs] = useState<Record<string, any>>(() => saved("gc.dailyLogs", {}));
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);

  const dayLog = logs[selectedDate] || emptyDay;

  function updateDay(patch: any) {
    setLogs({
      ...logs,
      [selectedDate]: {
        ...emptyDay,
        ...dayLog,
        ...patch,
      },
    });
  }

  useEffect(() => localStorage.setItem("gc.profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("gc.dailyLogs", JSON.stringify(logs)), [logs]);

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

  const totalExercises = workouts.flatMap((w) => w.exercises).length;
  const completedToday = Object.values(dayLog.checks || {}).filter(Boolean).length;
  const workoutPct = Math.round((completedToday / totalExercises) * 100);

  const weekDates = getLastSevenDays();

  const weeklyCompletion = Math.round(
    weekDates.reduce((sum, date) => {
      const log = logs[date] || emptyDay;
      const done = Object.values(log.checks || {}).filter(Boolean).length;
      return sum + Math.round((done / totalExercises) * 100);
    }, 0) / 7
  );

  const score = useMemo(() => {
    let totalScore = 0;
    totalScore += Math.min(40, workoutPct * 0.4);
    totalScore += Math.min(20, Number(dayLog.protein) / 6.5);
    totalScore += Math.min(15, Number(dayLog.water) * 2);
    totalScore += dayLog.photos?.front ? 8 : 0;
    totalScore += dayLog.photos?.side ? 5 : 0;
    totalScore += dayLog.photos?.back ? 7 : 0;
    totalScore += dayLog.measurements?.weight || dayLog.measurements?.glutes ? 5 : 0;
    return Math.min(100, Math.round(totalScore));
  }, [workoutPct, dayLog]);

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

        <DateStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} logs={logs} />

        {page === "home" && (
          <Home
            profile={profile}
            workoutPct={workoutPct}
            weeklyCompletion={weeklyCompletion}
            dayLog={dayLog}
            score={score}
            selectedDate={selectedDate}
            setPage={setPage}
          />
        )}

        {page === "train" && (
          <Train
            activeWorkout={activeWorkout}
            setActiveWorkout={setActiveWorkout}
            dayLog={dayLog}
            updateDay={updateDay}
            timer={timer}
            setTimer={setTimer}
            running={running}
            setRunning={setRunning}
          />
        )}

        {page === "meals" && <Meals dayLog={dayLog} updateDay={updateDay} />}

        {page === "progress" && (
          <Progress
            logs={logs}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dayLog={dayLog}
            updateDay={updateDay}
          />
        )}

        {page === "coach" && (
          <Coach
            score={score}
            workoutPct={workoutPct}
            dayLog={dayLog}
            profile={profile}
            weeklyCompletion={weeklyCompletion}
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

function getLastSevenDays() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

function shortDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function DateStrip({ selectedDate, setSelectedDate, logs }: any) {
  const dates = getLastSevenDays();

  return (
    <div className="date-strip">
      {dates.map((date) => {
        const log = logs[date] || emptyDay;
        const complete = Object.values(log.checks || {}).filter(Boolean).length > 0;
        return (
          <button
            key={date}
            className={selectedDate === date ? "active" : ""}
            onClick={() => setSelectedDate(date)}
          >
            <span>{shortDate(date)}</span>
            <small>{complete ? "✓" : "•"}</small>
          </button>
        );
      })}
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
            <p>Track workouts, meals, photos, measurements, and daily progress history.</p>
          </div>

          <div className="panel">
            <h3>Create Profile</h3>
            <input className="input" placeholder="Your name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <input className="input" placeholder="Main goal" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} />
          </div>
        </section>
      </main>
    </div>
  );
}

function Home({ profile, workoutPct, weeklyCompletion, dayLog, score, selectedDate, setPage }: any) {
  return (
    <section className="page">
      <div className="hero-card">
        <p className="pill">{selectedDate}</p>
        <h2>{profile.goal}</h2>
        <p>Track today. Review any day. Build proof of progress.</p>
        <button onClick={() => setPage("train")}>Start Training</button>
      </div>

      <div className="grid">
        <Card label="Today" value={`${workoutPct}%`} />
        <Card label="7-Day Avg" value={`${weeklyCompletion}%`} />
        <Card label="Protein" value={`${dayLog.protein}g`} />
        <Card label="Score" value={`${score}%`} />
      </div>

      <div className="panel">
        <h3>Today’s Data</h3>
        <p>Workout completion: {workoutPct}%</p>
        <p>Protein: {dayLog.protein}g</p>
        <p>Water: {dayLog.water} / 8</p>
        <p>Calories: {dayLog.calories || "Not logged"}</p>
      </div>
    </section>
  );
}

function Train({ activeWorkout, setActiveWorkout, dayLog, updateDay, timer, setTimer, running, setRunning }: any) {
  if (activeWorkout) {
    return (
      <section className="page">
        <button className="back-btn" onClick={() => setActiveWorkout(null)}>← Back to Workouts</button>

        <div className="panel">
          <p className="pill">{activeWorkout.day}</p>
          <h3>{activeWorkout.title}</h3>
          <span>{activeWorkout.focus}</span>

          <div className="timer-box">
            <strong>{String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}</strong>
            <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Start Rest"}</button>
            <button onClick={() => { setTimer(90); setRunning(false); }}>Reset</button>
          </div>

          <div className="exercise-list">
            {activeWorkout.exercises.map((ex: string) => {
              const key = `${activeWorkout.day}-${ex}`;
              return (
                <div className="exercise-card" key={key}>
                  <label className="exercise-row">
                    <input
                      type="checkbox"
                      checked={!!dayLog.checks[key]}
                      onChange={() => updateDay({ checks: { ...dayLog.checks, [key]: !dayLog.checks[key] } })}
                    />
                    <span>{ex}</span>
                  </label>
                  <input
                    className="input"
                    placeholder="Weight used / reps / notes"
                    value={dayLog.weights[key] || ""}
                    onChange={(e) => updateDay({ weights: { ...dayLog.weights, [key]: e.target.value } })}
                  />
                </div>
              );
            })}
          </div>

          <textarea
            className="textarea"
            placeholder="Workout notes for this day..."
            value={dayLog.notes[activeWorkout.day] || ""}
            onChange={(e) => updateDay({ notes: { ...dayLog.notes, [activeWorkout.day]: e.target.value } })}
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

function Meals({ dayLog, updateDay }: any) {
  const uploadMeal = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDay({ mealPhoto: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <section className="page">
      <div className="panel">
        <h3>Meal Photo</h3>
        <p>Upload today’s meal photo, then edit ingredients/macros.</p>
        {dayLog.mealPhoto && <img className="progress-photo" src={dayLog.mealPhoto} alt="Meal" />}
        <input className="file" type="file" accept="image/*" onChange={(e) => uploadMeal(e.target.files?.[0])} />
      </div>

      <div className="panel">
        <h3>Editable Breakdown</h3>
        <textarea
          className="textarea tall"
          placeholder="Ingredients + amounts"
          value={dayLog.ingredients}
          onChange={(e) => updateDay({ ingredients: e.target.value })}
        />
        <input className="input" placeholder="Calories" value={dayLog.calories} onChange={(e) => updateDay({ calories: e.target.value })} />
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Protein</h3>
          <div className="counter">
            <button onClick={() => updateDay({ protein: Math.max(0, dayLog.protein - 10) })}>−</button>
            <strong>{dayLog.protein}g</strong>
            <button onClick={() => updateDay({ protein: dayLog.protein + 10 })}>+</button>
          </div>
        </div>

        <div className="panel">
          <h3>Water</h3>
          <div className="counter">
            <button onClick={() => updateDay({ water: Math.max(0, dayLog.water - 1) })}>−</button>
            <strong>{dayLog.water}</strong>
            <button onClick={() => updateDay({ water: dayLog.water + 1 })}>+</button>
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

function Progress({ logs, selectedDate, setSelectedDate, dayLog, updateDay }: any) {
  const uploadPhoto = (type: "front" | "side" | "back", file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDay({ photos: { ...dayLog.photos, [type]: reader.result as string } });
    reader.readAsDataURL(file);
  };

  return (
    <section className="page">
      <div className="panel">
        <h3>Daily Calendar</h3>
        <div className="calendar-list">
          {getLastSevenDays().map((date) => {
            const log = logs[date] || emptyDay;
            const done = Object.values(log.checks || {}).filter(Boolean).length;
            return (
              <button key={date} className={selectedDate === date ? "active" : ""} onClick={() => setSelectedDate(date)}>
                <strong>{shortDate(date)}</strong>
                <span>{done} exercises · {log.protein || 0}g protein · {log.water || 0}/8 water</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h3>Measurements</h3>
        {["waist", "hips", "glutes", "weight"].map((field) => (
          <input
            key={field}
            className="input"
            placeholder={field}
            value={dayLog.measurements[field]}
            onChange={(e) => updateDay({ measurements: { ...dayLog.measurements, [field]: e.target.value } })}
          />
        ))}
      </div>

      {["front", "side", "back"].map((type) => (
        <div className="panel" key={type}>
          <h3>{type} Photo</h3>
          {dayLog.photos[type] && <img className="progress-photo" src={dayLog.photos[type]} alt={type} />}
          <input className="file" type="file" accept="image/*" onChange={(e) => uploadPhoto(type as any, e.target.files?.[0])} />
        </div>
      ))}
    </section>
  );
}

function Coach({ score, workoutPct, dayLog, profile, weeklyCompletion }: any) {
  const feedback =
    score >= 85
      ? "You are reward eligible. Keep consistency high and verify progress with updated photos."
      : workoutPct < 50
      ? "Finish more workouts today. Training consistency is your biggest gap."
      : dayLog.protein < 100
      ? "Increase protein closer to 100–130g per day."
      : !dayLog.photos.front
      ? "Upload your front progress photo to improve verification."
      : !dayLog.measurements.weight
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
        <h3>7-Day Overview</h3>
        <p>Average workout completion: {weeklyCompletion}%</p>
        <span>Use Progress to view each day’s workout, meal, photo, and measurement logs.</span>
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
