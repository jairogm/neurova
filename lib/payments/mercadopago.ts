import { createHmac, timingSafeEqual } from "crypto";

// Server-side Mercado Pago client. All NEUROVA payment traffic goes through
// this module so switching providers (Wompi, Placetopay) stays a contained change.

const MP_API = "https://api.mercadopago.com";

export const SUBSCRIPTION_PLAN = {
  name: "Individual therapist",
  amountCOP: 50_000,
  reason: "NEUROVA — Individual therapist (50.000 COP / month)",
};

export interface MpPreapproval {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled" | string;
  init_point?: string;
  external_reference?: string;
  payer_email?: string;
  next_payment_date?: string;
  auto_recurring?: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
}

export interface MpAuthorizedPayment {
  id: number | string;
  preapproval_id: string;
  status: string; // scheduled | processed | recycling | cancelled
  external_reference?: string;
  debit_date?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment?: { id: number | string; status: string; status_detail?: string };
}

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
  return token;
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Mercado Pago ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export function createSubscription(params: {
  therapistRef: string;
  payerEmail: string;
  backUrl: string;
}): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: SUBSCRIPTION_PLAN.reason,
      external_reference: params.therapistRef,
      payer_email: params.payerEmail,
      back_url: params.backUrl,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: SUBSCRIPTION_PLAN.amountCOP,
        currency_id: "COP",
      },
    }),
  });
}

export function getPreapproval(id: string): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>(`/preapproval/${id}`);
}

export function cancelPreapproval(id: string): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>(`/preapproval/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });
}

export function getAuthorizedPayment(id: string): Promise<MpAuthorizedPayment> {
  return mpFetch<MpAuthorizedPayment>(`/authorized_payments/${id}`);
}

export function mapPreapprovalStatus(mpStatus: string): "active" | "pending" | "past_due" | "cancelled" {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Validates Mercado Pago's x-signature header: HMAC-SHA256 over the manifest
// `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` (missing parts omitted),
// keyed with the webhook secret from the MP integrations dashboard.
export function verifyWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature) return false;

  const parts = new Map(
    params.xSignature.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")] as const;
    })
  );
  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1) return false;

  const pieces: string[] = [];
  // MP requires alphanumeric data.id values lowercased in the manifest.
  if (params.dataId) pieces.push(`id:${params.dataId.toLowerCase()}`);
  if (params.xRequestId) pieces.push(`request-id:${params.xRequestId}`);
  pieces.push(`ts:${ts}`);
  const manifest = `${pieces.join(";")};`;

  const digest = createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(v1));
  } catch {
    return false;
  }
}
