"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { addOneHour } from "@/lib/utils";
import { toast } from "sonner";
import { RecurrenceType } from "@/lib/types";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AddPatient } from "./AddPatient";
import { useAppointments } from "@/hooks/useAppointments";

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const totalMinutes = i * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
  return { value: time, label: displayTime };
});

export const ScheduleAppointment = ({ variant }: { variant?: "outline" | "topbar" }) => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(() => {
    const defaultStartTime = "09:00";
    return {
      patient_id: "",
      title: "",
      start_time: defaultStartTime,
      end_time: addOneHour(defaultStartTime),
      notes: "",
      is_recurring: false,
      recurrence_type: "weekly" as RecurrenceType,
      recurrence_end_date: "",
    };
  });

  // Query for patients
  const patients = useConvexQuery(api.patients.list) || [];
  const isLoadingPatients = patients === undefined;
  // Use the appointments hook for creating appointments
  const { createAppointment, isCreating, createError, createSuccess } = useAppointments();

  // Handle success/error states
  useEffect(() => {
    if (createSuccess) {
      toast.success("Appointment scheduled successfully!");
      setOpen(false);
      // Reset form
      const defaultStartTime = "09:00";
      setFormData({
        patient_id: "",
        title: "",
        start_time: defaultStartTime,
        end_time: addOneHour(defaultStartTime),
        notes: "",
        is_recurring: false,
        recurrence_type: "weekly",
        recurrence_end_date: "",
      });
      setSelectedDate(undefined);
    }
  }, [createSuccess]);

  useEffect(() => {
    if (createError) {
      toast.error("Failed to schedule appointment. Please try again.");
    }
  }, [createError]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const defaultStartTime = "09:00";
      setFormData({
        patient_id: "",
        title: "",
        start_time: defaultStartTime,
        end_time: addOneHour(defaultStartTime),
        notes: "",
        is_recurring: false,
        recurrence_type: "weekly",
        recurrence_end_date: "",
      });
      setSelectedDate(undefined);
    }
  }, [open]);

  const handleSave = () => {
    // Validation
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter an appointment title");
      return;
    }
    if (formData.start_time >= formData.end_time) {
      toast.error("End time must be after start time");
      return;
    }
    if (formData.is_recurring && !formData.recurrence_end_date) {
      toast.error("Please select an end date for recurring appointments");
      return;
    }

    // Find the selected patient
    const selectedPatient = patients.find((p) => p.id === formData.patient_id);
    if (!selectedPatient) {
      toast.error("Selected patient not found");
      return;
    }

    // Combine date and time to create proper datetime strings with timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Create datetime strings in the format Google Calendar expects
    const startDateTime = `${dateStr}T${formData.start_time}:00`;
    const endDateTime = `${dateStr}T${formData.end_time}:00`;

    const appointmentData = {
      summary: formData.title,
      description: formData.notes,
      start: {
        dateTime: startDateTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone,
      },
      attendees: selectedPatient?.email ? [{
        email: selectedPatient.email,
        displayName: selectedPatient.name,
      }] : undefined,
      // Include recurrence information
      isRecurring: formData.is_recurring,
      recurrenceType: formData.is_recurring ? formData.recurrence_type : undefined,
      recurrenceEndDate: formData.is_recurring ? formData.recurrence_end_date : undefined,
      // Include patient_id for session creation
      patient_id: formData.patient_id,
    };

    createAppointment(appointmentData);
  };

  const selectedPatient = patients.find((p) => p.id === formData.patient_id);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={
            variant === "topbar"
              ? "flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border-0 bg-primary px-3.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693]"
              : variant === "outline"
                ? "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary px-4 text-primary hover:bg-primary/10 hover:text-primary"
                : "flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary bg-primary px-4 text-white hover:bg-primary/90 hover:text-white"
          }
        >
          <CalendarIcon
            className={variant === "outline" ? "text-primary" : "text-current"}
            size={variant === "topbar" ? 16 : 20}
          />
          <span className={variant === "topbar" ? "hidden xl:inline" : undefined}>
            {variant === "topbar" ? "New appointment" : "Schedule Appointment"}
          </span>
        </DialogTrigger>

        <DialogContent className="max-h-[92vh] max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pr-12">
            <div className="flex items-start gap-3">
              <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarIcon size={18} /></span>
              <div><DialogTitle className="text-[17px] font-extrabold">Schedule appointment</DialogTitle><DialogDescription className="mt-1 text-[12.5px]">Syncs to Google Calendar automatically.</DialogDescription></div>
            </div>
          </DialogHeader>

          <div className="max-h-[calc(92vh-150px)] space-y-5 overflow-y-auto px-6 py-5">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              {isLoadingPatients ? (
                <div className="text-sm text-gray-500">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="space-y-3 rounded-xl border border-dashed border-border bg-secondary p-4 text-center">
                  <div className="flex items-center justify-center text-gray-400">
                    <Users className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-gray-600">
                    No patients found. Please create a patient first to schedule
                    appointments.
                  </p>
                  <Button
                    onClick={() => setIsAddPatientOpen(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Patient
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, patient_id: value }))
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a patient">
                        {selectedPatient && (
                          <span className="flex items-center space-x-2">
                            <span>{selectedPatient.name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {selectedPatient.email}
                            </span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span>{patient.name}</span>
                            <span className="text-xs text-gray-500">
                              {patient.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddPatientOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Appointment Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Initial Consultation, Follow-up Session"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(year, month - 1, day));
                  } else {
                    setSelectedDate(undefined);
                  }
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full"
              />
            </div>

            {/* Time Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_time: value,
                      end_time: addOneHour(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Select
                  value={formData.end_time}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, end_time: value }))
                  }
                >
                  <SelectTrigger>
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_recurring: checked }))
                }
              />
              <Label htmlFor="recurring">Recurring appointment</Label>
            </div>

            {/* Recurrence Options */}
            {formData.is_recurring && (
              <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="space-y-2">
                  <Label>Repeat every</Label>
                  <Select
                    value={formData.recurrence_type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        recurrence_type: value as RecurrenceType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={formData.recurrence_end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        recurrence_end_date: e.target.value,
                      }))
                    }
                    min={
                      selectedDate
                        ? format(selectedDate, "yyyy-MM-dd")
                        : undefined
                    }
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes for this appointment..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={patients.length === 0 || isCreating}
            >
              {isCreating ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddPatient open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} />
    </>
  );
};
