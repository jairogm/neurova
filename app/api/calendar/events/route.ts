import { auth, clerkClient } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const CALENDAR_NAME = 'Neurova Appointments';

// Helper to get Google Calendar client with user's OAuth token
async function getCalendarClient(userId: string) {
  try {
    // Get OAuth token from Clerk (async in v5)
    const clerk = await clerkClient();
    const tokenResponse = await clerk.users.getUserOauthAccessToken(
      userId,
      'oauth_google'
    );

    if (!tokenResponse || tokenResponse.data.length === 0) {
      throw new Error('No Google OAuth token found. Please connect your Google account in your profile settings.');
    }

    const token = tokenResponse.data[0].token;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    // Create calendar client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    return calendar;
  } catch (error) {
    console.error('Error getting calendar client:', error);
    throw error;
  }
}

// Find or create the Neurova Appointments calendar
async function getOrCreateNeurovaCalendar(calendar: any, userId: string) {
  try {
    // First, check if we have the calendar ID stored in Convex
    const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify({
        path: 'calendar:getCalendarId',
        args: {},
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.value) {
        // We have a stored calendar ID, use it
        return data.value;
      }
    }

    // No stored ID, try to create a new calendar
    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: CALENDAR_NAME,
        description: 'Calendar for Neurova therapy appointments',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    const calendarId = newCalendar.data.id;

    // Store the calendar ID in Convex for future use
    await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify({
        path: 'calendar:setCalendarId',
        args: { calendarId },
      }),
    });

    return calendarId;
  } catch (error) {
    console.error('Error getting/creating calendar:', error);
    throw error;
  }
}

// GET - List upcoming appointments
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId);

    // Get events from now onwards
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ events: response.data.items || [] });
  } catch (error: any) {
    console.error('Error listing events:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list events' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { summary, description, start, end, attendees } = body;

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId);

    // Create event
    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1, // Enable Google Meet
      requestBody: {
        summary,
        description,
        start,
        end,
        attendees: attendees?.map((a: any) => ({
          email: a.email,
          displayName: a.displayName,
        })),
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
      sendUpdates: 'all', // Send email invites to attendees
    });

    return NextResponse.json({ event: event.data });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId);

    // Delete event
    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify attendees
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete event' },
      { status: 500 }
    );
  }
}
