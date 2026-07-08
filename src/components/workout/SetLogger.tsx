export interface SetLoggerValue {
  completed: boolean;
  weight: string;
  reps: string;
}

export function SetLogger({ sets, values, onChange }: { sets: number; values: SetLoggerValue[]; onChange: (values: SetLoggerValue[]) => void }) {
  function patch(index: number, patch: Partial<SetLoggerValue>) {
    onChange(values.map((value, cursor) => cursor === index ? { ...value, ...patch } : value));
  }

  return (
    <div className="set-logger" aria-label="Set logger">
      {Array.from({ length: sets }).map((_, index) => {
        const value = values[index] ?? { completed: false, weight: "", reps: "" };
        return (
          <div className="set-row" key={index}>
            <label><span>Set {index + 1}</span><input type="checkbox" checked={value.completed} onChange={() => patch(index, { completed: !value.completed })} /></label>
            <input className="input" inputMode="decimal" placeholder="Weight" value={value.weight} onChange={(event) => patch(index, { weight: event.target.value })} />
            <input className="input" inputMode="numeric" placeholder="Reps" value={value.reps} onChange={(event) => patch(index, { reps: event.target.value })} />
          </div>
        );
      })}
    </div>
  );
}
