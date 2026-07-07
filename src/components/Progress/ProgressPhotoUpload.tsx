import type { DailyLog } from "../../types/gymcord";

export function ProgressPhotoUpload({
  type,
  label,
  dayLog,
  updateDay,
}: {
  type: "front" | "side" | "back";
  label: string;
  dayLog: DailyLog;
  updateDay: (patch: Partial<DailyLog>) => void;
}) {
  function uploadPhoto(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateDay({
        photos: {
          ...dayLog.photos,
          [type]: reader.result as string,
        },
      });
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="panel">
      <h3>{label}</h3>

      {dayLog.photos[type] && (
        <img className="progress-photo" src={dayLog.photos[type]} alt={label} />
      )}

      <input
        className="file"
        type="file"
        accept="image/*"
        onChange={(event) => uploadPhoto(event.target.files?.[0])}
      />
    </div>
  );
}
