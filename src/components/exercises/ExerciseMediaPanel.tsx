import type { ExerciseMediaMetadata } from "../../types/domain";
export function ExerciseMediaPanel({ media }: { media: ExerciseMediaMetadata[] }) {
  return <section className="dev-card"><h2>Media metadata</h2><pre>{JSON.stringify(media, null, 2)}</pre></section>;
}
