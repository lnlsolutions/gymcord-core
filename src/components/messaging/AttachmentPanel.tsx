import type { MessageAttachment } from "../../types/domain";
export function AttachmentPanel({ attachments }: { attachments: MessageAttachment[] }) { return <section className="panel"><h3>Attachment metadata</h3>{attachments.length ? attachments.map((a) => <p key={a.id}>{a.name} · {a.mimeType} · {a.sizeBytes} bytes</p>) : <p>No attachments loaded.</p>}</section>; }
