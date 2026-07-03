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
