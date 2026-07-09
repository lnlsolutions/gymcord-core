export function ExerciseSafetyNotes({ notes }: { notes: string[] }) {
  return <section className="dev-card"><h2>Safety notes</h2><ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul></section>;
}
