"use client";

import { api } from "@/convex/_generated/api";
import { DataTable } from "@/components/data-table";
import { AddPatient } from "@/components/modals/AddPatient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTutorial } from "@/hooks/useTutorial";
import { columns } from "@/lib/columns";
import type { Patient } from "@/lib/types";
import { useQuery } from "convex/react";
import { HelpCircle, LayoutGrid, List, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const filters = ["all", "active", "intake", "paused", "discharged"] as const;
type Filter = typeof filters[number];

const avatarColors = ["#0E96B8", "#2C8FB0", "#5C8A7A", "#8A6BA8", "#B5803A", "#3F7E8C"];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function shortDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Patients() {
  const router = useRouter();
  const data = useQuery(api.patients.list);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [filter, setFilter] = useState<Filter>("all");
  const { startPatientsTour, currentTourPage, tutorialCompleted, replayTutorial, startRecordsTour: _startRecordsTour } = useTutorial();

  useEffect(() => {
    if (currentTourPage !== "dashboard") return;
    const timer = window.setTimeout(startPatientsTour, 800);
    return () => window.clearTimeout(timer);
  }, [currentTourPage, startPatientsTour]);

  useEffect(() => {
    if (currentTourPage !== "pre-records" || !data?.length) return;
    const timer = window.setTimeout(() => router.push(`/patients/${data[0].id}/records`), 500);
    return () => window.clearTimeout(timer);
  }, [currentTourPage, data, router]);

  const counts = useMemo(() => {
    const patients = data || [];
    return filters.reduce<Record<Filter, number>>((result, key) => {
      result[key] = key === "all" ? patients.length : patients.filter((patient) => (patient.status || "active") === key).length;
      return result;
    }, { all: 0, active: 0, intake: 0, paused: 0, discharged: 0 });
  }, [data]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (data || []).filter((patient) => {
      const matchesFilter = filter === "all" || (patient.status || "active") === filter;
      const matchesQuery = !query || [patient.name, patient.email, patient.phone_number, patient.focus].some((value) => value?.toLowerCase().includes(query));
      return matchesFilter && matchesQuery;
    });
  }, [data, filter, searchQuery]);

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div id="patients-search" className="relative min-w-[240px] max-w-[380px] flex-1">
          <label htmlFor="patients-search-input" className="sr-only">Search patients</label>
          <Search size={16} strokeWidth={2} className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[var(--nv-faint)]" />
          <Input id="patients-search-input" type="search" placeholder="Search by name, focus, email…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-[42px] rounded-[11px] pl-[38px] text-[13.5px]" />
        </div>

        <div className="ml-auto flex items-center rounded-[10px] border border-border bg-secondary p-[3px]">
          <button type="button" onClick={() => setView("table")} aria-label="Table view" className={`flex h-[30px] w-8 items-center justify-center rounded-[7px] ${view === "table" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><List size={16} /></button>
          <button type="button" onClick={() => setView("cards")} aria-label="Card view" className={`flex h-[30px] w-8 items-center justify-center rounded-[7px] ${view === "cards" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}><LayoutGrid size={16} /></button>
        </div>

        {tutorialCompleted && <Button variant="ghost" size="icon" onClick={replayTutorial} aria-label="Replay tutorial" className="size-10 text-muted-foreground"><HelpCircle size={16} /></Button>}
        <Button id="add-patient-btn" onClick={() => setAddOpen(true)} className="h-[42px] rounded-[11px] px-[15px]"><Plus size={15} strokeWidth={2.4} />Add patient</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item;
          return (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-[12.5px] font-bold capitalize transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:border-primary/50"}`}>
              {item} <span className="font-mono text-[11px] opacity-70">{counts[item]}</span>
            </button>
          );
        })}
      </div>

      <div id="patients-table">
        {view === "table" ? (
          <DataTable columns={columns} data={filteredData} loading={data === undefined} onRowClick={(patient) => router.push(`/patients/${(patient as Patient).id}`)} />
        ) : data === undefined ? (
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-border bg-card" />)}</div>
        ) : filteredData.length ? (
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((patient, index) => (
              <button key={patient.id} type="button" onClick={() => router.push(`/patients/${patient.id}`)} className="rounded-2xl border border-border bg-card p-[18px] text-left shadow-sm transition-all hover:-translate-y-px hover:border-primary">
                <div className="mb-[13px] flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-[13px] text-[15px] font-bold text-white" style={{ background: avatarColors[index % avatarColors.length] }}>{initialsFor(patient.name)}</div>
                  <span className="rounded-full bg-[#e2f1ea] px-2.5 py-1 text-[11px] font-bold text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]">Active</span>
                </div>
                <div className="text-[15px] font-extrabold text-foreground">{patient.name}</div>
                <div className="mb-3.5 truncate text-[12.5px] text-muted-foreground">{patient.focus || patient.email || "General care"}</div>
                <div className="flex justify-between border-t border-border pt-[13px] text-[11.5px]">
                  <div><div className="text-[var(--nv-faint)]">Next</div><div className="mt-0.5 font-mono font-semibold text-foreground/80">{shortDate(patient.next_session)}</div></div>
                  <div className="text-right"><div className="text-[var(--nv-faint)]">Sessions</div><div className="mt-0.5 font-mono font-semibold text-foreground/80">{patient.session_count || 0}</div></div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-sm">No patients match your filters.</div>
        )}
      </div>

      <AddPatient open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
