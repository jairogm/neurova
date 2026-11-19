"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";

export default function FinishSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const id = sessionId as Id<"sessions">;
  const session = useQuery(api.sessions.wrapUpDetail, { id });
  const notes = useQuery(api.medical_history_notes.listByPatient, session ? { patientId: session.patient_id } : "skip");
  const finish = useMutation(api.sessions.finish);
  const [payment, setPayment] = useState<"paid" | "unpaid" | "waived">();
  const [selected, setSelected] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  if (session === undefined) return <p className="p-8">Loading session…</p>;
  if (!session) return <p className="p-8">Session unavailable.</p>;
  const status = session.payment_status?.toLowerCase() ?? "";
  const value = payment ?? (["paid","complete","completed","collected"].includes(status) ? "paid" : status === "waived" ? "waived" : "unpaid");
  const field = "mt-2 w-full rounded-lg border border-border bg-card px-3 py-2";
  const noteLink = session.linkedNote && <Link className="font-bold text-primary underline" href={`/patients/${session.patient_id}?tab=notes&note=${session.linkedNote}`}>Open linked note</Link>;
  return <div className="mx-auto max-w-2xl px-5 py-9">
    <Link href="/dashboard" className="text-sm text-primary">← Dashboard</Link>
    <h1 className="mt-5 text-3xl font-bold">{done ? "Session completed" : "Finish session"}</h1>
    <p className="mb-6 mt-2 text-muted-foreground">{session.patientName} · {new Date(session.scheduled_date).toLocaleString()}</p>
    {done ? <div className="grid justify-items-start gap-4 rounded-2xl border bg-card p-6">
      <p>{value === "unpaid" ? "Payment marked outstanding." : value === "paid" ? "Payment marked paid." : "Payment waived."}</p>
      {noteLink || <button className="text-primary underline" onClick={() => setDone(false)}>Add session note</button>}
      <ScheduleAppointment defaultPatientId={session.patient_id} variant="outline" />
    </div> : <form className="grid gap-5 rounded-2xl border bg-card p-6" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        await finish({ id, payment: value, existingNote: session.linkedNote ?? (selected ? selected as Id<"medical_history_notes"> : undefined), text: selected || session.linkedNote ? undefined : text });
        setDone(true);
      } catch { setError("Couldn’t finish this session. Your draft is still here. Please retry."); }
      finally { setBusy(false); }
    }}>
      {noteLink || <><label>Session note<select className={field} value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Write a new note</option>{notes?.map(n => <option key={n._id} value={n._id}>{n.title || "Untitled"} · {n.date}</option>)}</select></label>
        {!selected && <label>Note text<textarea className={field} value={text} rows={5} maxLength={24000} onChange={e => setText(e.target.value)} placeholder="Leave blank to finish the note later" /></label>}</>}
      <label>Payment<select className={field} value={value} onChange={e => setPayment(e.target.value as typeof value)}><option value="unpaid">Outstanding</option><option value="paid">Paid</option><option value="waived">Waived</option></select></label>
      {error && <p role="alert">{error}</p>}<Button disabled={busy || notes === undefined}>{busy ? "Saving…" : "Finish session"}</Button>
    </form>}
  </div>;
}
