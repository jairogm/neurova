import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function currentTherapist(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const therapist = await ctx.db
    .query("therapists")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
    .first();
  return therapist;
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) return null;
    return {
      billing_email: therapist.billing_email ?? therapist.email ?? "",
      tax_id: therapist.tax_id ?? "",
      billing_address: therapist.billing_address ?? therapist.office_address ?? "",
      subscription_plan: therapist.subscription_plan ?? "Individual therapist",
      subscription_status: therapist.subscription_status ?? "active",
    };
  },
});

export const updateProfile = mutation({
  args: {
    billing_email: v.optional(v.string()),
    tax_id: v.optional(v.string()),
    billing_address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    await ctx.db.patch(therapist._id, {
      ...args,
      updated_at: new Date().toISOString(),
    });
  },
});

export const listPaymentMethods = query({
  args: {},
  handler: async (ctx) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) return [];
    const therapistId = therapist.id ?? therapist._id;
    const methods = await ctx.db
      .query("payment_methods")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    return methods.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  },
});

export const addPaymentMethod = mutation({
  args: {
    brand: v.string(),
    last4: v.string(),
    exp: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const therapistId = therapist.id ?? therapist._id;
    const existing = await ctx.db
      .query("payment_methods")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    return await ctx.db.insert("payment_methods", {
      therapist_id: therapistId,
      ...args,
      is_primary: existing.length === 0,
      created_at: new Date().toISOString(),
    });
  },
});

export const setPrimaryPaymentMethod = mutation({
  args: { id: v.id("payment_methods") },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const therapistId = therapist.id ?? therapist._id;
    const methods = await ctx.db
      .query("payment_methods")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    for (const method of methods) {
      await ctx.db.patch(method._id, { is_primary: method._id === args.id });
    }
  },
});

export const removePaymentMethod = mutation({
  args: { id: v.id("payment_methods") },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const method = await ctx.db.get(args.id);
    if (!method || method.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Payment method not found");
    }
    if (method.is_primary) throw new Error("Cannot remove the default payment method");
    await ctx.db.delete(args.id);
  },
});

export const listInvoices = query({
  args: {},
  handler: async (ctx) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) return [];
    const therapistId = therapist.id ?? therapist._id;
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    return invoices.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

// ===== Subscription (Mercado Pago) =====

const PLAN_NAME = "Individual therapist";

// Comp accounts: COMP_ACCOUNT_EMAILS (Convex env var) is a comma-separated
// allowlist granting free full access. Matched against the account email
// only — never billing_email, which users can edit themselves.
function isComplimentary(therapist: { email?: string }) {
  const allowlist = (process.env.COMP_ACCOUNT_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const email = therapist.email?.trim().toLowerCase();
  return Boolean(email && allowlist.includes(email));
}

// The webhook mutations below are called by our Next.js server (never the
// browser), authenticated with a shared secret instead of a Clerk identity —
// Mercado Pago notifications carry no user session.
function assertBillingSecret(secret: string) {
  const expected = process.env.BILLING_WEBHOOK_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Invalid billing webhook secret");
  }
}

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) return null;
    const complimentary = isComplimentary(therapist);
    return {
      therapistRef: String(therapist._id),
      email: therapist.billing_email ?? therapist.email ?? "",
      plan: complimentary ? "Complimentary" : therapist.subscription_plan ?? PLAN_NAME,
      status: complimentary ? "active" : therapist.subscription_status ?? "none",
      provider: therapist.payment_provider ?? null,
      subscriptionId: therapist.subscription_id ?? null,
      expiresAt: (therapist.subscription_expires_at as string | null) ?? null,
      complimentary,
    };
  },
});

export const applySubscriptionUpdate = mutation({
  args: {
    secret: v.string(),
    therapistRef: v.string(),
    subscriptionId: v.string(),
    status: v.string(), // active | pending | past_due | cancelled
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertBillingSecret(args.secret);
    const id = ctx.db.normalizeId("therapists", args.therapistRef);
    if (!id) throw new Error("Unknown therapist reference");
    const therapist = await ctx.db.get(id);
    if (!therapist) throw new Error("Therapist not found");
    await ctx.db.patch(id, {
      payment_provider: "mercadopago",
      subscription_id: args.subscriptionId,
      subscription_plan: PLAN_NAME,
      subscription_status: args.status,
      ...(args.expiresAt ? { subscription_expires_at: args.expiresAt } : {}),
      updated_at: new Date().toISOString(),
    });
  },
});

export const recordSubscriptionPayment = mutation({
  args: {
    secret: v.string(),
    therapistRef: v.string(),
    paymentId: v.string(),
    amount: v.string(),
    status: v.string(), // Paid | Pending
    date: v.string(),
    description: v.string(),
    method: v.string(),
    paidThrough: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertBillingSecret(args.secret);
    const id = ctx.db.normalizeId("therapists", args.therapistRef);
    if (!id) throw new Error("Unknown therapist reference");
    const therapist = await ctx.db.get(id);
    if (!therapist) throw new Error("Therapist not found");
    const therapistId = therapist.id ?? therapist._id;

    // Mercado Pago retries webhooks — dedupe on the payment id.
    const invoiceNo = `MP-${args.paymentId}`;
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    if (existing.some((invoice) => invoice.invoice === invoiceNo)) return;

    await ctx.db.insert("invoices", {
      therapist_id: therapistId,
      invoice: invoiceNo,
      date: args.date,
      description: args.description,
      amount: args.amount,
      status: args.status,
      method: args.method,
      created_at: new Date().toISOString(),
    });

    if (args.status === "Paid") {
      await ctx.db.patch(id, {
        subscription_status: "active",
        ...(args.paidThrough ? { subscription_expires_at: args.paidThrough } : {}),
        updated_at: new Date().toISOString(),
      });
    }
  },
});
