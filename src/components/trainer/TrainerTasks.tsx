import type { TrainerTask } from "../../types/domain";
export function TrainerTasks({ tasks }: { tasks: TrainerTask[] }) { return <section className="panel premium-card"><p className="pill">Daily tasks</p><h2>{tasks.filter((task) => task.status === "open").length} open</h2><ul className="check-list">{tasks.map((task) => <li key={task.id}>{task.title} · {task.dueOn}</li>)}</ul></section>; }
