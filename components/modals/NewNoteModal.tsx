"use client";

import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { avatarColorFor, initialsFor } from "@/lib/nv";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, List, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPatientId?: string;
}

export function NewNoteModal({ open, onOpenChange, defaultPatientId }: NewNoteModalProps) {
  const router = useRouter();
  const patients = useQuery(api.patients.list) || [];
  const createNote = useMutation(api.medical_history_notes.create);

  const [patientId, setPatientId] = useState(defaultPatientId ?? "");
  const [dateISO, setDateISO] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPatientId(defaultPatientId ?? "");
    setDateISO(new Date().toISOString().slice(0, 10));
    setTitle("");
    setContent("");
  }, [open, defaultPatientId]);

  const selected = patients.find((patient) => patient.id === patientId) ?? patients[0];
  const selectedIndex = Math.max(0, patients.findIndex((patient) => patient.id === selected?.id));

  const save = async () => {
    if (!selected?.id) {
      toast.error("Please select a patient");
      return;
    }
    setSaving(true);
    try {
      await createNote({
        patient_id: selected.id,
        title: title.trim() || "Untitled note",
        description: content.trim().slice(0, 120) || "New clinical note created from the records workspace.",
        date: dateISO || new Date().toISOString().slice(0, 10),
        content: content.trim(),
      });
      toast.success("Note saved");
      onOpenChange(false);
      router.push(`/patients/${selected.id}?tab=notes`);
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const toolSpan = "flex size-7 items-center justify-center rounded-[7px] text-[13px] text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[760px] max-w-[94vw] gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-[22px] py-5 pr-12 text-left">
          <DialogTitle className="text-[17px] font-extrabold text-foreground">New note</DialogTitle>
          <DialogDescription className="mt-[3px] text-[12.5px] text-muted-foreground">Select the patient, then write the clinical record.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-[22px]">
          <div className="grid gap-[13px] sm:grid-cols-[1.35fr_.65fr]">
            <div>
              <label className="mb-[7px] block text-xs font-bold text-foreground/80" htmlFor="note-patient">Patient</label>
              <div className="relative flex items-center gap-[11px] overflow-hidden rounded-[11px] border border-border bg-secondary px-[13px] py-[11px] transition-colors hover:border-primary">
                <div className="flex size-8 flex-none items-center justify-center rounded-[9px] text-xs font-bold text-white" style={{ background: avatarColorFor(selected?.avatar_color, selectedIndex) }}>
                  {selected ? initialsFor(selected.name) : "—"}
                </div>
                <span className="text-[13.5px] font-bold text-foreground">{selected?.name ?? "Select a patient"}</span>
                <ChevronDown size={16} strokeWidth={2} className="ml-auto flex-none text-[var(--nv-faint)]" />
                <select
                  id="note-patient"
                  aria-label="Patient"
                  value={selected?.id ?? ""}
                  onChange={(event) => setPatientId(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-[7px] block text-xs font-bold text-foreground/80" htmlFor="note-date">Date</label>
              <input
                id="note-date"
                type="date"
                value={dateISO}
                onChange={(event) => setDateISO(event.target.value)}
                className="w-full rounded-[10px] border border-border bg-secondary px-3 py-2.5 font-mono text-[13px] text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-secondary px-3.5 py-2.5">
              <span className={`${toolSpan} font-extrabold`}>B</span>
              <span className={`${toolSpan} font-bold italic`}>I</span>
              <span className={toolSpan}><List size={15} strokeWidth={2} /></span>
              <span className={`${toolSpan} text-xs font-extrabold`}>H2</span>
              <span className="ml-auto text-[11.5px] text-muted-foreground">Draft</span>
            </div>
            <div className="px-[22px] py-5">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Note title"
                className="mb-3 w-full border-0 bg-transparent text-[21px] font-extrabold tracking-[-.01em] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the session note, intake summary, treatment update, or clinical record..."
                className="min-h-[210px] w-full resize-y border-0 bg-transparent text-sm leading-[1.65] text-foreground/80 outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-[10px] border border-border bg-card px-[18px] py-2.5 text-[13px] font-bold text-foreground/80">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693] disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}Save note
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
