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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-900">Cancel Appointment</DialogTitle>
              <DialogDescription className="text-red-700">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600">
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
              <div className="flex items-center gap-1 mt-2 text-sm text-purple-700">
                <Repeat className="h-4 w-4" />
                <span>This is a {recurrenceDescription?.toLowerCase() || "recurring"} appointment</span>
              </div>
            )}
          </div>

          {isRecurring && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">What would you like to cancel?</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelType"
                    value="single"
                    checked={cancelType === "single"}
                    onChange={(e) => setCancelType(e.target.value as CancelType)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Just this appointment</div>
                    <div className="text-xs text-gray-500">Cancel only this occurrence on {appointmentDate}</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelType"
                    value="series"
                    checked={cancelType === "series"}
                    onChange={(e) => setCancelType(e.target.value as CancelType)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">This and all future appointments</div>
                    <div className="text-xs text-gray-500">Cancel the entire {recurrenceDescription?.toLowerCase() || "recurring"} series</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">
            All attendees will be notified about the cancellation.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isCanceling}
            className="bg-red-600 hover:bg-red-700"
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