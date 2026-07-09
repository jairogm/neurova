"use client";

import { api } from "@/convex/_generated/api";
import { CancelAppointmentModal } from "@/components/modals/CancelAppointmentModal";
import { cancelAppointment } from "@/lib/google-calendar";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CancellableSession = {
  _id: string;
  id?: string | null;
  event_id?: string | null;
  scheduled_date: string;
  session_status?: string | null;
  session_type?: string | null;
  patientName?: string;
};

const CANCELLED_OR_DONE = ["completed", "complete", "cancelled", "canceled", "no_show", "no-show"];

/**
 * Small inline action that cancels an appointment: marks the Convex session
 * as cancelled and removes the linked Google Calendar event (best-effort).
 * Renders nothing for sessions that are already completed or cancelled.
 */
export function CancelSessionButton({ session }: { session: CancellableSession }) {
  const [open, setOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const updateSession = useMutation(api.sessions.update);

  const status = session.session_status?.toLowerCase() || "scheduled";
  if (CANCELLED_OR_DONE.includes(status)) return null;

  const date = new Date(session.scheduled_date);
  const dateLabel = Number.isNaN(date.getTime())
    ? ""
    : `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const confirm = async () => {
    setCanceling(true);
    try {
      await updateSession({ id: String(session.id ?? session._id), session_status: "cancelled" });
      if (session.event_id) {
        cancelAppointment(session.event_id, "single").catch((error) =>
          console.warn("Google Calendar cancellation skipped:", error),
        );
      }
      toast.success("Appointment cancelled");
      setOpen(false);
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <>
      <button
        type="button"
        title="Cancel appointment"
        aria-label="Cancel appointment"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className="flex size-7 flex-none items-center justify-center rounded-[7px] text-[var(--nv-faint)] transition-colors hover:bg-[#f8e5e3] hover:text-[#d2574f] dark:hover:bg-[#3a1f1d] dark:hover:text-[#e0726a]"
      >
        <X size={14} strokeWidth={2} />
      </button>
      <span onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
        <CancelAppointmentModal
          open={open}
          onOpenChange={setOpen}
          appointmentTitle={`${session.session_type || "Therapy session"}${session.patientName ? ` — ${session.patientName}` : ""}`}
          appointmentDate={dateLabel}
          onConfirm={confirm}
          isCanceling={canceling}
        />
      </span>
    </>
  );
}
