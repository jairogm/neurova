"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteSessionModal({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteSessionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="text-[17px] font-extrabold">Delete session?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this session? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#d2574f] text-white hover:bg-[#b94741]"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
