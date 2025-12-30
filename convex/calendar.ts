import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get therapist's Google Calendar ID
export const getCalendarId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    return therapist.google_calendar_id || null;
  },
});

// Store Google Calendar ID for therapist
export const setCalendarId = mutation({
  args: {
    calendarId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    await ctx.db.patch(therapist._id, {
      google_calendar_id: args.calendarId,
    });

    return { success: true };
  },
});
