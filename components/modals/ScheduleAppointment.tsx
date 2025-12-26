"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn, addOneHour } from "@/lib/utils";
import { toast } from "sonner";
import { Patient, RecurrenceType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/lib/supabase/getPatients";
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

export const ScheduleAppointment = ({ variant }: { variant?: string }) => {
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
  const { data: patients = [], isLoading: patientsLoading } = useQuery<
    Patient[]
  >({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

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
            variant
              ? `border-sky-500 text-sky-600 hover:text-sky-600 w-full border rounded-md items-center flex justify-center gap-2 p-2 max-w-64 hover:bg-sky-100`
              : `bg-sky-600 border-sky-600 text-white w-full hover:bg-sky-500 hover:text-white rounded-md flex items-center justify-center p-2 gap-2 `
          }
        >
          <CalendarIcon
            className={variant ? `text-sky-600` : `text-white `}
            size={20}
          />
          Schedule Appointment
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Schedule Appointment</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              {patientsLoading ? (
                <div className="text-sm text-gray-500">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="border rounded-lg p-4 text-center space-y-3">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-4 pl-6 border-l-2 border-sky-200">
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

          <DialogFooter>
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
