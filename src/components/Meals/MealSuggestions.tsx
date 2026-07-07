import { mealSuggestions } from "../../lib/program";

export function MealSuggestions() {
  return (
    <div className="panel">
      <h3>Meal Suggestions</h3>

      {mealSuggestions.map((meal) => (
        <div className="meal-suggestion" key={meal.title}>
          <strong>{meal.title}</strong>
          <p>{meal.meal}</p>
          <span>
            {meal.protein} protein · {meal.calories} calories
          </span>
        </div>
      ))}
    </div>
  );
}
