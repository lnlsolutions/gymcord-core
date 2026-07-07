import type { DailyLog } from "../../types/gymcord";

export function MealPhotoUpload({
  dayLog,
  updateDay,
}: {
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  function uploadMeal(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateDay({
        mealPhoto: reader.result as string,
      });
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="panel">
      <h3>Meal Photo</h3>

      <p>
        Upload a meal photo. For this beta, edit ingredients and macros manually.
        AI photo breakdown will connect later.
      </p>

      {dayLog.mealPhoto && (
        <img className="progress-photo" src={dayLog.mealPhoto} alt="Meal" />
      )}

      <input
        className="file"
        type="file"
        accept="image/*"
        onChange={(event) => uploadMeal(event.target.files?.[0])}
      />
    </div>
  );
}
