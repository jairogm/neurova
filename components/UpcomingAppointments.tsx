"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ScheduleAppointment } from "./modals/ScheduleAppointment";
import { CancelAppointmentModal, type CancelType } from "./modals/CancelAppointmentModal";
import { useAppointments } from "@/hooks/useAppointments";
import { cancelAppointment } from "@/lib/supabase/google-calendar";
import {
  CalendarIcon,
  Clock,
  AlertTriangle,
  RefreshCw,
  Video,
  Edit,
  Trash2,
  Repeat,
  Calendar,

} from "lucide-react";
import { Button } from "./ui/button";

// Type definition for appointment data that could come from different sources
interface AppointmentData {
  id?: string;
  title?: string;
  summary?: string;
  start_time?: string;
  end_time?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  description?: string;
  notes?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  recurrence?: string[];
  recurringEventId?: string; // For individual instances of recurring events
  conferenceData?: {
    conferenceId?: string;
    conferenceSolution?: {
      name?: string;
      type?: string;
    };
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
      label?: string;
    }>;
  };
  htmlLink?: string;
}

export const UpcomingAppointments = () => {
  const { appointments, isLoading, error, refetch } = useAppointments();

  return (
    <Card className="lg:w-2/3 2xl:w-3/4">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AppointmentsSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : appointments && appointments.length > 0 ? (
          <AppointmentsList appointments={appointments} />
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
};

// Loading skeleton component
function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" /> {/* Title */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" /> {/* Date */}
                <Skeleton className="h-4 w-32" /> {/* Time */}
              </div>
              <Skeleton className="h-4 w-full max-w-md" /> {/* Description */}
            </div>
            <Skeleton className="h-6 w-16" /> {/* Status badge */}
          </div>
        </div>
      ))}
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Failed to load appointments
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message ||
            "There was an error loading your appointments. Please try again."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <ScheduleAppointment variant="outline" />
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-12">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          No upcoming appointments
        </h3>
        <p className="text-sm text-muted-foreground">
          Schedule your first appointment to get started.
        </p>
      </div>
      <ScheduleAppointment variant="outline" />
    </div>
  );
}

// Appointments list component
function AppointmentsList({
  appointments,
}: {
  appointments: AppointmentData[];
}) {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleReschedule = (appointmentId: string) => {
    // TODO: Implement reschedule functionality
    console.log("Reschedule appointment:", appointmentId);
  };

  const handleCancelClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (cancelType: CancelType) => {
    console.log('🎯 handleCancelConfirm called with appointment:', selectedAppointment?.id);
    if (!selectedAppointment?.id) {
      console.log('❌ No appointment ID found');
      return;
    }

    try {
      setIsCanceling(true);
      console.log('⏳ Calling cancelAppointment...');
      await cancelAppointment(selectedAppointment.id, cancelType);
      console.log('✅ Appointment cancelled successfully');
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      // Refetch appointments to update the list
      window.location.reload();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      // You could add a toast notification here instead of alert
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment, index) => {
        const startDateTime = getStartDateTime(appointment);
        const endDateTime = getEndDateTime(appointment);
        const recurrence = getRecurrenceDescription(appointment.recurrence);
        const meetingLink = getMeetingLink(appointment);

        return (
          <div
            key={appointment.id || index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
          >
            <div className="space-y-2">
              {/* Header: Patient name as title with date/time and badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <h5 className="font-semibold text-base text-foreground">
                    {appointment.title ||
                      appointment.summary ||
                      "Therapy Session"}
                  </h5>
                </div>

                <div className="flex items-center gap-2">
                  {recurrence && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Repeat className="h-3 w-3" />
                      <span>{recurrence}</span>
                    </div>
                  )}
                  {isToday(startDateTime) && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      Today
                    </span>
                  )}
                </div>
              </div>
              {startDateTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                    {formatAppointmentDate(startDateTime)}
                  </span>
                  <span className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                    {formatAppointmentTime(
                      startDateTime,
                      endDateTime || undefined
                    )}
                  </span>
                </div>
              )}
             

              {/* Description - more compact */}
              {(appointment.description || appointment.notes) && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {appointment.description || appointment.notes}
                </p>
              )}

              {/* Action buttons - more compact */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  {meetingLink && (
                    <Button
                      onClick={() => handleJoinMeeting(meetingLink)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-xs px-3 py-1"
                    >
                      <Video className="h-3 w-3" />
                      Join
                    </Button>
                  )}
                  <Button
                    onClick={() => handleReschedule(appointment.id || "")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-xs px-3 py-1"
                  >
                    <Edit className="h-3 w-3" />
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => handleCancelClick(appointment)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs px-3 py-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
                
              </div>
            </div>
          </div>
        );
      })}
      {appointments.length >= 10 && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Showing next {appointments.length} appointments
          </p>
        </div>
      )}
      
      <CancelAppointmentModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        appointmentTitle={selectedAppointment?.title || selectedAppointment?.summary || "Therapy Session"}
        appointmentDate={selectedAppointment ? formatAppointmentDate(getStartDateTime(selectedAppointment) || "") : ""}
        isRecurring={!!(selectedAppointment?.recurrence || selectedAppointment?.recurringEventId)}
        recurrenceDescription={selectedAppointment?.recurrence ? getRecurrenceDescription(selectedAppointment.recurrence) || undefined : undefined}
        onConfirm={handleCancelConfirm}
        isCanceling={isCanceling}
      />
    </div>
  );
}

// Helper functions
function getStartDateTime(appointment: AppointmentData): string | null {
  return (
    appointment.start_time ||
    appointment.start?.dateTime ||
    appointment.start?.date ||
    null
  );
}

function getEndDateTime(appointment: AppointmentData): string | null {
  return (
    appointment.end_time ||
    appointment.end?.dateTime ||
    appointment.end?.date ||
    null
  );
}

function isToday(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}


function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAppointmentTime(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (endDate) {
    const end = new Date(endDate);
    const endTime = end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  }

  return startTime;
}

function getRecurrenceDescription(recurrence?: string[]): string | null {
  if (!recurrence || recurrence.length === 0) return null;

  const rrule = recurrence[0];
  if (rrule.includes("FREQ=DAILY")) return "Daily";
  if (rrule.includes("FREQ=WEEKLY")) {
    if (rrule.includes("INTERVAL=2")) return "Bi-weekly";
    return "Weekly";
  }
  if (rrule.includes("FREQ=MONTHLY")) return "Monthly";
  if (rrule.includes("FREQ=YEARLY")) return "Yearly";

  return "Recurring";
}

function getMeetingLink(appointment: AppointmentData): string | null {
  if (appointment.conferenceData?.entryPoints) {
    const videoEntry = appointment.conferenceData.entryPoints.find(
      (entry) => entry.entryPointType === "video"
    );
    return videoEntry?.uri || null;
  }
  return null;
}
