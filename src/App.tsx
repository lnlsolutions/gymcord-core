import { useEffect, useMemo, useState } from "react";
import type { DailyLog, Page, Profile } from "./types/gymcord";

import { workouts } from "./lib/program";
import {
  createEmptyDay,
  createEmptyProfile,
  getLastSevenDays,
  saved,
  save,
  todayKey,
} from "./lib/storage";
import {
  calculateTransformationScore,
  calculateWorkoutCompletion,
} from "./lib/scoring";

import { AppLayout } from "./components/Common/AppLayout";
import { DateStrip } from "./components/Common/DateStrip";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Train } from "./components/Workout/Train";
import { Meals } from "./components/Meals/Meals";
import { Progress } from "./components/Progress/Progress";
import { Coach } from "./components/Coach/Coach";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [profile, setProfile] = useState<Profile>(() =>
    saved("gc.profile", createEmptyProfile())
  );

  const [logs, setLogs] = useState<Record<string, DailyLog>>(() =>
    saved("gc.dailyLogs", {})
  );

  const dayLog = logs[selectedDate] || createEmptyDay(selectedDate);

  function updateDay(patch: Partial<DailyLog>) {
    setLogs({
      ...logs,
      [selectedDate]: {
        ...createEmptyDay(selectedDate),
        ...dayLog,
        ...patch,
      },
    });
  }

  useEffect(() => {
    save("gc.profile", profile);
  }, [profile]);

  useEffect(() => {
    save("gc.dailyLogs", logs);
  }, [logs]);

  const totalExercises = workouts.reduce(
    (sum, workout) => sum + workout.exercises.length,
    0
  );

  const workoutCompletion = calculateWorkoutCompletion(dayLog, totalExercises);

  const transformationScore = useMemo(
    () => calculateTransformationScore(dayLog, workoutCompletion),
    [dayLog, workoutCompletion]
  );

  const weeklyCompletion = useMemo(() => {
    const dates = getLastSevenDays();

    const total = dates.reduce((sum, date) => {
      const log = logs[date] || createEmptyDay(date);
      return sum + calculateWorkoutCompletion(log, totalExercises);
    }, 0);

    return Math.round(total / dates.length);
  }, [logs, totalExercises]);

  if (!profile.name || !profile.goal) {
    return (
      <div className="app">
        <main className="screen">
          <section className="page">
            <div className="hero-card">
              <p className="pill">GymCord Beta</p>
              <h2>Start your transformation.</h2>
              <p>
                Create your profile to track workouts, meals, photos,
                measurements, AI score, and reward eligibility.
              </p>
            </div>

            <div className="panel">
              <h3>Create Profile</h3>

              <input
                className="input"
                placeholder="Your name"
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
              />

              <input
                className="input"
                placeholder="Main goal"
                value={profile.goal}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    goal: event.target.value,
                  })
                }
              />

              <input
                className="input"
                placeholder="Current weight"
                value={profile.currentWeight}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    currentWeight: event.target.value,
                  })
                }
              />

              <input
                className="input"
                placeholder="Goal weight"
                value={profile.goalWeight}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    goalWeight: event.target.value,
                  })
                }
              />

              <button
                className="primary-button"
                onClick={() =>
                  setProfile({
                    ...profile,
                    name: profile.name || "Beta Tester",
                    goal: profile.goal || "Build strength and consistency",
                  })
                }
              >
                Enter GymCord
              </button>
            </div>
          </section>
        </main>
      </div>
    );
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
          dayLog={dayLog}
          score={transformationScore}
          workoutCompletion={workoutCompletion}
          setPage={setPage}
        />
      )}

      {page === "train" && (
        <Train dayLog={dayLog} updateDay={updateDay} />
      )}

      {page === "meals" && (
        <Meals dayLog={dayLog} updateDay={updateDay} />
      )}

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
        <Coach profile={profile} dayLog={dayLog} />
      )}

      <div className="panel weekly-summary">
        <h3>7-Day Average</h3>
        <p>{weeklyCompletion}% workout completion across the last 7 days.</p>
      </div>
    </AppLayout>
  );
}
