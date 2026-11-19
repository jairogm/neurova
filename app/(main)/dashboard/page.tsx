"use client";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";
import { useLocale } from "next-intl";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AgendaRow } from "@/components/AgendaRow";
import { SessionDetailsModal, type SessionDetails } from "@/components/modals/SessionDetailsModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/useNow";
import { useTutorial } from "@/hooks/useTutorial";
import { formatCOP, initialsFor, modeLabel } from "@/lib/nv";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronRight, HelpCircle, Plus, Video, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function safeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sessionTime(value: string, locale: string) {
  const date = safeDate(value);
  if (!date) return "—";

  return date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

function nextSessionCountdown(value: string, now: number, locale: string, tr: (s: string) => string) {
  const date = safeDate(value);
  if (!date) return tr("upcoming");
  const minutes = Math.round((date.getTime() - now) / 60000);
  if (minutes <= 0) return tr("now");
  if (minutes < 60) return `${tr("in")} ${minutes} min`;
  if (minutes < 24 * 60) return `${tr("in")} ${Math.round(minutes / 60)} ${tr("hr")}`;
  return date.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
}

export default function Dashboard() {
  const locale = useLocale();
  const tr = useWorkspaceText();
  const { user } = useUser();
  const therapist = useQuery(api.users.getCurrentUser);
  const stats = useQuery(api.dashboard.getStats);
  const upcomingSessions = useQuery(api.dashboard.getUpcomingSessions);
  const wrapTasks = useQuery(api.dashboard.wrapUpTasks);
  const tasks = useQuery(api.tasks.list);
  const addTaskMutation = useMutation(api.tasks.add);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);
  const { startDashboardTour, shouldShowTutorial, tutorialCompleted, replayTutorial, isLoading } = useTutorial();
  const [newTask, setNewTask] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const now = useNow();

  useEffect(() => {
    if (!shouldShowTutorial || isLoading) return;
    const timer = window.setTimeout(startDashboardTour, 1000);
    return () => window.clearTimeout(timer);
  }, [shouldShowTutorial, isLoading, startDashboardTour]);

  const greetingName = therapist?.display_name || user?.firstName || user?.fullName?.split(" ")[0] || tr("there");
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? tr("Good morning") : hour < 18 ? tr("Good afternoon") : tr("Good evening");

  // The soonest upcoming session across the coming days — powers the banner.
  const nextSession = useMemo(() => {
    return (upcomingSessions ?? []).find((session) => {
      const status = session.session_status?.toLowerCase() || "";
      const time = safeDate(session.scheduled_date)?.getTime() ?? 0;
      return !["completed", "complete", "cancelled", "canceled", "no_show", "no-show"].includes(status) && time >= now - 15 * 60000;
    });
  }, [upcomingSessions, now]);

  // Today's sessions, always including whatever the banner shows —
  // the "Up next" appointment is never missing from the agenda table.
  const agenda = useMemo(() => {
    const today = new Date(now).toDateString();
    const list = (upcomingSessions ?? []).filter(
      (session) => safeDate(session.scheduled_date)?.toDateString() === today,
    );
    if (nextSession && !list.some((session) => session._id === nextSession._id)) {
      list.push(nextSession);
      list.sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    }
    return list;
  }, [upcomingSessions, now, nextSession]);

  const tasksLeft = (tasks ?? []).filter((task) => !task.done).length;

  const statCards = [
    {
      label: tr("Active patients"),
      value: stats?.totalPatients,
      delta: stats ? `${stats.totalPatients} ${tr("in your caseload")}` : tr("Loading caseload"),
    },
    {
      label: tr("Sessions this week"),
      value: stats?.sessionsThisWeek,
      delta: stats ? `${stats.sessionsToday} ${tr("scheduled today")}` : tr("Loading schedule"),
    },
    {
      label: tr("Attendance rate"),
      value: stats ? `${stats.attendanceRate}%` : undefined,
      delta: tr("Completed vs. no-shows"),
    },
    {
      label: tr("Outstanding"),
      value: stats ? formatCOP(stats.outstandingAmount) : undefined,
      delta: tr("Unpaid and overdue sessions"),
      warning: true,
    },
  ];

  const paymentTotal =
    (stats?.paymentCollected || 0) +
    (stats?.paymentUnpaid || 0) +
    (stats?.paymentOverdue || 0);
  const paymentWidths = useMemo(() => {
    if (!paymentTotal) return { collected: 0, unpaid: 0, overdue: 0 };
    return {
      collected: ((stats?.paymentCollected || 0) / paymentTotal) * 100,
      unpaid: ((stats?.paymentUnpaid || 0) / paymentTotal) * 100,
      overdue: ((stats?.paymentOverdue || 0) / paymentTotal) * 100,
    };
  }, [paymentTotal, stats?.paymentCollected, stats?.paymentOverdue, stats?.paymentUnpaid]);

  const addTask = async () => {
    const label = newTask.trim();
    if (!label) return;
    setNewTask("");
    await addTaskMutation({ label });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-4 sm:px-5 sm:py-[18px] wide:px-[30px] wide:py-[26px]">
      <div className="mb-3 flex items-start justify-between gap-4 wide:mb-[22px]">
        <div>
          <h1 className="m-0 text-[21px] font-extrabold tracking-[-.02em] text-foreground wide:text-[24px]">
            {greetingName ? `${greeting}, ${greetingName}` : greeting}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground wide:mt-1 wide:text-sm">{tr("You have")} <strong className="font-bold text-primary">{stats?.sessionsToday ?? "—"} {tr(stats?.sessionsToday === 1 ? "session" : "sessions")}</strong> {tr("today ·")} {tasksLeft} {tr("tasks left.")}</p>
        </div>
        {tutorialCompleted && (
          <Button variant="ghost" size="icon" onClick={replayTutorial} title={tr("Replay tutorial")} aria-label={tr("Replay tutorial")} className="size-9 rounded-[10px] text-muted-foreground">
            <HelpCircle className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <section id="stats-overview" className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 wide:mb-[18px] wide:gap-3.5" aria-label={tr("Practice statistics")}>
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card px-3.5 py-3 shadow-sm wide:px-[17px] wide:py-4">
            <div className="mb-1.5 text-[12px] font-semibold text-muted-foreground wide:mb-[9px] wide:text-[12.5px]">{stat.label}</div>
            {stat.value === undefined ? (
              <Skeleton className="h-7 w-24 wide:h-8" />
            ) : (
              <div className={`font-mono text-[22px] font-extrabold tracking-[-.02em] wide:text-[27px] ${stat.warning ? "text-[#be7c16] dark:text-[#d29a3a]" : "text-foreground"}`}>{stat.value}</div>
            )}
            <div className="mt-0.5 text-[11px] text-muted-foreground wide:mt-1 wide:text-[11.5px]">{stat.delta}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[1.7fr_1fr] wide:gap-[18px]">
        <div id="upcoming-appointments" className="flex min-w-0 flex-col gap-3.5 wide:gap-[18px]">
          {upcomingSessions === undefined ? (
            <Skeleton className="h-[160px] rounded-[18px] wide:h-[190px]" />
          ) : nextSession ? (
            <section className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)] px-[18px] py-4 text-white shadow-[0_16px_40px_-16px_rgba(11,90,95,.45)] wide:px-[22px] wide:py-5">
              <div className="absolute -right-[30px] -top-[30px] size-40 rounded-full bg-white/[.07]" />
              <div className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.1em] opacity-85">
                <span className="size-[7px] rounded-full bg-white shadow-[0_0_0_3px_rgba(255,255,255,.22)]" />{tr("Up next ·")} {nextSessionCountdown(nextSession.scheduled_date, now, locale, tr)}
              </div>
              <div className="relative mt-2.5 flex flex-wrap items-center gap-3.5 sm:flex-nowrap wide:mt-3.5">
                <div className="flex size-11 flex-none items-center justify-center rounded-xl border-[1.5px] border-white/30 bg-white/[.18] text-[16px] font-bold wide:size-12 wide:rounded-[14px] wide:text-[17px]">
                  {initialsFor(nextSession.patientName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[17px] font-extrabold tracking-[-.01em] wide:text-[19px]">{nextSession.patientName}</div>
                  <div className="text-[13px] opacity-90">{nextSession.session_type || tr("Therapy session")} · {nextSession.duration || 50} {tr("min")}</div>
                </div>
                <div className="w-full pl-[58px] text-left sm:w-auto sm:pl-0 sm:text-right">
                  <div className="font-mono text-[19px] font-bold wide:text-[22px]">{sessionTime(nextSession.scheduled_date, locale)}</div>
                  <div className="text-[11px] capitalize opacity-85">{tr(modeLabel(nextSession.mode))}</div>
                </div>
              </div>
              <div className="relative mt-3 flex flex-wrap gap-[9px] wide:mt-[18px]">
                {nextSession.meet_link ? (
                  <a
                    href={nextSession.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={tr("Join the Google Meet call")}
                    className="flex items-center gap-2 rounded-[9px] bg-white px-3 py-2 text-[13px] font-bold text-[#0b7693] transition-transform hover:-translate-y-px wide:px-[15px] wide:py-[9px]"
                  >
                    <Video size={15} strokeWidth={2.2} />{tr("Start session")}</a>
                ) : (
                  <Link href={`/patients/${nextSession.patient_id}`} className="flex items-center gap-2 rounded-[9px] bg-white px-3 py-2 text-[13px] font-bold text-[#0b7693] transition-transform hover:-translate-y-px wide:px-[15px] wide:py-[9px]">
                    <Video size={15} strokeWidth={2.2} />{tr("Start session")}</Link>
                )}
                <Link href={`/patients/${nextSession.patient_id}`} className="rounded-[9px] border border-white/40 bg-white/[.12] px-3 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/20 wide:px-[15px] wide:py-[9px]">{tr("Open chart")}</Link>
              </div>
            </section>
          ) : (
            <section className="rounded-[18px] border border-primary/20 bg-[linear-gradient(135deg,#0e96b8,#0b7693)] px-[18px] py-6 text-white shadow-[0_16px_40px_-16px_rgba(11,90,95,.45)] wide:px-[22px] wide:py-8">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] opacity-80">{tr("Your day is clear")}</div>
              <div className="mt-2 text-xl font-extrabold">{tr("No upcoming sessions yet.")}</div>
              <p className="mt-1 text-[13px] text-white/80">{tr("Create an appointment when you are ready.")}</p>
            </section>
          )}

          {wrapTasks && wrapTasks.length > 0 && <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-bold">{tr("Session follow-up")}</h2>
            {(["needsNote", "outstanding"] as const).map(kind => {
              const rows = wrapTasks.filter(row => row[kind]);
              if (!rows.length) return null;
              return <details key={kind} className="border-t py-2"><summary className="cursor-pointer text-sm font-semibold">{rows.length} {kind === "needsNote" ? tr("awaiting a linked note") : tr("with outstanding payment")}</summary>
                {rows.map(row => <Link className="block py-1.5 text-sm text-primary underline" key={row.id} href={`/schedule/${row.id}/finish`}>{row.name} · {new Date(row.date).toLocaleDateString(locale)}</Link>)}
              </details>;
            })}
          </section>}
          <section id="agenda" className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 wide:px-5 wide:py-4">
              <h2 className="text-sm font-extrabold text-foreground wide:text-[15px]">{tr("Today's agenda")}</h2>
              <Link href="/schedule" className="flex items-center gap-1 text-[12.5px] font-bold text-primary">{tr("Week view")} <ChevronRight size={13} strokeWidth={2.4} /></Link>
            </div>
            {upcomingSessions === undefined ? (
              <div className="space-y-3 p-5"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>
            ) : agenda.length ? (
              <div>
                {agenda.map((session, index) => (
                  <AgendaRow key={session._id} session={session} index={index}
                    isNext={session._id === nextSession?._id}
                    showDate={safeDate(session.scheduled_date)?.toDateString() !== new Date(now).toDateString()}
                    onOpen={setSelectedSession} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">{tr("No sessions today. Use “New appointment” to schedule one.")}</div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5 wide:gap-[18px]">
          <section id="tasks-card" className="flex h-[280px] flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-sm wide:h-[370px]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 wide:px-[18px] wide:py-4">
              <h2 className="text-sm font-extrabold text-foreground wide:text-[15px]">{tr("Tasks")}</h2>
              <span className="rounded-full bg-primary/10 px-[9px] py-[3px] text-[11.5px] font-bold text-primary">{tasksLeft} {tr("left")}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-2 py-1.5">
              {tasks === undefined ? (
                <div className="space-y-2 p-2"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /></div>
              ) : tasks.length ? tasks.map((task) => (
                <div key={task._id} className="group flex items-center gap-0.5 rounded-[10px] hover:bg-secondary">
                  <button type="button" onClick={() => toggleTask({ id: task._id as Id<"tasks"> })} className="flex min-w-0 flex-1 items-start gap-[11px] bg-transparent px-2.5 py-[9px] text-left">
                    <span className={`mt-px flex size-[18px] flex-none items-center justify-center rounded-md border-[1.8px] ${task.done ? "border-primary bg-primary text-primary-foreground" : "border-[#cfdadd] dark:border-[#294852]"}`}>
                      {task.done && <Check size={11} strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] font-semibold ${task.done ? "text-[var(--nv-faint)] line-through" : "text-foreground"}`}>{task.label}</span>
                      <span className="mt-px block text-[11px] text-[var(--nv-faint)]">{task.meta}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => removeTask({ id: task._id as Id<"tasks"> })} aria-label={`${tr("Remove")} ${task.label}`} className="mr-1 flex size-7 flex-none items-center justify-center rounded-[7px] text-[var(--nv-faint)] opacity-0 transition-all hover:bg-[#f8e5e3] hover:text-[#d2574f] group-hover:opacity-100 focus:opacity-100">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              )) : (
                <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">{tr("No tasks yet — add your first one below.")}</div>
              )}
            </div>
            <div className="flex flex-none gap-[7px] border-t border-border bg-card px-3 py-2.5">
              <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} placeholder={tr("Add a task…")} className="min-w-0 flex-1 rounded-[9px] border border-border bg-secondary px-[11px] py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
              <button type="button" onClick={addTask} aria-label={tr("Add task")} className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-primary text-primary-foreground transition-colors hover:bg-[#0b7693]">
                <Plus size={16} strokeWidth={2.4} />
              </button>
            </div>
          </section>

          <section id="payments-card" className="rounded-[18px] border border-border bg-card p-4 shadow-sm wide:p-[18px]">
            <h2 className="mb-2.5 text-sm font-extrabold text-foreground wide:mb-3.5 wide:text-[15px]">{tr("Payments · this month")}</h2>
            <div className="mb-2.5 flex h-2.5 overflow-hidden rounded-md bg-muted wide:mb-3.5">
              <div className="bg-[#15986a] dark:bg-[#2ba378]" style={{ width: `${paymentWidths.collected}%` }} />
              <div className="bg-[#be7c16] dark:bg-[#d29a3a]" style={{ width: `${paymentWidths.unpaid}%` }} />
              <div className="bg-[#d2574f] dark:bg-[#e0726a]" style={{ width: `${paymentWidths.overdue}%` }} />
            </div>
            <div className="flex flex-col gap-[7px] wide:gap-[9px]">
              {[
                [tr("Collected"), stats?.paymentCollected, "#15986a"],
                [tr("Unpaid"), stats?.paymentUnpaid, "#be7c16"],
                [tr("Overdue"), stats?.paymentOverdue, "#d2574f"],
              ].map(([label, value, color]) => (
                <div key={label as string} className="flex items-center gap-[9px] text-[13px]">
                  <span className="size-[9px] rounded-[3px]" style={{ background: color as string }} />
                  <span className="flex-1 text-foreground/80">{label}</span>
                  {stats === undefined ? <Skeleton className="h-4 w-20" /> : <span className="font-mono font-bold text-foreground">{formatCOP(value as number)}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <SessionDetailsModal
        session={selectedSession}
        open={Boolean(selectedSession)}
        onOpenChange={(open) => { if (!open) setSelectedSession(null); }}
      />
    </div>
  );
}
