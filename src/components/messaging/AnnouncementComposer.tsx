import { MessageComposer } from "./MessageComposer";
export function AnnouncementComposer({ onSend }: { onSend: (body: string) => void }) { return <section className="panel"><h3>Team announcement</h3><MessageComposer label="Post team announcement" onSend={onSend} /></section>; }
