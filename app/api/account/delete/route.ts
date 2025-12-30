import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function DELETE(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Clerk JWT token for Convex authentication
    const token = await getToken({ template: 'convex' });
    if (!token) {
      return NextResponse.json({ error: 'Failed to get auth token' }, { status: 401 });
    }

    // Create authenticated Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    convex.setAuth(token);

    // Delete all data from Convex (patients, sessions, medical notes, therapist profile)
    await convex.mutation(api.therapists.deleteAllData, {});

    // Delete user from Clerk
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
