"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ViewPatientModal } from "@/components/modals/ViewPatientModal";
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
import type { Patient } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "convex/react";
import { ArrowUpDown, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const avatarColors = ["#0E96B8", "#2C8FB0", "#5C8A7A", "#8A6BA8", "#B5803A", "#3F7E8C"];

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatShortDate(value?: string, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function ActionsCell({ patient }: { patient: Patient }) {
  const router = useRouter();
  const softDeletePatient = useMutation(api.trash.softDeletePatient);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRecords, setDeleteRecords] = useState(false);

  const confirmDelete = async () => {
    if (!patient._id) {
      toast.error("Patient record is missing its database ID");
      return;
    }
    try {
      await softDeletePatient({ id: patient._id as Id<"patients">, cascade: deleteRecords });
      toast.success("Patient moved to trash");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete patient");
    } finally {
      setDeleteOpen(false);
    }
  };

  const actionClass = "size-[30px] rounded-lg border border-border bg-card p-0 text-[var(--nv-faint)] shadow-none hover:border-primary hover:bg-primary/10 hover:text-primary";

  return (
    <>
      <div className="flex justify-end gap-1.5" onClick={(event) => event.stopPropagation()}>
        <Button id="action-records" variant="outline" size="icon" className={actionClass} onClick={() => router.push(`/patients/${patient.id}/records`)} title="Open notes and records">
          <FolderOpen size={14} strokeWidth={2} />
        </Button>
        <Button id="action-edit" variant="outline" size="icon" className={actionClass} onClick={() => setEditOpen(true)} title="Edit patient">
          <Pencil size={14} strokeWidth={2} />
        </Button>
        <Button id="action-delete" variant="outline" size="icon" className={`${actionClass} hover:border-[#d2574f] hover:bg-[#f8e5e3] hover:text-[#d2574f]`} onClick={() => setDeleteOpen(true)} title="Delete patient">
          <Trash2 size={14} strokeWidth={2} />
        </Button>
      </div>

      <ViewPatientModal open={editOpen} onOpenChange={setEditOpen} patient={patient} isEditMode />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              {patient.name} will remain recoverable for 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 rounded-[10px] bg-secondary p-3">
            <Checkbox id={`cascade-${patient.id}`} checked={deleteRecords} onCheckedChange={(checked) => setDeleteRecords(Boolean(checked))} />
            <Label htmlFor={`cascade-${patient.id}`} className="text-[12.5px]">Also move associated medical records</Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#d2574f] text-white hover:bg-[#b94741]">Move to trash</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 uppercase">
        Patient <ArrowUpDown size={12} />
      </button>
    ),
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex min-w-[210px] items-center gap-3">
          <div className="flex size-[38px] flex-none items-center justify-center rounded-[11px] text-[13px] font-bold text-white" style={{ background: avatarColors[row.index % avatarColors.length] }}>
            {initialsFor(patient.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-foreground">{patient.name}</div>
            <div className="max-w-[210px] truncate text-[11.5px] text-muted-foreground">{patient.focus || patient.email || "General care"}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <span className="rounded-full bg-[#e2f1ea] px-2.5 py-1 text-[11px] font-bold text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]">{row.original.status === "intake" ? "Intake" : "Active"}</span>,
  },
  {
    accessorKey: "next_session",
    header: "Next session",
    cell: ({ row }) => <span className="font-mono text-[12.5px] text-foreground/80">{formatShortDate(row.original.next_session)}</span>,
  },
  {
    accessorKey: "last_seen",
    header: "Last seen",
    cell: ({ row }) => <span className="font-mono text-[12.5px] text-muted-foreground">{formatShortDate(row.original.last_seen)}</span>,
  },
  {
    accessorKey: "session_count",
    header: "Sessions",
    cell: ({ row }) => <span className="font-mono text-[13px] text-foreground/80">{row.original.session_count || 0}</span>,
  },
  {
    accessorKey: "outstanding_balance",
    header: () => <div className="text-right">Balance</div>,
    cell: ({ row }) => <div className={`text-right font-mono text-[13px] font-semibold ${(row.original.outstanding_balance || 0) > 0 ? "text-[#be7c16]" : "text-foreground/80"}`}>{formatCurrency(row.original.outstanding_balance)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionsCell patient={row.original} />,
  },
];
