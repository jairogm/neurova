"use client";

import { useLocale } from "next-intl";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";
import { apptToneFor, avatarColorFor, initialsFor, modeLabel } from "@/lib/nv";
import { CancelSessionButton } from "@/components/CancelSessionButton";
import type { SessionDetails } from "@/components/modals/SessionDetailsModal";

type AgendaRowProps = {
  session: SessionDetails;
  index: number;
  isNext: boolean;
  showDate?: boolean;
  onOpen: (session: SessionDetails) => void;
};

export function AgendaRow({ session, index, isNext, showDate, onOpen }: AgendaRowProps) {
  const tr = useWorkspaceText();
  const locale = useLocale();
  const date = new Date(session.scheduled_date);
  const time = Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  const detail = showDate && Number.isFinite(date.getTime())
    ? date.toLocaleDateString(locale, { weekday: "short", day: "numeric" })
    : `${session.duration || 50} min`;
  const tone = apptToneFor(session.session_status ?? undefined, isNext);

  return (
    <div
      className="flex w-full items-stretch border-b border-border transition-colors last:border-b-0 hover:bg-secondary"
    >
      <button
        type="button"
        onClick={() => onOpen(session)}
        className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-2.5 text-left sm:px-4 wide:gap-3.5 wide:px-5 wide:py-3.5"
      >
        <div className="w-[68px] flex-none text-right wide:w-[72px]">
          <div className="whitespace-nowrap font-mono text-[13px] font-semibold text-foreground wide:text-sm">{time}</div>
          <div className="text-[10.5px] text-[var(--nv-faint)]">{detail}</div>
        </div>
        <div className="w-px self-stretch bg-border" />
        <div className="flex size-8 flex-none items-center justify-center rounded-[10px] text-xs font-bold text-white wide:size-[34px]" style={{ background: avatarColorFor(session.patientColor ?? undefined, index) }}>
          {initialsFor(session.patientName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold text-foreground">{session.patientName || tr("Patient")}</div>
          <div className="truncate text-xs text-muted-foreground">{tr(modeLabel(session.mode ?? undefined))} · {session.session_type || tr("Therapy session")}</div>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold sm:hidden ${tone.className}`}>{tr(tone.label)}</span>
        </div>
        <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline ${tone.className}`}>
          {tr(tone.label)}
        </span>
      </button>
      <div className="mr-3.5 flex w-7 flex-none items-center sm:mr-4 wide:mr-5">
        <CancelSessionButton session={session} />
      </div>
    </div>
  );
}
