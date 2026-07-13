import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { createSubscription } from '@/lib/payments/mercadopago';

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Payments are not configured (missing MERCADOPAGO_ACCESS_TOKEN)' },
      { status: 503 }
    );
  }

  const token = await getToken({ template: 'convex' });
  if (!token) {
    return NextResponse.json({ error: 'Failed to get auth token' }, { status: 401 });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);
  const subscription = await convex.query(api.billing.getSubscription, {});
  if (!subscription) {
    return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
  }
  if (subscription.complimentary) {
    return NextResponse.json(
      { error: 'This account has complimentary access — no subscription needed' },
      { status: 409 }
    );
  }
  // Block double-subscribing only on a real Mercado Pago subscription —
  // migrated therapist docs can carry a stale "active" status with no
  // preapproval behind it.
  if (subscription.status === 'active' && subscription.subscriptionId) {
    return NextResponse.json({ error: 'Subscription is already active' }, { status: 409 });
  }
  if (!subscription.email) {
    return NextResponse.json(
      { error: 'Add a billing email on the Billing page first' },
      { status: 400 }
    );
  }

  const origin = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '');
  // Mercado Pago rejects localhost / non-HTTPS back_urls.
  if (!origin.startsWith('https://')) {
    return NextResponse.json(
      { error: 'Mercado Pago needs a public HTTPS URL to return to — set NEXT_PUBLIC_APP_URL (e.g. your tunnel URL) and restart the dev server' },
      { status: 400 }
    );
  }

  try {
    const preapproval = await createSubscription({
      therapistRef: subscription.therapistRef,
      payerEmail: subscription.email,
      backUrl: `${origin}/billing?mp=return`,
    });
    if (!preapproval.init_point) {
      throw new Error('Mercado Pago did not return a checkout URL');
    }
    return NextResponse.json({ url: preapproval.init_point });
  } catch (error) {
    console.error('Failed to create Mercado Pago subscription:', error);
    return NextResponse.json({ error: 'Could not start the checkout' }, { status: 502 });
  }
}
