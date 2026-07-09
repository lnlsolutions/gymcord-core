export function ExerciseCues({ cues }: { cues: string[] }) {
  return <section className="dev-card"><h2>Coaching cues</h2><ul>{cues.map((cue) => <li key={cue}>{cue}</li>)}</ul></section>;
}
