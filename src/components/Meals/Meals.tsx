import { Camera, GlassWater, Moon, NotebookPen, Ruler, Salad } from "lucide-react";
import type { DailyLog } from "../../types/gymcord";
import { MealPhotoUpload } from "./MealPhotoUpload";
import { EmptyState } from "../Common/EmptyState";

export function Meals({ dayLog, updateDay }: { dayLog: DailyLog; updateDay: (patch: Partial<DailyLog>) => void; }) {
  const hasMeals = Boolean(dayLog.ingredients || dayLog.calories || dayLog.protein || dayLog.mealPhoto);
  return (
    <section className="page journal-page">
      <div className="home-header-card"><p className="eyebrow">Journal</p><h2>My fitness diary.</h2><span>Meals, photos, water, sleep, recovery, measurements, progress photos, daily notes, and timeline.</span></div>
      <article className="premium-card"><div className="card-heading"><h3><Salad size={22} /> Meals</h3></div>{hasMeals ? <><MealPhotoUpload dayLog={dayLog} updateDay={updateDay} /><textarea className="textarea tall" placeholder="Breakfast, snack, lunch, snack, dinner..." value={dayLog.ingredients} onChange={(event) => updateDay({ ingredients: event.target.value })} /><input className="input" type="number" placeholder="Calories" value={dayLog.calories || ""} onChange={(event) => updateDay({ calories: Number(event.target.value) })} /></> : <EmptyState icon={<Salad />} headline="No meals logged today." description="Add breakfast, lunch, dinner, snacks, or meal photos." cta="Log Meal" onAction={() => updateDay({ ingredients: "" })} />}</article>
      <div className="journal-grid"><article className="premium-card"><h3><GlassWater size={20} /> Water</h3><div className="counter"><button onClick={() => updateDay({ water: Math.max(0, dayLog.water - 1) })}>−</button><strong>{dayLog.water}/8</strong><button onClick={() => updateDay({ water: dayLog.water + 1 })}>+</button></div></article><article className="premium-card"><h3><Moon size={20} /> Sleep</h3>{dayLog.sleep ? <input className="input" type="number" value={dayLog.sleep} onChange={(event) => updateDay({ sleep: Number(event.target.value) })} /> : <EmptyState icon={<Moon />} headline="Log your first night of sleep." description="Sleep helps Atlas understand recovery." cta="Add Sleep" onAction={() => updateDay({ sleep: 7 })} />}</article></div>
      <article className="premium-card timeline-card"><h3><Camera size={20} /> Meal Photos</h3>{dayLog.mealPhoto ? <img src={dayLog.mealPhoto} alt="Meal" /> : <EmptyState icon={<Camera />} headline="Add your first meal photo." description="Keep a visual timeline of what fuels you." cta="Upload Photo" />}</article>
      <article className="premium-card"><h3><Ruler size={20} /> Measurements & Progress Photos</h3><EmptyState icon={<NotebookPen />} headline="Track your progress." description="Add measurements, progress photos, and daily notes when you're ready." cta="Add Progress" /></article>
    </section>
  );
}
