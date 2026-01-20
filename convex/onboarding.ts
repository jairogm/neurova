import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get tutorial status for current user
export const getTutorialStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { completed: false };
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      return { completed: false };
    }

    return {
      completed: therapist.tutorial_completed ?? false,
      completedAt: therapist.tutorial_completed_at,
    };
  },
});

// Mark tutorial as completed
export const completeTutorial = mutation({
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

    await ctx.db.patch(therapist._id, {
      tutorial_completed: true,
      tutorial_completed_at: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Reset tutorial (for replay functionality)
export const resetTutorial = mutation({
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

    await ctx.db.patch(therapist._id, {
      tutorial_completed: false,
      tutorial_completed_at: undefined,
    });

    return { success: true };
  },
});
