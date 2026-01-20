import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


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

// Query to get calendar ID by Clerk user ID (for API routes)
// Note: This is used by the calendar events API route which validates auth separately
export const getCalendarIdByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();

    if (!therapist) {
      return null;
    }

    return therapist.google_calendar_id || null;
  },
});

// Mutation to set calendar ID by Clerk user ID (for API routes)
// Note: This is used by the calendar events API route which validates auth separately
export const setCalendarIdByClerkId = mutation({
  args: {
    clerkUserId: v.string(),
    calendarId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", args.clerkUserId))
      .first();

    // If therapist profile doesn't exist yet (new user), create one
    if (!therapist) {
      const newTherapistId = await ctx.db.insert("therapists", {
        clerk_user_id: args.clerkUserId,
        email: args.email || "",
        full_name: args.fullName || "New Therapist",
        google_calendar_id: args.calendarId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      return { success: true, created: true };
    }

    await ctx.db.patch(therapist._id, {
      google_calendar_id: args.calendarId,
    });

    return { success: true, created: false };
  },
});
