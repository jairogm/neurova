import { auth, clerkClient } from '@clerk/nextjs/server';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const CALENDAR_NAME = 'Neurova Appointments';
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to get Google Calendar client with user's OAuth token
async function getCalendarClient(userId: string) {
  try {
    // Get OAuth token from Clerk (async in v5)
    const clerk = await clerkClient();
    let tokenResponse;
    try {
      tokenResponse = await clerk.users.getUserOauthAccessToken(
        userId,
        'oauth_google'
      );
    } catch (tokenError: any) {
      console.error('Error fetching OAuth token:', JSON.stringify(tokenError, null, 2));
      // If the error suggests the account isn't connected (often 422), we should treat it as such
      if (tokenError.status === 422) {
         throw new Error('Google account not connected. Please connect your Google account in your profile settings.');
      }
      throw tokenError;
    }

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

// Find or create the Neurova Appointments calendar, using Convex to cache the ID
async function getOrCreateNeurovaCalendar(
  calendar: any, 
  userId: string, 
  userInfo?: { email?: string; fullName?: string }
): Promise<string> {
  try {
    // Step 1: Check if we have a stored calendar ID in Convex
    const storedCalendarId = await convex.query(api.calendar.getCalendarIdByClerkId, {
      clerkUserId: userId,
    });

    if (storedCalendarId) {
      // Verify the calendar still exists in Google Calendar
      try {
        await calendar.calendars.get({ calendarId: storedCalendarId });
        console.log('Using stored Neurova calendar:', storedCalendarId);
        return storedCalendarId;
      } catch (error: any) {
        // Calendar was deleted from Google, we'll create a new one
        console.log('Stored calendar not found in Google, will create new one');
      }
    }

    // Step 2: Try to find existing calendar by listing (in case it exists but wasn't stored)
    try {
      const calendarList = await calendar.calendarList.list({
        minAccessRole: 'owner',
      });
      
      const neurovaCalendar = calendarList.data.items?.find(
        (cal: any) => cal.summary === CALENDAR_NAME
      );
      
      if (neurovaCalendar) {
        console.log('Found existing Neurova calendar:', neurovaCalendar.id);
        // Store the found calendar ID in Convex for future use
        await convex.mutation(api.calendar.setCalendarIdByClerkId, {
          clerkUserId: userId,
          calendarId: neurovaCalendar.id,
          email: userInfo?.email,
          fullName: userInfo?.fullName,
        });
        return neurovaCalendar.id;
      }
    } catch (listError) {
      console.log('Could not list calendars:', listError);
    }

    // Step 3: No existing calendar found, create a new one
    console.log('Creating new Neurova calendar');
    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary: CALENDAR_NAME,
        description: 'Calendar for Neurova therapy appointments',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    const calendarId = newCalendar.data.id;
    console.log('Created new calendar:', calendarId);

    // Store the new calendar ID in Convex
    await convex.mutation(api.calendar.setCalendarIdByClerkId, {
      clerkUserId: userId,
      calendarId: calendarId,
      email: userInfo?.email,
      fullName: userInfo?.fullName,
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

    // Get user info from Clerk for potential therapist profile creation
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userInfo = {
      email: user.emailAddresses[0]?.emailAddress,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    };

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId, userInfo);

    // Get events from now onwards
    console.log('Listing events for calendar:', calendarId);
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });
      console.log('Events found:', response.data.items?.length);
      return NextResponse.json({ events: response.data.items || [] });
    } catch (googleError: any) {
      console.error('Google API Error details:', googleError.errors);
      throw googleError;
    }

  } catch (error: any) {
    console.error('Error listing events:', error);
    // Return the specific status code if available (e.g. from Google API)
    const status = error.code && typeof error.code === 'number' ? error.code : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to list events', details: error },
      { status }
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

    // Get user info from Clerk for potential therapist profile creation
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userInfo = {
      email: user.emailAddresses[0]?.emailAddress,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    };

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId, userInfo);

    // Create event with Google Meet
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

    // Get user info from Clerk for potential therapist profile creation
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userInfo = {
      email: user.emailAddresses[0]?.emailAddress,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    };

    const calendar = await getCalendarClient(userId);
    const calendarId = await getOrCreateNeurovaCalendar(calendar, userId, userInfo);

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
