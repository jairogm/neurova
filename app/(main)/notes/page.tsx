"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { NewNoteModal } from "@/components/modals/NewNoteModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { avatarColorFor, initialsFor } from "@/lib/nv";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotesPage() {
  const notes = useQuery(api.medical_history_notes.listAllForTherapist);
  const softDeleteRecord = useMutation(api.trash.softDeleteRecord);
  const [addOpen, setAddOpen] = useState(false);

  const removeNote = async (id: string) => {
    try {
      await softDeleteRecord({ id: id as Id<"medical_history_notes"> });
      toast.success("Record moved to trash");
    } catch {
      toast.error("Failed to delete record");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-[18px] flex items-start justify-between gap-4">
        <div><h1 className="text-[24px] font-extrabold tracking-[-.02em] text-foreground">Notes & records</h1><p className="mt-1 text-[13.5px] text-muted-foreground">All clinical records across your caseload.</p></div>
        <Button onClick={() => setAddOpen(true)} className="h-[42px] rounded-[11px] px-[15px]"><Plus size={15} strokeWidth={2.4} />New note</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid min-w-[760px] grid-cols-[2fr_1.2fr_1fr_.8fr_.8fr] gap-3 border-b border-border bg-secondary px-5 py-[11px] text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground">
          <div>Record</div><div>Patient</div><div>Date</div><div>Words</div><div className="text-right">Actions</div>
        </div>
        {notes === undefined ? (
          <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
        ) : notes.length ? notes.map((note, index) => (
          <div key={String(note._id)} className="grid min-w-[760px] grid-cols-[2fr_1.2fr_1fr_.8fr_.8fr] items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 hover:bg-secondary">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-extrabold text-foreground">{note.title || "Untitled record"}</div>
              <div className="truncate text-xs text-muted-foreground">{note.description || note.plainText || "Clinical note"}</div>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-[30px] flex-none items-center justify-center rounded-[9px] text-[11px] font-bold text-white" style={{ background: avatarColorFor(note.patientColor, index) }}>{note.patientInitials || initialsFor(note.patientName)}</span>
              <span className="truncate text-[12.5px] font-bold text-foreground/80">{note.patientName}</span>
            </div>
            <div className="font-mono text-[12.5px] text-foreground/80">{dateLabel(note.date)}</div>
            <div className="font-mono text-[12.5px] text-muted-foreground">{note.wordCount ?? 0} words</div>
            <div className="flex justify-end gap-[7px]">
              <Button asChild variant="outline" className="h-[30px] rounded-lg px-3 text-[11.5px] font-bold text-primary shadow-none">
                <Link href={`/patients/${note.patient_id}?tab=notes`}>Open</Link>
              </Button>
              <button
                type="button"
                onClick={() => removeNote(String(note._id))}
                aria-label="Delete record"
                className="flex size-[30px] items-center justify-center rounded-lg border border-border bg-card text-[var(--nv-faint)] transition-colors hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )) : <div className="px-6 py-14 text-center text-sm text-muted-foreground">No records yet.</div>}
      </div>

      <NewNoteModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
