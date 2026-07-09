"use client";

import { api } from "@/convex/_generated/api";
import { CancelAppointmentModal } from "@/components/modals/CancelAppointmentModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cancelAppointment } from "@/lib/google-calendar";
import { apptToneFor, avatarColorFor, initialsFor } from "@/lib/nv";
import { useMutation } from "convex/react";
import { ArrowUpRight, Loader2, Video, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type SessionDetails = {
  _id: string;
  id?: string | null;
  patient_id: string;
  event_id?: string | null;
  meet_link?: string | null;
  scheduled_date: string;
  duration?: number | null;
  session_status?: string | null;
  session_type?: string | null;
  mode?: string | null;
  notes?: string | null;
  patientName?: string;
  patientColor?: string | null;
};

const SESSION_TYPES = [
  { key: "video", label: "Video call" },
  { key: "inperson", label: "In-person" },
  { key: "phone", label: "Phone" },
] as const;

const STATUSES = [
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "no_show", label: "No-show" },
] as const;

const labelClass = "mb-[7px] block text-xs font-bold text-foreground/80";
const chipOn = "border-primary bg-primary/10 text-primary";
const chipOff = "border-border bg-card text-foreground/80 hover:border-primary/50";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function localDateISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function minutesOf(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function SessionDetailsModal({
  session,
  open,
  onOpenChange,
}: {
  session: SessionDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateSession = useMutation(api.sessions.update);
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const [dateISO, setDateISO] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [mode, setMode] = useState("video");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !session) return;
    const start = new Date(session.scheduled_date);
    const duration = session.duration || 50;
    const end = new Date(start.getTime() + duration * 60000);
    setDateISO(localDateISO(start));
    setStartTime(localTime(start));
    setEndTime(localTime(end));
    setMode(session.mode || "video");
    const normalized = session.session_status?.toLowerCase().replace("-", "_") || "scheduled";
    setStatus(["completed", "complete"].includes(normalized) ? "completed" : ["no_show", "missed"].includes(normalized) ? "no_show" : normalized === "cancelled" || normalized === "canceled" ? "cancelled" : "scheduled");
    setNotes(session.notes || "");
    setConfirmCancel(false);
  }, [open, session]);

  if (!session) return null;

  const sessionKey = String(session.id ?? session._id);
  const tone = apptToneFor(session.session_status ?? undefined);
  const isCancelled = status === "cancelled";

  const save = async () => {
    const duration = minutesOf(endTime) - minutesOf(startTime);
    if (!dateISO || duration <= 0) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    try {
      await updateSession({
        id: sessionKey,
        scheduled_date: new Date(`${dateISO}T${startTime}:00`).toISOString(),
        duration,
        session_status: status,
        mode,
        notes: notes || undefined,
      });
      toast.success("Session updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  const cancelSession = async () => {
    setCanceling(true);
    try {
      await updateSession({ id: sessionKey, session_status: "cancelled" });
      if (session.event_id) {
        cancelAppointment(session.event_id, "single").catch((error) =>
          console.warn("Google Calendar cancellation skipped:", error),
        );
      }
      toast.success("Appointment cancelled");
      setConfirmCancel(false);
      onOpenChange(false);
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCanceling(false);
    }
  };

  const dateLabel = new Date(session.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[70vh] w-[520px] max-w-[94vw] gap-0 overflow-y-auto p-0">
          <DialogHeader className="border-b border-border px-[22px] py-5 pr-12 text-left">
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-[17px] font-extrabold text-foreground">Session details</DialogTitle>
              <span className={`rounded-full px-[9px] py-[3px] text-[11px] font-bold ${tone.className}`}>{tone.label}</span>
            </div>
            <DialogDescription className="mt-[3px] text-[12.5px] text-muted-foreground">
              View, reschedule, or update this appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-[18px] p-[22px]">
            <div>
              <span className={labelClass}>Patient</span>
              <div className="flex items-center gap-[11px] rounded-[11px] border border-border bg-secondary px-[13px] py-[11px]">
                <div className="flex size-8 flex-none items-center justify-center rounded-[9px] text-xs font-bold text-white" style={{ background: avatarColorFor(session.patientColor ?? undefined, 0) }}>
                  {initialsFor(session.patientName)}
                </div>
                <span className="text-[13.5px] font-bold text-foreground">{session.patientName ?? "Patient"}</span>
                <Link
                  href={`/patients/${session.patient_id}`}
                  onClick={() => onOpenChange(false)}
                  className="ml-auto flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline"
                >
                  Open chart <ArrowUpRight size={12} strokeWidth={2.4} />
                </Link>
              </div>
            </div>

            {session.meet_link && !isCancelled && (
              <a
                href={session.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-[11px] border border-[#8acfe0] bg-primary/10 px-[13px] py-[11px] text-[13px] font-bold text-primary transition-colors hover:bg-primary/15 dark:border-[#1f5664]"
              >
                <Video size={15} strokeWidth={2} />Join Google Meet
              </a>
            )}

            <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
              <div>
                <label className={labelClass} htmlFor="session-date">Date</label>
                <input
                  id="session-date"
                  type="date"
                  value={dateISO}
                  disabled={isCancelled}
                  onChange={(event) => setDateISO(event.target.value)}
                  className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2.5 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary disabled:opacity-60"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass} htmlFor="session-start">Start</label>
                  <input
                    id="session-start"
                    type="time"
                    value={startTime}
                    disabled={isCancelled}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="session-end">End</label>
                  <input
                    id="session-end"
                    type="time"
                    value={endTime}
                    disabled={isCancelled}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className={labelClass}>Session type</span>
              <div className="flex gap-2">
                {SESSION_TYPES.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    disabled={isCancelled}
                    onClick={() => setMode(type.key)}
                    className={`flex-1 rounded-[10px] border px-3 py-2.5 text-[12.5px] font-bold transition-colors disabled:opacity-60 ${mode === type.key ? chipOn : chipOff}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={labelClass}>Status</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    disabled={isCancelled}
                    onClick={() => setStatus(item.key)}
                    className={`rounded-full border px-[13px] py-2 text-xs font-bold transition-colors disabled:opacity-60 ${status === item.key ? chipOn : chipOff}`}
                  >
                    {item.label}
                  </button>
                ))}
                {isCancelled && (
                  <span className="rounded-full border border-[#d2574f] bg-[#f8e5e3] px-[13px] py-2 text-xs font-bold text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]">Cancelled</span>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="session-notes">Notes <span className="font-medium text-[var(--nv-faint)]">(optional)</span></label>
              <textarea
                id="session-notes"
                value={notes}
                disabled={isCancelled}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a note for this session…"
                className="min-h-16 w-full resize-y rounded-[11px] border border-border bg-card px-[13px] py-[11px] text-[13px] text-foreground/80 outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-[22px] pb-[22px]">
            {!isCancelled && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-1.5 rounded-[10px] px-2.5 py-2.5 text-[12.5px] font-bold text-[#d2574f] transition-colors hover:bg-[#f8e5e3] dark:text-[#e0726a] dark:hover:bg-[#3a1f1d]"
              >
                <XCircle size={14} strokeWidth={2} />Cancel appointment
              </button>
            )}
            <div className="ml-auto flex gap-2.5">
              <button type="button" onClick={() => onOpenChange(false)} className="rounded-[10px] border border-border bg-card px-[18px] py-2.5 text-[13px] font-bold text-foreground/80">
                Close
              </button>
              {!isCancelled && (
                <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693] disabled:opacity-60">
                  {saving && <Loader2 size={14} className="animate-spin" />}Save changes
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CancelAppointmentModal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        appointmentTitle={`${session.session_type || "Therapy session"}${session.patientName ? ` — ${session.patientName}` : ""}`}
        appointmentDate={dateLabel}
        onConfirm={cancelSession}
        isCanceling={canceling}
      />
    </>
  );
}
