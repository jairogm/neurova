import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { cancelPreapproval } from '@/lib/payments/mercadopago';

export async function POST(_req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken({ template: 'convex' });
  if (!token) {
    return NextResponse.json({ error: 'Failed to get auth token' }, { status: 401 });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);
  const subscription = await convex.query(api.billing.getSubscription, {});
  if (!subscription?.subscriptionId) {
    return NextResponse.json({ error: 'No subscription to cancel' }, { status: 404 });
  }

  try {
    const cancelled = await cancelPreapproval(subscription.subscriptionId);
    // Reflect it immediately; the webhook will confirm the same state.
    await convex.mutation(api.billing.applySubscriptionUpdate, {
      secret: process.env.BILLING_WEBHOOK_SECRET ?? '',
      therapistRef: subscription.therapistRef,
      subscriptionId: String(cancelled.id),
      status: 'cancelled',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel Mercado Pago subscription:', error);
    return NextResponse.json({ error: 'Could not cancel the subscription' }, { status: 502 });
  }
}
