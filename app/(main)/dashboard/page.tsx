"use client";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorial } from "@/hooks/useTutorial";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Check,
  ChevronRight,
  HelpCircle,
  Plus,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DashboardTask = {
  id: string;
  label: string;
  meta: string;
  done: boolean;
};

const initialTasks: DashboardTask[] = [
  { id: "review-notes", label: "Review unsigned session notes", meta: "Due today", done: false },
  { id: "treatment-plan", label: "Update a treatment plan", meta: "Due tomorrow", done: false },
  { id: "calendar", label: "Confirm next week’s recurring slots", meta: "This week", done: false },
];

const avatarColors = ["#0E96B8", "#2C8FB0", "#5C8A7A", "#8A6BA8", "#B5803A"];

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function safeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sessionTime(value: string) {
  const date = safeDate(value);
  return date
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
}

function sessionDate(value: string) {
  const date = safeDate(value);
  if (!date) return "Upcoming";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function nextSessionLabel(value: string) {
  const date = safeDate(value);
  if (!date) return "upcoming";
  const minutes = Math.max(0, Math.round((date.getTime() - Date.now()) / 60000));
  if (minutes < 60) return `in ${minutes} min`;
  if (minutes < 24 * 60) return `in ${Math.round(minutes / 60)} hr`;
  return sessionDate(value);
}

function statusClasses(status?: string) {
  const normalized = status?.toLowerCase() || "scheduled";
  if (["completed", "complete"].includes(normalized)) {
    return "bg-[#eaeff0] text-[#6c828c] dark:bg-[#1a2a2f] dark:text-[#85a0a4]";
  }
  if (["confirmed", "active"].includes(normalized)) {
    return "bg-[#e2f1ea] text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]";
  }
  if (["cancelled", "canceled", "no-show", "no_show"].includes(normalized)) {
    return "bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]";
  }
  return "bg-primary/10 text-primary";
}

function statusLabel(status?: string) {
  if (!status) return "Scheduled";
  return status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { user } = useUser();
  const stats = useQuery(api.dashboard.getStats);
  const upcomingSessions = useQuery(api.dashboard.getUpcomingSessions);
  const recentPatients = useQuery(api.dashboard.getRecentPatients);
  const { startDashboardTour, shouldShowTutorial, tutorialCompleted, replayTutorial, isLoading } = useTutorial();
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!shouldShowTutorial || isLoading) return;
    const timer = window.setTimeout(startDashboardTour, 1000);
    return () => window.clearTimeout(timer);
  }, [shouldShowTutorial, isLoading, startDashboardTour]);

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const agenda = upcomingSessions ?? [];
  const nextSession = agenda[0];
  const tasksLeft = tasks.filter((task) => !task.done).length;

  const statCards = [
    {
      label: "Active patients",
      value: stats?.totalPatients,
      delta: stats ? `${stats.totalPatients} in your caseload` : "Loading caseload",
    },
    {
      label: "Sessions this week",
      value: stats?.sessionsThisWeek,
      delta: stats ? `${stats.sessionsToday} scheduled today` : "Loading schedule",
    },
    {
      label: "Attendance rate",
      value: stats ? `${stats.attendanceRate}%` : undefined,
      delta: "Completed vs. no-shows",
    },
    {
      label: "Outstanding",
      value: stats ? formatCurrency(stats.outstandingAmount) : undefined,
      delta: "Unpaid and overdue sessions",
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

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const addTask = () => {
    const label = newTask.trim();
    if (!label) return;
    setTasks((current) => [
      ...current,
      { id: `${Date.now()}`, label, meta: "Added just now", done: false },
    ]);
    setNewTask("");
  };

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[22px] flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[24px] font-extrabold tracking-[-.02em] text-foreground">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have <strong className="font-bold text-primary">{stats?.sessionsToday ?? "—"} sessions</strong> today · {tasksLeft} tasks left.
          </p>
        </div>
        {tutorialCompleted && (
          <Button variant="ghost" size="icon" onClick={replayTutorial} title="Replay tutorial" aria-label="Replay tutorial" className="size-9 rounded-[10px] text-muted-foreground">
            <HelpCircle className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <section id="stats-overview" className="mb-[18px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice statistics">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card px-[17px] py-4 shadow-sm">
            <div className="mb-[9px] text-[12.5px] font-semibold text-muted-foreground">{stat.label}</div>
            {stat.value === undefined ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className={`font-mono text-[27px] font-extrabold tracking-[-.02em] ${stat.warning ? "text-[#be7c16] dark:text-[#d29a3a]" : "text-foreground"}`}>{stat.value}</div>
            )}
            <div className="mt-1 text-[11.5px] text-muted-foreground">{stat.delta}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1.7fr_1fr]">
        <div id="upcoming-appointments" className="flex min-w-0 flex-col gap-[18px]">
          {upcomingSessions === undefined ? (
            <Skeleton className="h-[190px] rounded-[18px]" />
          ) : nextSession ? (
            <section className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)] px-[22px] py-5 text-white shadow-[0_16px_40px_-16px_rgba(11,90,95,.45)] dark:bg-[linear-gradient(135deg,#38b6d8,#5cc7e2)] dark:text-[#031c23]">
              <div className="absolute -right-[30px] -top-[30px] size-40 rounded-full bg-white/[.07]" />
              <div className="relative flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.1em] opacity-85">
                <span className="size-[7px] rounded-full bg-current shadow-[0_0_0_3px_rgba(255,255,255,.22)]" />
                Up next · {nextSessionLabel(nextSession.scheduled_date)}
              </div>
              <div className="relative mt-3.5 flex flex-wrap items-center gap-3.5 sm:flex-nowrap">
                <div className="flex size-12 flex-none items-center justify-center rounded-[14px] border-[1.5px] border-white/30 bg-white/[.18] text-[17px] font-bold">
                  {initialsFor(nextSession.patientName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[19px] font-extrabold tracking-[-.01em]">{nextSession.patientName}</div>
                  <div className="text-[13px] opacity-90">Therapy session · {nextSession.duration || 50} min</div>
                </div>
                <div className="w-full pl-[62px] text-left sm:w-auto sm:pl-0 sm:text-right">
                  <div className="font-mono text-[22px] font-bold">{sessionTime(nextSession.scheduled_date)}</div>
                  <div className="text-[11px] capitalize opacity-85">{sessionDate(nextSession.scheduled_date)}</div>
                </div>
              </div>
              <div className="relative mt-[18px] flex flex-wrap gap-[9px]">
                <Link href={`/patients/${nextSession.patient_id}`} className="flex items-center gap-2 rounded-[9px] bg-white px-[15px] py-[9px] text-[13px] font-bold text-[#0b7693] transition-transform hover:-translate-y-px dark:text-[#0b7693]">
                  <Video size={15} strokeWidth={2.2} />Start session
                </Link>
                <Link href={`/patients/${nextSession.patient_id}`} className="rounded-[9px] border border-white/40 bg-white/[.12] px-[15px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-white/20 dark:border-[#031c23]/30 dark:text-[#031c23]">
                  Open chart
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-[18px] border border-primary/20 bg-[linear-gradient(135deg,#0e96b8,#0b7693)] px-[22px] py-8 text-white shadow-[0_16px_40px_-16px_rgba(11,90,95,.45)]">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] opacity-80">Your day is clear</div>
              <div className="mt-2 text-xl font-extrabold">No upcoming sessions yet.</div>
              <p className="mt-1 text-[13px] text-white/80">Create an appointment when you are ready.</p>
            </section>
          )}

          <section id="agenda" className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[15px] font-extrabold text-foreground">Today&apos;s agenda</h2>
              <a href="#agenda" className="flex items-center gap-1 text-[12.5px] font-bold text-primary">Week view <ChevronRight size={13} strokeWidth={2.4} /></a>
            </div>
            {upcomingSessions === undefined ? (
              <div className="space-y-3 p-5"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div>
            ) : agenda.length ? (
              <div>
                {agenda.map((session, index) => (
                  <Link key={session._id} href={`/patients/${session.patient_id}`} className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-secondary sm:px-5">
                    <div className="w-[52px] flex-none text-right">
                      <div className="font-mono text-sm font-semibold text-foreground">{sessionTime(session.scheduled_date)}</div>
                      <div className="text-[10.5px] text-[var(--nv-faint)]">{session.duration || 50} min</div>
                    </div>
                    <div className="self-stretch w-px bg-border" />
                    <div className="flex size-[34px] flex-none items-center justify-center rounded-[10px] text-xs font-bold text-white" style={{ background: avatarColors[index % avatarColors.length] }}>
                      {initialsFor(session.patientName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-bold text-foreground">{session.patientName}</div>
                      <div className="truncate text-xs text-muted-foreground">{sessionDate(session.scheduled_date)} · Therapy session</div>
                    </div>
                    <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline ${statusClasses(session.session_status)}`}>
                      {statusLabel(session.session_status)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">No upcoming sessions. Use “New appointment” to schedule one.</div>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <section className="flex h-[370px] flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-[18px] py-4">
              <h2 className="text-[15px] font-extrabold text-foreground">Tasks</h2>
              <span className="rounded-full bg-primary/10 px-[9px] py-[3px] text-[11.5px] font-bold text-primary">{tasksLeft} left</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-2 py-1.5">
              {tasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-0.5 rounded-[10px] hover:bg-secondary">
                  <button type="button" onClick={() => toggleTask(task.id)} className="flex min-w-0 flex-1 items-start gap-[11px] bg-transparent px-2.5 py-[9px] text-left">
                    <span className={`mt-px flex size-[18px] flex-none items-center justify-center rounded-md border-[1.8px] ${task.done ? "border-primary bg-primary text-primary-foreground" : "border-[#cfdadd] dark:border-[#294852]"}`}>
                      {task.done && <Check size={11} strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] font-semibold ${task.done ? "text-[var(--nv-faint)] line-through" : "text-foreground"}`}>{task.label}</span>
                      <span className="mt-px block text-[11px] text-[var(--nv-faint)]">{task.meta}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => removeTask(task.id)} aria-label={`Remove ${task.label}`} className="mr-1 flex size-7 flex-none items-center justify-center rounded-[7px] text-[var(--nv-faint)] opacity-0 transition-all hover:bg-[#f8e5e3] hover:text-[#d2574f] group-hover:opacity-100 focus:opacity-100">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-none gap-[7px] border-t border-border bg-card px-3 py-2.5">
              <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} placeholder="Add a task…" className="min-w-0 flex-1 rounded-[9px] border border-border bg-secondary px-[11px] py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" />
              <button type="button" onClick={addTask} aria-label="Add task" className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-primary text-primary-foreground transition-colors hover:bg-[#0b7693]">
                <Plus size={16} strokeWidth={2.4} />
              </button>
            </div>
          </section>

          <section className="rounded-[18px] border border-border bg-card p-[18px] shadow-sm">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-foreground">Payments · this month</h2>
            <div className="mb-3.5 flex h-2.5 overflow-hidden rounded-md bg-muted">
              <div className="bg-[#15986a] dark:bg-[#2ba378]" style={{ width: `${paymentWidths.collected}%` }} />
              <div className="bg-[#be7c16] dark:bg-[#d29a3a]" style={{ width: `${paymentWidths.unpaid}%` }} />
              <div className="bg-[#d2574f] dark:bg-[#e0726a]" style={{ width: `${paymentWidths.overdue}%` }} />
            </div>
            <div className="flex flex-col gap-[9px]">
              {[
                ["Collected", stats?.paymentCollected, "#15986a"],
                ["Unpaid", stats?.paymentUnpaid, "#be7c16"],
                ["Overdue", stats?.paymentOverdue, "#d2574f"],
              ].map(([label, value, color]) => (
                <div key={label as string} className="flex items-center gap-[9px] text-[13px]">
                  <span className="size-[9px] rounded-[3px]" style={{ background: color as string }} />
                  <span className="flex-1 text-foreground/80">{label}</span>
                  {stats === undefined ? <Skeleton className="h-4 w-20" /> : <span className="font-mono font-bold text-foreground">{formatCurrency(value as number)}</span>}
                </div>
              ))}
            </div>
          </section>

          <section id="recent-patients" className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-[18px] py-4">
              <h2 className="text-[15px] font-extrabold text-foreground">Recent patients</h2>
              <Link href="/patients" className="flex items-center gap-1 text-[12px] font-bold text-primary">View all <ChevronRight size={13} /></Link>
            </div>
            <div className="p-2">
              {recentPatients === undefined ? (
                <div className="space-y-2 p-2"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
              ) : recentPatients?.length ? recentPatients.slice(0, 3).map((patient, index) => (
                <Link key={patient._id} href={`/patients/${patient.id}`} className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-secondary">
                  <div className="flex size-8 items-center justify-center rounded-[9px] text-[11px] font-bold text-white" style={{ background: avatarColors[index % avatarColors.length] }}>{initialsFor(patient.name)}</div>
                  <div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-bold text-foreground">{patient.name}</div><div className="truncate text-[10.5px] text-muted-foreground">Added {new Date(patient.created_at).toLocaleDateString()}</div></div>
                  <ChevronRight size={13} className="text-[var(--nv-faint)]" />
                </Link>
              )) : <div className="px-3 py-6 text-center text-xs text-muted-foreground">No patients yet.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
