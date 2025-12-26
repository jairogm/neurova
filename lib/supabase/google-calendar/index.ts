// services/calendarService.ts

export interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

export interface CreateAppointmentData {
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  // ... other fields
}

// Stub functions that do nothing or return empty
export async function getUpcomingAppointments(): Promise<CalendarEvent[]> {
  console.warn("Google Calendar integration is temporarily disabled during migration.");
  return [];
}

export async function createAppointment(data: any): Promise<any> {
  console.warn("createAppointment is disabled.");
  throw new Error("Calendar integration disabled");
}

export async function cancelAppointment(id: string, type: any): Promise<void> {
  console.warn("cancelAppointment is disabled.");
}