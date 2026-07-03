"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DataTable } from "@/components/data-table";
import { AddPatient } from "@/components/modals/AddPatient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTutorial } from "@/hooks/useTutorial";
import { columns } from "@/lib/columns";
import { avatarColorFor, initialsFor, statusToneFor } from "@/lib/nv";
import type { Patient } from "@/lib/types";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, HelpCircle, LayoutGrid, List, Plus, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const filters = ["all", "active", "intake", "paused", "discharged"] as const;
type Filter = typeof filters[number];

function shortDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function PatientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = useQuery(api.patients.list);
  const softDeletePatient = useMutation(api.trash.softDeletePatient);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const { startPatientsTour, currentTourPage, tutorialCompleted, replayTutorial } = useTutorial();

  useEffect(() => {
    if (searchParams.get("new") === "1") setAddOpen(true);
  }, [searchParams]);

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

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      await softDeletePatient({ id: deleteTarget._id as Id<"patients"> });
      toast.success("Patient moved to trash");
    } catch {
      toast.error("Failed to delete patient");
    } finally {
      setDeleteTarget(null);
    }
  };

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
            <button key={item} type="button" onClick={() => setFilter(item)} className={`flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-[12.5px] font-bold capitalize transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50"}`}>
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
            {filteredData.map((patient, index) => {
              const tone = statusToneFor(patient.status);
              return (
                <div key={patient.id} role="button" tabIndex={0} onClick={() => router.push(`/patients/${patient.id}`)} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/patients/${patient.id}`); }} className="cursor-pointer rounded-2xl border border-border bg-card p-[18px] text-left shadow-sm transition-all hover:-translate-y-px hover:border-primary">
                  <div className="mb-[13px] flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-[13px] text-[15px] font-bold text-white" style={{ background: avatarColorFor(patient.avatar_color, index) }}>{initialsFor(patient.name)}</div>
                    <div className="flex items-center gap-[7px]">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.className}`}>{tone.label}</span>
                      <button
                        type="button"
                        aria-label={`Delete ${patient.name}`}
                        title="Delete patient"
                        onClick={(event) => { event.stopPropagation(); setDeleteTarget(patient as Patient); }}
                        className="flex size-7 items-center justify-center rounded-lg border border-border bg-card text-[var(--nv-faint)] transition-colors hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[15px] font-extrabold text-foreground">{patient.name}</div>
                  <div className="mb-3.5 truncate text-[12.5px] text-muted-foreground">{patient.focus || patient.email || "General care"}</div>
                  <div className="flex justify-between border-t border-border pt-[13px] text-[11.5px]">
                    <div><div className="text-[var(--nv-faint)]">Next</div><div className="mt-0.5 font-mono font-semibold text-foreground/80">{shortDate(patient.next_session)}</div></div>
                    <div className="text-right"><div className="text-[var(--nv-faint)]">Sessions</div><div className="mt-0.5 font-mono font-semibold text-foreground/80">{patient.session_count || 0}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-sm">No patients match your filters.</div>
        )}
      </div>

      <AddPatient open={addOpen} onOpenChange={setAddOpen} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <span className="flex size-[42px] items-center justify-center rounded-[13px] bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]"><AlertTriangle size={20} strokeWidth={2} /></span>
              Move to trash?
            </AlertDialogTitle>
            <AlertDialogDescription>Delete {deleteTarget?.name}? This moves the patient to Trash.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#d2574f] text-white hover:bg-[#b94741]">Move to trash</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Patients() {
  return (
    <Suspense>
      <PatientsContent />
    </Suspense>
  );
}
