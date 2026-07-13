import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import {
  SUBSCRIPTION_PLAN,
  formatCOP,
  getAuthorizedPayment,
  getPreapproval,
  mapPreapprovalStatus,
  verifyWebhookSignature,
} from '@/lib/payments/mercadopago';

// Mercado Pago webhook — the source of truth for subscription state.
// MP retries deliveries, so every handler below must stay idempotent.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: { type?: string; data?: { id?: string | number } } = {};
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    // Signature check below rejects malformed deliveries.
  }

  const dataId =
    req.nextUrl.searchParams.get('data.id') ??
    (body.data?.id !== undefined ? String(body.data.id) : null);

  const valid = verifyWebhookSignature({
    xSignature: req.headers.get('x-signature'),
    xRequestId: req.headers.get('x-request-id'),
    dataId,
  });
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const type = body.type ?? req.nextUrl.searchParams.get('type');
  if (!dataId || !type) {
    return NextResponse.json({ received: true });
  }

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const secret = process.env.BILLING_WEBHOOK_SECRET ?? '';

  try {
    if (type === 'subscription_preapproval') {
      // Subscription created / authorized / paused / cancelled.
      const preapproval = await getPreapproval(dataId);
      if (preapproval.external_reference) {
        await convex.mutation(api.billing.applySubscriptionUpdate, {
          secret,
          therapistRef: preapproval.external_reference,
          subscriptionId: String(preapproval.id),
          status: mapPreapprovalStatus(preapproval.status),
          ...(preapproval.next_payment_date ? { expiresAt: preapproval.next_payment_date } : {}),
        });
      }
    } else if (type === 'subscription_authorized_payment') {
      // A recurring charge was attempted; record it and extend the plan on success.
      const charge = await getAuthorizedPayment(dataId);
      const preapproval = await getPreapproval(charge.preapproval_id);
      const therapistRef = charge.external_reference ?? preapproval.external_reference;
      if (therapistRef) {
        const paid =
          charge.payment?.status === 'approved' || charge.status === 'processed';
        await convex.mutation(api.billing.recordSubscriptionPayment, {
          secret,
          therapistRef,
          paymentId: String(charge.payment?.id ?? charge.id),
          amount: formatCOP(charge.transaction_amount ?? SUBSCRIPTION_PLAN.amountCOP),
          status: paid ? 'Paid' : 'Pending',
          date: (charge.debit_date ?? new Date().toISOString()).slice(0, 10),
          description: `${SUBSCRIPTION_PLAN.name} — monthly subscription`,
          method: 'Mercado Pago',
          ...(preapproval.next_payment_date ? { paidThrough: preapproval.next_payment_date } : {}),
        });
      }
    }
    // Other notification types (e.g. plain `payment`) are acknowledged without action.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mercado Pago webhook processing failed:', error);
    // Non-2xx makes MP retry later — desirable for transient Convex/MP errors.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
