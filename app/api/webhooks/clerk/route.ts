import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Loops API configuration
const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_LIST_ID = process.env.LOOPS_LIST_ID;

/**
 * Add a contact to Loops email audience
 */
async function addContactToLoops(email: string, firstName?: string, lastName?: string) {
  if (!LOOPS_API_KEY) {
    console.warn('Loops API key not configured, skipping email subscription');
    return;
  }

  try {
    const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        source: 'google_signin',
        mailingLists: LOOPS_LIST_ID ? { [LOOPS_LIST_ID]: true } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to add contact to Loops:', errorData);
      return;
    }

    console.log(`Successfully added ${email} to Loops audience`);
  } catch (error) {
    console.error('Error adding contact to Loops:', error);
  }
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address || '';

    // Create therapist profile in Convex
    try {
      await convex.mutation(api.therapists.createFromClerk, {
        clerk_user_id: id,
        email,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || 'New Therapist',
      });

      console.log(`Created therapist profile for user ${id}`);
    } catch (error) {
      console.error('Error creating therapist profile:', error);
    }

    // Add user to Loops email audience
    if (email) {
      await addContactToLoops(email, first_name || undefined, last_name || undefined);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Update therapist profile in Convex
    try {
      await convex.mutation(api.therapists.updateFromClerk, {
        clerk_user_id: id,
        email: email_addresses[0]?.email_address || '',
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || 'New Therapist',
      });

      console.log(`Updated therapist profile for user ${id}`);
    } catch (error) {
      console.error('Error updating therapist profile:', error);
    }
  }

  return new Response('', { status: 200 });
}
