"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeletePatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeletePatientModal({
  open,
  onOpenChange,
  patientName,
  onConfirm,
  isDeleting = false,
}: DeletePatientModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[420px] max-w-[94vw] gap-0 overflow-hidden p-0">
        <div className="p-[22px]">
          <div className="mb-3.5 flex size-[42px] items-center justify-center rounded-[13px] bg-[#f8e5e3] text-[#d2574f] dark:bg-[#3a1f1d] dark:text-[#e0726a]">
            <AlertTriangle size={20} strokeWidth={2} />
          </div>
          <DialogTitle className="mb-1.5 text-[17px] font-extrabold text-foreground">Move to trash?</DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.55] text-muted-foreground">
            Delete {patientName}? This moves the patient to Trash.
          </DialogDescription>
        </div>
        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-[10px] border border-border bg-card px-[15px] py-[9px] text-[13px] font-bold text-foreground/80"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-[10px] bg-[#d2574f] px-[15px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-[#b94741] disabled:opacity-60"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}Move to trash
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
