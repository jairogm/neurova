"use client";

import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { avatarColorFor, initialsFor, modeLabel } from "@/lib/nv";
import { createAppointment, meetLinkOf } from "@/lib/google-calendar";
import { useMutation, useQuery } from "convex/react";
import { CalendarIcon, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SESSION_TYPES = [
  { key: "video", label: "Video call" },
  { key: "inperson", label: "In-person" },
  { key: "phone", label: "Phone" },
] as const;

const RECURRENCES = [
  { key: "none", label: "Does not repeat", repeats: 1, stepDays: 0 },
  { key: "weekly", label: "Weekly", repeats: 4, stepDays: 7 },
  { key: "biweekly", label: "Bi-weekly", repeats: 4, stepDays: 14 },
  { key: "monthly", label: "Monthly", repeats: 3, stepDays: 28 },
] as const;

const DEFAULT_START_TIME = "10:00";
const DEFAULT_DURATION_MINUTES = 60;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidTime(value: string) {
  return TIME_PATTERN.test(value);
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  return `${Math.floor(normalized / 60).toString().padStart(2, "0")}:${(normalized % 60).toString().padStart(2, "0")}`;
}

function addMinutes(time: string, durationMinutes: number) {
  if (!isValidTime(time)) return "";
  return minutesToTime(timeToMinutes(time) + durationMinutes);
}

function durationBetween(start: string, end: string) {
  if (!isValidTime(start) || !isValidTime(end)) return null;
  const duration = timeToMinutes(end) - timeToMinutes(start);
  return duration > 0 ? duration : null;
}

function buildDateTime(dateISO: string, time: string) {
  return `${dateISO}T${time}:00`;
}

const labelClass = "mb-[7px] block text-xs font-bold text-foreground/80";
const chipBase = "rounded-[10px] border px-3 py-2.5 text-[12.5px] font-bold transition-colors";
const chipOn = "border-primary bg-primary/10 text-primary";
const chipOff = "border-border bg-card text-foreground/80 hover:border-primary/50";

export const ScheduleAppointment = ({
  variant,
  defaultPatientId,
}: {
  variant?: "outline" | "topbar" | "rail";
  defaultPatientId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const patients = useQuery(api.patients.list) || [];
  const createSession = useMutation(api.sessions.create);
  const updateSession = useMutation(api.sessions.update);

  const todayISO = new Date().toISOString().slice(0, 10);
  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [dateISO, setDateISO] = useState(todayISO);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(addMinutes(DEFAULT_START_TIME, DEFAULT_DURATION_MINUTES));
  const [mode, setMode] = useState<string>("video");
  const [recurrence, setRecurrence] = useState<string>("none");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setPatientId(defaultPatientId ?? "");
    setDateISO(new Date().toISOString().slice(0, 10));
    setStartTime(DEFAULT_START_TIME);
    setEndTime(addMinutes(DEFAULT_START_TIME, DEFAULT_DURATION_MINUTES));
    setMode("video");
    setRecurrence("none");
    setNotes("");
  }, [open, defaultPatientId]);

  const selectedPatient = patients.find((patient) => patient.id === patientId) ?? patients.find((patient) => patient.id === defaultPatientId);
  const selectedIndex = Math.max(0, patients.findIndex((patient) => patient.id === selectedPatient?.id));
  const currentDuration = durationBetween(startTime, endTime);

  // Moving the start slides the end along, preserving the session length.
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (isValidTime(value)) {
      setEndTime(addMinutes(value, currentDuration ?? DEFAULT_DURATION_MINUTES));
    }
  };

  const save = async () => {
    const targetId = selectedPatient?.id;
    if (!targetId) {
      toast.error("Please select a patient");
      return;
    }
    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      toast.error("Please enter valid appointment times");
      return;
    }
    const parsedStartTime = startTime;
    const parsedEndTime = endTime;
    const duration = durationBetween(parsedStartTime, parsedEndTime);
    if (!duration) {
      toast.error("End time must be after start time");
      return;
    }
    setSaving(true);
    const recurrenceConfig = RECURRENCES.find((item) => item.key === recurrence) ?? RECURRENCES[0];
    try {
      const createdSessionIds: string[] = [];
      for (let occurrence = 0; occurrence < recurrenceConfig.repeats; occurrence++) {
        const date = new Date(buildDateTime(dateISO, parsedStartTime));
        date.setDate(date.getDate() + occurrence * recurrenceConfig.stepDays);
        const created = await createSession({
          patient_id: targetId,
          scheduled_date: date.toISOString(),
          duration,
          session_status: "scheduled",
          payment_status: "unpaid",
          payment_amount: 120000,
          notes: notes || undefined,
          mode,
          session_type: "Therapy session",
        });
        if (created?.id) createdSessionIds.push(created.id);
      }
      toast.success("Appointment scheduled");
      setOpen(false);

      // Best-effort Google Calendar sync — the session already exists in Convex.
      // When the event comes back with a Meet link, attach it to the session so
      // "Start session" can jump straight into the call.
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      createAppointment({
        summary: `Therapy session — ${selectedPatient.name}`,
        description: notes || `${modeLabel(mode)} session`,
        start: { dateTime: buildDateTime(dateISO, parsedStartTime), timeZone: timezone },
        end: { dateTime: buildDateTime(dateISO, parsedEndTime), timeZone: timezone },
        attendees: selectedPatient.email ? [{ email: selectedPatient.email, displayName: selectedPatient.name }] : undefined,
        patient_id: targetId,
      })
        .then(async (event) => {
          const meetLink = meetLinkOf(event);
          const sessionId = createdSessionIds[0];
          if (sessionId && (meetLink || event?.id)) {
            await updateSession({ id: sessionId, event_id: event?.id, meet_link: meetLink });
          }
        })
        .catch((error) => console.warn("Google Calendar sync skipped:", error));
    } catch {
      toast.error("Failed to schedule appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          variant === "topbar"
            ? "flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border-0 bg-primary px-3.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693]"
            : variant === "rail"
              ? "flex w-full items-center justify-center rounded-[10px] bg-primary px-3 py-[9px] text-[12.5px] font-bold text-primary-foreground transition-colors hover:bg-[#0b7693]"
              : variant === "outline"
                ? "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary px-4 text-primary hover:bg-primary/10 hover:text-primary"
                : "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary bg-primary px-4 text-white hover:bg-primary/90 hover:text-white"
        }
      >
        {variant !== "rail" && <CalendarIcon className={variant === "outline" ? "text-primary" : "text-current"} size={variant === "topbar" ? 16 : 20} />}
        <span className={variant === "topbar" ? "hidden xl:inline" : undefined}>
          {variant === "topbar" ? "New appointment" : variant === "rail" ? "Schedule" : "Schedule Appointment"}
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[520px] max-w-[94vw] gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-[22px] py-5 pr-12 text-left">
          <DialogTitle className="text-[17px] font-extrabold text-foreground">Schedule appointment</DialogTitle>
          <DialogDescription className="mt-[3px] text-[12.5px] text-muted-foreground">Syncs to Google Calendar automatically.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-[18px] p-[22px]">
          <div>
            <label className={labelClass} htmlFor="appointment-patient">Patient</label>
            <div className="relative flex items-center gap-[11px] overflow-hidden rounded-[11px] border border-border bg-secondary px-[13px] py-[11px] transition-colors hover:border-primary">
              <div className="flex size-8 flex-none items-center justify-center rounded-[9px] text-xs font-bold text-white" style={{ background: avatarColorFor(selectedPatient?.avatar_color, selectedIndex) }}>
                {selectedPatient ? initialsFor(selectedPatient.name) : "—"}
              </div>
              <span className="text-[13.5px] font-bold text-foreground">{selectedPatient?.name ?? "Select a patient"}</span>
              <ChevronDown size={16} strokeWidth={2} className="ml-auto flex-none text-[var(--nv-faint)]" />
              <select
                id="appointment-patient"
                aria-label="Patient"
                value={selectedPatient?.id ?? ""}
                onChange={(event) => setPatientId(event.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              >
                <option value="" disabled>Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>{patient.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
            <div>
              <label className={labelClass} htmlFor="appointment-date">Date</label>
              <input
                id="appointment-date"
                type="date"
                value={dateISO}
                onChange={(event) => setDateISO(event.target.value)}
                className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2.5 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass} htmlFor="appointment-time">Start</label>
                <input
                  id="appointment-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => handleStartTimeChange(event.target.value)}
                  className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="appointment-end-time">End</label>
                <input
                  id="appointment-end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full min-w-0 rounded-[11px] border border-border bg-card px-2 py-[11px] font-mono text-[12.5px] text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <span className={labelClass}>Session type</span>
            <div className="flex gap-2">
              {SESSION_TYPES.map((type) => (
                <button key={type.key} type="button" onClick={() => setMode(type.key)} className={`flex-1 ${chipBase} ${mode === type.key ? chipOn : chipOff}`}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Recurrence</span>
            <div className="flex flex-wrap gap-2">
              {RECURRENCES.map((item) => (
                <button key={item.key} type="button" onClick={() => setRecurrence(item.key)} className={`rounded-full border px-[13px] py-2 text-xs font-bold transition-colors ${recurrence === item.key ? chipOn : chipOff}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="appointment-notes">Notes <span className="font-medium text-[var(--nv-faint)]">(optional)</span></label>
            <textarea
              id="appointment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add a note for this session…"
              className="min-h-16 w-full resize-y rounded-[11px] border border-border bg-card px-[13px] py-[11px] text-[13px] text-foreground/80 outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">
          <button type="button" onClick={() => setOpen(false)} className="rounded-[10px] border border-border bg-card px-[18px] py-2.5 text-[13px] font-bold text-foreground/80">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693] disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}Schedule session
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
