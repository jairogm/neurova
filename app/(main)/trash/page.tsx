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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTutorial } from "@/hooks/useTutorial";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, ArrowLeft, FileText, RefreshCcw, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type DeleteTarget = { id: string; type: "patient" | "record"; label: string };

function deletedLabel(value?: number) {
  if (!value) return "Today";
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function TrashPage() {
  const router = useRouter();
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
  const actionClass = "h-8 rounded-lg px-2.5 text-[11.5px] shadow-none";

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[22px] flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-.02em] text-foreground">Trash</h1>
          <p className="mt-1 text-sm text-muted-foreground">Restore items or remove them permanently. Deleted data is retained for 30 days.</p>
        </div>
        <Button id="trash-back-btn" variant="outline" onClick={() => router.back()} className="h-9"><ArrowLeft size={15} />Back</Button>
      </div>

      <div id="trash-tabs" className="grid gap-[18px]">
        <section id="trash-table" className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <div className="flex items-center gap-2.5"><UserRound size={16} className="text-primary" /><h2 className="text-[15px] font-extrabold text-foreground">Patients</h2></div>
            <span className="font-mono text-xs text-muted-foreground">{trashData === undefined ? "—" : patients.length}</span>
          </div>
          {trashData === undefined ? (
            <div className="space-y-2 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : patients.length ? (
            <div>
              {patients.map((patient, index) => (
                <div key={patient._id} className="flex flex-wrap items-center gap-3 border-b border-border px-[18px] py-3.5 last:border-0 hover:bg-secondary sm:flex-nowrap">
                  <div className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-primary/10 text-primary"><UserRound size={16} /></div>
                  <div className="min-w-[180px] flex-1"><div className="truncate text-[13px] font-bold text-foreground">{patient.name}</div><div className="mt-0.5 text-[11px] text-muted-foreground">Deleted {deletedLabel(patient.deleted_at)}</div></div>
                  <div className="ml-auto flex gap-2">
                    <Button id={index === 0 ? "trash-restore-btn" : undefined} variant="outline" className={actionClass} onClick={() => restore(patient._id, "patient")}><RefreshCcw size={13} />Restore</Button>
                    <Button id={index === 0 ? "trash-delete-btn" : undefined} variant="outline" className={`${actionClass} text-[#d2574f] hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]`} onClick={() => setTarget({ id: patient._id, type: "patient", label: patient.name })}><Trash2 size={13} />Delete forever</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">No deleted patients.</div>}
        </section>

        <section className="overflow-hidden rounded-[18px] border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-[18px] py-[15px]">
            <div className="flex items-center gap-2.5"><FileText size={16} className="text-primary" /><h2 className="text-[15px] font-extrabold text-foreground">Records</h2></div>
            <span className="font-mono text-xs text-muted-foreground">{trashData === undefined ? "—" : records.length}</span>
          </div>
          {trashData === undefined ? (
            <div className="space-y-2 p-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : records.length ? (
            <div>
              {records.map((record) => (
                <div key={record._id} className="flex flex-wrap items-center gap-3 border-b border-border px-[18px] py-3.5 last:border-0 hover:bg-secondary sm:flex-nowrap">
                  <div className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-primary/10 text-primary"><FileText size={16} /></div>
                  <div className="min-w-[180px] flex-1"><div className="truncate text-[13px] font-bold text-foreground">{record.title || "Untitled record"}</div><div className="mt-0.5 text-[11px] text-muted-foreground">{record.date || "No date"} · Deleted {deletedLabel(record.deleted_at)}</div></div>
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" className={actionClass} onClick={() => restore(record._id, "record")}><RefreshCcw size={13} />Restore</Button>
                    <Button variant="outline" className={`${actionClass} text-[#d2574f] hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]`} onClick={() => setTarget({ id: record._id, type: "record", label: record.title || "this record" })}><Trash2 size={13} />Delete forever</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">No deleted records.</div>}
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
