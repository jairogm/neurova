// Google Calendar integration using Clerk OAuth

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
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  attendees?: Array<{ email: string; displayName?: string }>;
  patient_id?: string; // For Convex session creation
}

// Get upcoming appointments from Google Calendar
export async function getUpcomingAppointments(): Promise<CalendarEvent[]> {
  try {
    const response = await fetch('/api/calendar/events', {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch appointments');
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

// Create appointment in Google Calendar and Convex
export async function createAppointment(data: CreateAppointmentData): Promise<CalendarEvent> {
  try {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create appointment');
    }

    const result = await response.json();
    return result.event;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

// Cancel appointment in Google Calendar
export async function cancelAppointment(eventId: string, _type: unknown): Promise<void> {
  try {
    const response = await fetch(`/api/calendar/events?eventId=${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel appointment');
    }
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
}
