"use client";

import { api } from "@/convex/_generated/api";
import { avatarColorFor, initialsFor } from "@/lib/nv";
import { useQuery } from "convex/react";
import { CalendarPlus, CreditCard, LayoutDashboard, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type PaletteContextValue = { open: () => void };

const PaletteContext = createContext<PaletteContextValue>({ open: () => {} });

export function useCommandPalette() {
  return useContext(PaletteContext);
}

type PaletteItem = {
  key: string;
  label: string;
  sub: string;
  kind: string;
  dotText?: string;
  dotColor?: string;
  icon?: React.ReactNode;
  run: () => void;
};

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const patients = useQuery(api.patients.list, open ? {} : "skip");
  const notes = useQuery(api.medical_history_notes.listAllForTherapist, open ? {} : "skip");
  const sessions = useQuery(api.dashboard.getUpcomingSessions, open ? {} : "skip");

  const openPalette = useCallback(() => {
    setQuery("");
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        setOpen((current) => !current);
        setQuery("");
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (value: string) => !q || value.toLowerCase().includes(q);

    const patientItems: PaletteItem[] = (patients || [])
      .filter((patient) => match(patient.name) || match(patient.focus || ""))
      .slice(0, 5)
      .map((patient, index) => ({
        key: `p-${patient.id}`,
        label: patient.name,
        sub: patient.focus || "Patient record",
        kind: "Patient",
        dotText: initialsFor(patient.name),
        dotColor: avatarColorFor(patient.avatar_color, index),
        run: () => go(`/patients/${patient.id}`),
      }));

    const noteItems: PaletteItem[] = (notes || [])
      .filter((note) => match(`${note.title} ${note.patientName}`))
      .slice(0, 3)
      .map((note) => ({
        key: `n-${note._id}`,
        label: `${note.title || "Untitled record"} — ${note.patientName}`,
        sub: note.date || "Clinical record",
        kind: "Note",
        dotText: "N",
        run: () => go(`/patients/${note.patient_id}?tab=notes`),
      }));

    const apptItems: PaletteItem[] = (sessions || [])
      .filter((session) => match(session.patientName))
      .slice(0, 3)
      .map((session) => {
        const date = new Date(session.scheduled_date);
        return {
          key: `a-${session._id}`,
          label: `${session.patientName} — ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          sub: `${date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · ${session.session_type || "Session"}`,
          kind: "Appt",
          dotText: initialsFor(session.patientName),
          dotColor: session.patientColor || undefined,
          run: () => go("/schedule"),
        };
      });

    const actionItems: PaletteItem[] = [
      { key: "act-schedule", label: "Schedule appointment", sub: "Create a new session", kind: "Action", icon: <CalendarPlus size={14} />, run: () => go("/schedule") },
      { key: "act-add-patient", label: "Add patient", sub: "New patient record", kind: "Action", icon: <UserPlus size={14} />, run: () => go("/patients?new=1") },
      { key: "act-billing", label: "Open billing", sub: "Plan, payment methods, invoices", kind: "Action", icon: <CreditCard size={14} />, run: () => go("/billing") },
      { key: "act-dashboard", label: "Go to Dashboard", sub: "Today overview", kind: "Action", icon: <LayoutDashboard size={14} />, run: () => go("/dashboard") },
    ].filter((action) => match(action.label));

    return [
      { title: "Patients", items: patientItems },
      { title: "Notes", items: noteItems },
      { title: "Appointments", items: apptItems },
      { title: "Actions", items: actionItems },
    ].filter((group) => group.items.length);
  }, [go, notes, patients, query, sessions]);

  const value = useMemo(() => ({ open: openPalette }), [openPalette]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(10,22,26,.45)] pt-[13vh] backdrop-blur-[3px]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div
            className="flex max-h-[64vh] w-[580px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_60px_-20px_rgba(12,30,36,.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-[18px] py-[15px]">
              <Search size={18} strokeWidth={2} className="text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search patients, notes, appointments…"
                className="flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <span className="rounded-[5px] border border-border px-[7px] py-0.5 font-mono text-[11px] text-[var(--nv-faint)]">ESC</span>
            </div>
            <div className="overflow-auto p-2">
              {groups.length ? groups.map((group) => (
                <div key={group.title}>
                  <div className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-[var(--nv-faint)]">{group.title}</div>
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.run}
                      className="flex w-full items-center gap-3 rounded-[10px] px-[11px] py-2.5 text-left transition-colors hover:bg-secondary"
                    >
                      <span
                        className="flex size-[30px] flex-none items-center justify-center rounded-lg text-[11px] font-bold text-white"
                        style={{ background: item.dotColor || "#0e96b8" }}
                      >
                        {item.icon || item.dotText || item.kind.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-bold text-foreground">{item.label}</span>
                        <span className="block truncate text-[11.5px] text-muted-foreground">{item.sub}</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[.05em] text-[var(--nv-faint)]">{item.kind}</span>
                    </button>
                  ))}
                </div>
              )) : (
                <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No results for “{query}”.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </PaletteContext.Provider>
  );
}
