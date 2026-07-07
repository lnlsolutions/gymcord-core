import { useEffect, useState } from "react";
import type { DailyLog, WorkoutDay } from "../../types/gymcord";
import { workouts } from "../../lib/program";
import { WorkoutDayCard } from "./WorkoutDayCard";
import { ExerciseCard } from "./ExerciseCard";

export function Train({
  dayLog,
  updateDay,
}: {
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  const [activeWorkout, setActiveWorkout] = useState<WorkoutDay | null>(null);
  const [timer, setTimer] = useState(90);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTimer((time) => {
        if (time <= 1) {
          setRunning(false);
          return 90;
        }

        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  if (!activeWorkout) {
    return (
      <section className="page">
        <div className="panel">
          <h3>Training Plan</h3>
          <p>
            Choose today&apos;s workout. Each session includes exercise photos,
            instructions, muscles worked, form cues, rest timer, and tracking.
          </p>
        </div>

        {workouts.map((workout) => (
          <WorkoutDayCard
            key={workout.id}
            workout={workout}
            onStart={() => setActiveWorkout(workout)}
          />
        ))}
      </section>
    );
  }

  return (
    <section className="page">
      <button className="back-btn" onClick={() => setActiveWorkout(null)}>
        ← Back to workouts
      </button>

      <div className="panel workout-player">
        <p className="pill">{activeWorkout.day}</p>
        <h3>{activeWorkout.title}</h3>
        <span>{activeWorkout.focus}</span>

        <div className="timer-box">
          <strong>
            {String(Math.floor(timer / 60)).padStart(2, "0")}:
            {String(timer % 60).padStart(2, "0")}
          </strong>

          <button onClick={() => setRunning(!running)}>
            {running ? "Pause" : "Start Rest"}
          </button>

          <button
            onClick={() => {
              setTimer(90);
              setRunning(false);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="exercise-list">
        {activeWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            dayId={activeWorkout.id}
            dayLog={dayLog}
            updateDay={updateDay}
          />
        ))}
      </div>

      <div className="panel">
        <h3>Workout Notes</h3>

        <textarea
          className="textarea tall"
          placeholder="How did this workout feel? Energy, soreness, PRs, form notes..."
          value={dayLog.notes[activeWorkout.id] || ""}
          onChange={(event) =>
            updateDay({
              notes: {
                ...dayLog.notes,
                [activeWorkout.id]: event.target.value,
              },
            })
          }
        />
      </div>
    </section>
  );
}
