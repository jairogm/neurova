"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildPatientTimeline, formatTimelineDate, type TimelineEvent } from "@/lib/patient-timeline";
import { FileText, CalendarDays, DollarSign, UserPlus, Upload, ChevronDown } from "lucide-react";

type Props = {
  patient: { id: string; created_at: string };
  notes: ReturnType<typeof useQuery<typeof api.medical_history_notes.listByPatient>>;
  sessions: ReturnType<typeof useQuery<typeof api.sessions.listByPatient>>;
  onNavigate: (tab: TimelineEvent["tab"]) => void;
};
const icons = {note: FileText, session: CalendarDays, payment: DollarSign, patient: UserPlus, document: Upload};

export function PatientTimeline({ patient, notes, sessions, onNavigate }: Props) {
  const documents = useQuery(api.patient_documents.list, {patientId: patient.id});
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("all");
  const events = useMemo(() => buildPatientTimeline(patient, notes ?? [], sessions ?? [], documents ?? []), [patient, notes, sessions, documents]);
  const filtered = events.filter(event => filter === "all" || event.type === filter);
  const visible = expanded ? filtered : filtered.slice(0, 6);
  const loading = notes === undefined || sessions === undefined || documents === undefined;
  return (
    <section className="overflow-hidden rounded-[15px] border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-extrabold">Patient timeline</h2>
        <div className="relative">
        <select aria-label="Filter patient timeline" value={filter} onChange={event => {setFilter(event.target.value); setExpanded(false);}} className="min-h-10 appearance-none rounded-lg border border-border bg-card py-2.5 pl-4 pr-10 text-xs leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="all">All activity</option><option value="note">Notes</option><option value="session">Sessions</option><option value="payment">Payments</option><option value="document">Documents</option>
        </select>
        <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="px-5 pb-4 pt-1.5" aria-live="polite">
        {loading ? <p role="status" className="py-8 text-center text-sm text-muted-foreground">Loading timeline…</p> : visible.length ? (
          <ol>
            {visible.map(event => {
              const Icon = icons[event.type];
              return <li key={event.key} className="flex gap-3.5 border-b border-border py-3 last:border-0">
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={15} /></div>
                <button type="button" onClick={() => onNavigate(event.tab)} className="min-w-0 flex-1 rounded text-left outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><span className="text-[13.5px] font-bold">{event.title}</span><time dateTime={event.date || undefined} className="text-xs text-muted-foreground">{formatTimelineDate(event.date)}</time></span>
                  <span className="mt-0.5 block break-words text-[12.5px] text-muted-foreground">{event.description}</span>
                </button>
              </li>;
            })}
          </ol>
        ) : <p className="py-8 text-center text-sm text-muted-foreground">No {filter === "all" ? "timeline activity" : filter === "document" ? "documents" : filter === "payment" ? "payments" : filter === "note" ? "notes" : "sessions"} yet.</p>}
        {!loading && filtered.length > 6 && <button type="button" onClick={() => setExpanded(value => !value)} className="mt-3 rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary">{expanded ? "Show less" : `Show all ${filtered.length} events`}</button>}
      </div>
    </section>
  );
}
