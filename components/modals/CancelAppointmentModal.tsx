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
import { Trash2, AlertTriangle, Repeat } from "lucide-react";
import { useState } from "react";

export type CancelType = "single" | "series";

interface CancelAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentTitle: string;
  appointmentDate: string;
  isRecurring?: boolean;
  recurrenceDescription?: string;
  onConfirm: (cancelType: CancelType) => void;
  isCanceling?: boolean;
}

export function CancelAppointmentModal({
  open,
  onOpenChange,
  appointmentTitle,
  appointmentDate,
  isRecurring = false,
  recurrenceDescription,
  onConfirm,
  isCanceling = false,
}: CancelAppointmentModalProps) {
  const [cancelType, setCancelType] = useState<CancelType>("single");
  
  const handleConfirm = () => {
    onConfirm(cancelType);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <div className="flex items-center gap-3">
            <div className="rounded-[10px] bg-[#f8e5e3] p-2.5">
              <AlertTriangle className="size-5 text-[#d2574f]" />
            </div>
            <div>
              <DialogTitle className="text-[17px] font-extrabold text-foreground">Cancel appointment?</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="text-[13px] text-foreground/80">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-current">{appointmentTitle}</span>
              {appointmentDate && (
                <>
                  {" "}on{" "}
                  <span className="font-semibold text-current">{appointmentDate}</span>
                </>
              )}?
            </p>
            {isRecurring && (
              <div className="mt-2 flex items-center gap-1 text-[12px] text-primary">
                <Repeat className="h-4 w-4" />
                <span>This is a {recurrenceDescription?.toLowerCase() || "recurring"} appointment</span>
              </div>
            )}
          </div>

          {isRecurring && (
            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-foreground">What would you like to cancel?</p>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center space-x-3 rounded-[10px] border border-border bg-secondary p-3">
                  <input
                    type="radio"
                    name="cancelType"
                    value="single"
                    checked={cancelType === "single"}
                    onChange={(e) => setCancelType(e.target.value as CancelType)}
                    className="size-4 accent-[#0e96b8]"
                  />
                  <div className="flex-1">
                    <div className="text-[12.5px] font-bold text-foreground">Just this appointment</div>
                    <div className="text-[11px] text-muted-foreground">Cancel only this occurrence on {appointmentDate}</div>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center space-x-3 rounded-[10px] border border-border bg-secondary p-3">
                  <input
                    type="radio"
                    name="cancelType"
                    value="series"
                    checked={cancelType === "series"}
                    onChange={(e) => setCancelType(e.target.value as CancelType)}
                    className="size-4 accent-[#0e96b8]"
                  />
                  <div className="flex-1">
                    <div className="text-[12.5px] font-bold text-foreground">This and all future appointments</div>
                    <div className="text-[11px] text-muted-foreground">Cancel the entire {recurrenceDescription?.toLowerCase() || "recurring"} series</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <p className="text-[12px] text-muted-foreground">
            All attendees will be notified about the cancellation.
          </p>
        </div>

        <DialogFooter className="gap-2 border-t border-border px-6 py-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            Keep Appointment
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCanceling}
            className="bg-[#d2574f] text-white hover:bg-[#b94741]"
          >
            {isCanceling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Canceling...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Appointment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
