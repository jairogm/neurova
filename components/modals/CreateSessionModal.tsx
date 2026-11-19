"use client";
import { useLocale } from "next-intl";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SessionStatus, PaymentStatus } from "@/lib/types";

interface CreateSessionModalProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionModal({
  patientId,
  open,
  onOpenChange,
}: CreateSessionModalProps) {
  const locale = useLocale();
  const tr = useWorkspaceText();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("scheduled");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSession = useMutation(api.sessions.create);

  const resetForm = () => {
    setSelectedDate(undefined);
    setTime("09:00");
    setDuration("60");
    setSessionStatus("scheduled");
    setPaymentStatus("pending");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error(tr("Please select a date"));
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await createSession({
        patient_id: patientId,
        scheduled_date: scheduledDate.toISOString(),
        duration: parseInt(duration),
        session_status: sessionStatus,
        payment_status: paymentStatus,
      });

      toast.success(tr("Session created successfully"));
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : tr("Unknown error");
      toast.error(tr("Failed to create session: ") + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="text-[17px] font-extrabold">{tr("Create session")}</DialogTitle>
          <DialogDescription>{tr("Schedule a new therapy session for this patient")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>{tr("Date *")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? selectedDate.toLocaleDateString(locale, { dateStyle: "long" }) : tr("Pick a date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time">{tr("Time *")}</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">{tr("Duration (minutes) *")}</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">{tr("30 minutes")}</SelectItem>
                <SelectItem value="45">{tr("45 minutes")}</SelectItem>
                <SelectItem value="60">{tr("60 minutes")}</SelectItem>
                <SelectItem value="90">{tr("90 minutes")}</SelectItem>
                <SelectItem value="120">{tr("120 minutes")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Status */}
          <div className="space-y-2">
            <Label>{tr("Session Status")}</Label>
            <Select value={sessionStatus} onValueChange={(value) => setSessionStatus(value as SessionStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">{tr("Scheduled")}</SelectItem>
                <SelectItem value="completed">{tr("Completed")}</SelectItem>
                <SelectItem value="cancelled">{tr("Cancelled")}</SelectItem>
                <SelectItem value="rescheduled">{tr("Rescheduled")}</SelectItem>
                <SelectItem value="no_show">{tr("No Show")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label>{tr("Payment Status")}</Label>
            <Select value={paymentStatus} onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{tr("Pending")}</SelectItem>
                <SelectItem value="paid">{tr("Paid")}</SelectItem>
                <SelectItem value="partially_paid">{tr("Partially Paid")}</SelectItem>
                <SelectItem value="refunded">{tr("Refunded")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >{tr("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tr("Creating...") : tr("Create Session")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
