"use client";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";
import { useLocale } from "next-intl";

import { api } from "@/convex/_generated/api";
import { AgendaRow } from "@/components/AgendaRow";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import { SessionDetailsModal, type SessionDetails } from "@/components/modals/SessionDetailsModal";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/useNow";
import { useQuery } from "convex/react";
import { CalendarCheck2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function SchedulePage() {
  const locale = useLocale();
  const tr = useWorkspaceText();
  const sessions = useQuery(api.dashboard.getWeekSessions);
  const weekSessions = useMemo(() => sessions || [], [sessions]);
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(() => today.toDateString());
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);

  const week = useMemo(() => {
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const count = weekSessions.filter((session) => new Date(session.scheduled_date).toDateString() === date.toDateString()).length;
      return { date, count, isToday: date.toDateString() === today.toDateString() };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekSessions]);

  const dayAgenda = weekSessions.filter((session) => new Date(session.scheduled_date).toDateString() === selectedDay);
  const selectedDate = new Date(selectedDay);
  const dayLabel = selectedDate.toLocaleDateString(locale, { weekday: "long", month: "short", day: "numeric" });

  const videoCount = weekSessions.filter((session) => (session.mode || "video") === "video").length;
  const inPersonCount = weekSessions.length - videoCount;

  const now = useNow();
  const nextUpId = useMemo(() => {
    return dayAgenda.find((session) => {
      const status = session.session_status?.toLowerCase() || "";
      return !["completed", "complete", "cancelled", "canceled", "no_show", "no-show"].includes(status) && new Date(session.scheduled_date).getTime() >= now - 15 * 60000;
    })?._id;
  }, [dayAgenda, now]);

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-6">
      <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1">
        {week.map((day) => {
          const selected = day.date.toDateString() === selectedDay;
          return (
            <button
              key={day.date.toISOString()}
              type="button"
              onClick={() => setSelectedDay(day.date.toDateString())}
              className={`min-w-[92px] flex-1 rounded-[14px] border p-[13px] text-center transition-colors ${selected ? "border-primary bg-primary text-white" : day.isToday ? "border-primary bg-card" : "border-border bg-card hover:border-primary/50"}`}
            >
              <div className={`text-[11px] font-bold uppercase tracking-[.05em] ${selected ? "text-white/[.82]" : "text-[var(--nv-faint)]"}`}>{day.date.toLocaleDateString(locale, { weekday: "short" })}</div>
              <div className={`my-[3px] font-mono text-[21px] font-bold ${selected ? "text-white" : "text-foreground"}`}>{day.date.getDate()}</div>
              <div className={`text-[10.5px] ${selected ? "text-white/[.82]" : "text-[var(--nv-faint)]"}`}>{day.count ? `${day.count} ${tr(day.count === 1 ? "session" : "sessions")}` : "—"}</div>
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden rounded-[18px]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-extrabold text-foreground">{dayLabel}</h2>
            <ScheduleAppointment variant="topbar" />
          </div>
          {sessions === undefined ? (
            <div className="space-y-3 p-5"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          ) : dayAgenda.length ? dayAgenda.map((session, index) => (
            <AgendaRow key={session._id} session={session} index={index}
              isNext={session._id === nextUpId} onOpen={setSelectedSession} />
          )) : <div className="px-5 py-14 text-center text-sm text-muted-foreground">{tr("No sessions on this day.")}</div>}
        </Card>

        <Card className="rounded-[18px] p-[18px]">
          <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">{tr("This week")}</div>
          <div className="space-y-[13px]">
            <div className="flex items-baseline justify-between"><span className="text-[13px] text-foreground/80">{tr("Total sessions")}</span><span className="font-mono text-lg font-bold text-foreground">{weekSessions.length}</span></div>
            <div className="flex items-baseline justify-between"><span className="text-[13px] text-foreground/80">{tr("Video")}</span><span className="font-mono text-[15px] font-bold text-foreground">{videoCount}</span></div>
            <div className="flex items-baseline justify-between"><span className="text-[13px] text-foreground/80">{tr("In-person")}</span><span className="font-mono text-[15px] font-bold text-foreground">{inPersonCount}</span></div>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-[9px] rounded-[11px] bg-primary/10 px-3 py-[11px]">
              <CalendarCheck2 size={17} strokeWidth={1.8} className="flex-none text-primary" />
              <div className="text-[11.5px] leading-[1.4] text-foreground/80"><strong className="text-foreground">{tr("Google Calendar")}</strong> {tr("connected · synced 2 min ago")}</div>
            </div>
          </div>
        </Card>
      </div>

      <SessionDetailsModal
        session={selectedSession}
        open={Boolean(selectedSession)}
        onOpenChange={(open) => { if (!open) setSelectedSession(null); }}
      />
    </div>
  );
}
