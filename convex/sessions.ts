import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get sessions for this patient
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_patient_id", (q) => q.eq("patient_id", args.patientId))
      .collect();

    return sessions;
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    return session;
  },
});
