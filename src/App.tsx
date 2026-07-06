import { useEffect, useMemo, useState } from "react";
import type { DailyLog, Page, Profile } from "./types/gymcord";
import { workouts } from "./lib/program";
import { calculateDailyScore } from "./lib/scoring";
import { getLastSevenDays, saved, save, shortDate, todayKey } from "./lib/storage";
import { AppLayout } from "./components/Common/AppLayout";
import { Dashboard } from "./components/Dashboard/Dashboard";

const emptyDay: DailyLog = {
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

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [profile, setProfile] = useState<Profile>(() =>
    saved("gc.profile", {
      name: "",
      goal: "",
      startDate: todayKey(),
    })
  );

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() =>
    saved("gc.dailyLogs", {})
  );

  const dayLog = logs[selectedDate] || emptyDay;

  function updateDay(patch: Partial<DailyLog>) {
    setLogs({
      ...logs,
      [selectedDate]: {
        ...emptyDay,
        ...dayLog,
        ...patch,
      },
    });
  }

  useEffect(() => save("gc.profile", profile), [profile]);
  useEffect(() => save("gc.dailyLogs", logs), [logs]);

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

  const score = useMemo(
    () => calculateDailyScore(dayLog, workoutPct),
    [dayLog, workoutPct]
  );

  if (!profile.name || !profile.goal) {
    return <Onboarding profile={profile} setProfile={setProfile} />;
  }

  return (
    <AppLayout profile={profile} page={page} setPage={setPage}>
      <DateStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        logs={logs}
      />

      {page === "home" && (
        <Dashboard
          profile={profile}
          workoutPct={workoutPct}
          weeklyCompletion={weeklyCompletion}
          dayLog={dayLog}
          score={score}
          selectedDate={selectedDate}
          setPage={setPage}
        />
      )}

      {page !== "home" && (
        <section className="page">
          <div className="panel center">
            <div className="big-emoji">🚧</div>
            <h2>{page.toUpperCase()}</h2>
            <p>This module is being rebuilt in the next batch.</p>
          </div>
        </section>
      )}
    </AppLayout>
  );
}

function DateStrip({
  selectedDate,
  setSelectedDate,
  logs,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  logs: Record<string, DailyLog>;
}) {
  return (
    <div className="date-strip">
      {getLastSevenDays().map((date) => {
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

function Onboarding({
  profile,
  setProfile,
}: {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}) {
  return (
    <div className="app">
      <main className="screen">
        <section className="page">
          <div className="hero-card">
            <p className="pill">GymCord Beta</p>
            <h2>Start your 7-day transformation.</h2>
            <p>
              Track workouts, meals, photos, measurements, and daily progress
              history.
            </p>
          </div>

          <div className="panel">
            <h3>Create Profile</h3>

            <input
              className="input"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Main goal"
              value={profile.goal}
              onChange={(e) =>
                setProfile({ ...profile, goal: e.target.value })
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}
