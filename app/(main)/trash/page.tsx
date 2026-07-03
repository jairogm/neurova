"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorial } from "@/hooks/useTutorial";
import { avatarColorFor, initialsFor } from "@/lib/nv";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DeleteTarget = { id: string; type: "patient" | "record"; label: string };

function deletedLabel(value?: number) {
  if (!value) return "today";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const restoreClass = "rounded-lg border border-border bg-card px-[11px] py-[7px] text-[11.5px] font-bold text-primary transition-colors hover:border-primary hover:bg-primary/10";
const deleteClass = "rounded-lg border border-[#d2574f] bg-[#f8e5e3] px-[11px] py-[7px] text-[11.5px] font-bold text-[#d2574f] transition-colors hover:bg-[#f3d3d0] dark:border-[#e0726a] dark:bg-[#3a1f1d] dark:text-[#e0726a]";

export default function TrashPage() {
  const trashData = useQuery(api.trash.listTrash);
  const restorePatient = useMutation(api.trash.restorePatient);
  const restoreRecord = useMutation(api.trash.restoreRecord);
  const deletePatient = useMutation(api.trash.permanentDeletePatient);
  const deleteRecord = useMutation(api.trash.permanentDeleteRecord);
  const { startTrashTour, currentTourPage } = useTutorial();
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    if (currentTourPage !== "patients") return;
    const timer = window.setTimeout(startTrashTour, 800);
    return () => window.clearTimeout(timer);
  }, [currentTourPage, startTrashTour]);

  const restore = async (id: string, type: "patient" | "record") => {
    try {
      if (type === "patient") await restorePatient({ id: id as Id<"patients"> });
      else await restoreRecord({ id: id as Id<"medical_history_notes"> });
      toast.success(`${type === "patient" ? "Patient" : "Record"} restored`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to restore item";
      toast.error(message.includes("Cannot restore record") ? "Restore the patient before restoring this record." : message);
    }
  };

  const permanentlyDelete = async () => {
    if (!target) return;
    try {
      if (target.type === "patient") await deletePatient({ id: target.id as Id<"patients"> });
      else await deleteRecord({ id: target.id as Id<"medical_history_notes"> });
      toast.success(`${target.type === "patient" ? "Patient" : "Record"} permanently deleted`);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setTarget(null);
    }
  };

  const patients = trashData?.patients || [];
  const records = trashData?.records || [];

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[18px] flex items-center gap-[13px]">
        <span className="flex size-[42px] flex-none items-center justify-center rounded-[13px] bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]"><Trash2 size={20} strokeWidth={1.9} /></span>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-.02em] text-foreground">Trash</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">Deleted patients and records stay here before permanent removal.</p>
        </div>
      </div>

      <div id="trash-tabs" className="grid items-start gap-[18px] lg:grid-cols-2">
        <section id="trash-table" className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <h2 className="text-[15px] font-extrabold text-foreground">Patients</h2>
            <span className="font-mono text-xs text-muted-foreground">{trashData === undefined ? "—" : patients.length}</span>
          </div>
          {trashData === undefined ? (
            <div className="space-y-2 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : patients.length ? patients.map((patient, index) => (
            <div key={patient._id} className="flex items-center gap-3 border-b border-border px-[18px] py-[13px] last:border-0">
              <div className="flex size-9 flex-none items-center justify-center rounded-[11px] text-xs font-bold text-white" style={{ background: avatarColorFor(patient.avatar_color, index) }}>{initialsFor(patient.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-extrabold text-foreground">{patient.name}</div>
                <div className="text-[11.5px] text-muted-foreground">Deleted {deletedLabel(patient.deleted_at)}</div>
              </div>
              <button id={index === 0 ? "trash-restore-btn" : undefined} type="button" className={restoreClass} onClick={() => restore(patient._id, "patient")}>Restore</button>
              <button id={index === 0 ? "trash-delete-btn" : undefined} type="button" className={deleteClass} onClick={() => setTarget({ id: patient._id, type: "patient", label: patient.name })}>Delete</button>
            </div>
          )) : <div className="px-6 py-[34px] text-center text-[13px] text-muted-foreground">No deleted patients.</div>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <h2 className="text-[15px] font-extrabold text-foreground">Records</h2>
            <span className="font-mono text-xs text-muted-foreground">{trashData === undefined ? "—" : records.length}</span>
          </div>
          {trashData === undefined ? (
            <div className="space-y-2 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : records.length ? records.map((record) => (
            <div key={record._id} className="flex items-center gap-3 border-b border-border px-[18px] py-[13px] last:border-0">
              <div className="flex size-9 flex-none items-center justify-center rounded-[11px] bg-primary/10 text-[13px] font-extrabold text-primary">N</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-extrabold text-foreground">{record.title || "Untitled record"}</div>
                <div className="truncate text-[11.5px] text-muted-foreground">{record.patientName} · deleted {deletedLabel(record.deleted_at)}</div>
              </div>
              <button type="button" className={restoreClass} onClick={() => restore(record._id, "record")}>Restore</button>
              <button type="button" className={deleteClass} onClick={() => setTarget({ id: record._id, type: "record", label: record.title || "this record" })}>Delete</button>
            </div>
          )) : <div className="px-6 py-[34px] text-center text-[13px] text-muted-foreground">No deleted records.</div>}
        </section>
      </div>

      <AlertDialog open={Boolean(target)} onOpenChange={(open) => { if (!open) setTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground"><span className="flex size-9 items-center justify-center rounded-[10px] bg-[#f8e5e3] text-[#d2574f]"><AlertTriangle size={17} /></span>Delete forever?</AlertDialogTitle>
            <AlertDialogDescription>{target?.label} will be permanently removed. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={permanentlyDelete} className="bg-[#d2574f] text-white hover:bg-[#b94741]">Delete forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
