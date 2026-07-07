import type { DailyLog } from "../../types/gymcord";
import { MealPhotoUpload } from "./MealPhotoUpload";
import { MealSuggestions } from "./MealSuggestions";

export function Meals({
  dayLog,
  updateDay,
}: {
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  return (
    <section className="page">
      <MealPhotoUpload dayLog={dayLog} updateDay={updateDay} />

      <div className="panel">
        <h3>Editable Meal Breakdown</h3>

        <textarea
          className="textarea tall"
          placeholder="Ingredients + amounts. Example: 6 oz chicken, 1 cup rice, avocado..."
          value={dayLog.ingredients}
          onChange={(event) =>
            updateDay({
              ingredients: event.target.value,
            })
          }
        />

        <input
          className="input"
          type="number"
          placeholder="Calories"
          value={dayLog.calories || ""}
          onChange={(event) =>
            updateDay({
              calories: Number(event.target.value),
            })
          }
        />
      </div>

      <div className="grid">
        <div className="panel">
          <h3>Protein</h3>

          <div className="counter">
            <button
              onClick={() =>
                updateDay({
                  protein: Math.max(0, dayLog.protein - 10),
                })
              }
            >
              −
            </button>

            <strong>{dayLog.protein}g</strong>

            <button
              onClick={() =>
                updateDay({
                  protein: dayLog.protein + 10,
                })
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Water</h3>

          <div className="counter">
            <button
              onClick={() =>
                updateDay({
                  water: Math.max(0, dayLog.water - 1),
                })
              }
            >
              −
            </button>

            <strong>{dayLog.water}/8</strong>

            <button
              onClick={() =>
                updateDay({
                  water: dayLog.water + 1,
                })
              }
            >
              +
            </button>
          </div>
        </div>
      </div>

      <MealSuggestions />
    </section>
  );
}
