export type TimelineEvent = {
  key: string;
  type: "note" | "session" | "payment" | "patient" | "document";
  title: string;
  description: string;
  date: string;
  tab: "notes" | "sessions" | "documents" | "overview";
};
type Note = { _id: string; title?: string; description?: string; date?: string; created_at: string; deleted_at?: number };
type Session = { _id: string; scheduled_date: string; created_at: string; session_status?: string; session_type?: string; payment_status?: string; payment_amount?: unknown; duration?: number; mode?: string };
type Document = { _id: string; name: string; kind: string; uploaded_at: string };

export function timelineDate(value: string) {
  // Date-only clinical dates represent a calendar day, not midnight UTC.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function formatTimelineDate(value: string) {
  return timelineDate(value)?.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) ?? "Date unavailable";
}

export function buildPatientTimeline(patient: { created_at: string }, notes: Note[], sessions: Session[], documents: Document[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const validDate = (...values: string[]) => values.find(value => timelineDate(value)) ?? "";
  if (patient.created_at) events.push({key: "patient", type: "patient", title: "Patient added", description: "Patient profile created", date: patient.created_at, tab: "overview"});
  for (const note of notes) {
    if (note.deleted_at !== undefined) continue;
    events.push({key: `note-${note._id}`, type: "note", title: note.title || "Clinical note", description: "Clinical note · " + (note.description || "Patient record"), date: validDate(note.date || "", note.created_at), tab: "notes"});
  }
  for (const session of sessions) {
    const status = (session.session_status || "scheduled").toLowerCase().replaceAll("-", "_");
    const labels: Record<string, string> = {completed: "Completed", complete: "Completed", scheduled: "Scheduled", confirmed: "Confirmed", cancelled: "Cancelled", canceled: "Cancelled", no_show: "No-show", missed: "No-show", in_progress: "In progress"};
    const label = labels[status] || status.replaceAll("_", " ");
    const mode = session.mode === "video" ? "Video" : session.mode === "phone" ? "Phone" : session.mode === "inperson" ? "In person" : session.mode || "Mode not recorded";
    events.push({key: `session-${session._id}`, type: "session", title: `${session.session_type || "Therapy session"} · ${label}`, description: `${session.duration ?? 50} min · ${mode}`, date: validDate(session.scheduled_date, session.created_at), tab: "sessions"});
    if (session.payment_status?.toLowerCase() === "paid") {
      const amount = Number(session.payment_amount);
      events.push({key: `payment-${session._id}`, type: "payment", title: "Session marked paid", description: `${Number.isFinite(amount) && session.payment_amount != null ? new Intl.NumberFormat("es-CO", {style: "currency", currency: "COP", maximumFractionDigits: 0}).format(amount) : "Amount not recorded"} · Shown on session date`, date: validDate(session.scheduled_date, session.created_at), tab: "sessions"});
    }
  }
  for (const document of documents) events.push({key: `document-${document._id}`, type: "document", title: document.kind === "consent" ? "Consent form uploaded" : "Document uploaded", description: document.name, date: document.uploaded_at, tab: "documents"});
  return events.sort((a, b) => (timelineDate(b.date)?.getTime() ?? -Infinity) - (timelineDate(a.date)?.getTime() ?? -Infinity) || a.key.localeCompare(b.key));
}
