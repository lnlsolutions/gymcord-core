export function ExerciseStandards({ standards }: { standards: string[] }) {
  return <section className="dev-card"><h2>Movement standards</h2><ul>{standards.map((standard) => <li key={standard}>{standard}</li>)}</ul></section>;
}
