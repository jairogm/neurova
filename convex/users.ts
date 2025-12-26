import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called syncUser without authentication present");
    }

    console.log("🔍 syncUser called for:", identity.email, "Clerk ID:", identity.subject);

    // Clerk email
    const email = identity.email;
    if (!email) {
      throw new Error("Clerk user has no email");
    }

    // Check if we already have this user linked
    const existingUser = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (existingUser) {
      console.log("✅ User already linked:", existingUser._id);
      return existingUser;
    }

    // If not linked, check if we have a therapist with this email (migration case)
    const migratedUser = await ctx.db
      .query("therapists")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (migratedUser) {
      console.log("🔗 Linking migrated user:", migratedUser._id, "to Clerk ID:", identity.subject);
      // Link them
      await ctx.db.patch(migratedUser._id, {
        clerk_user_id: identity.subject,
      });
      const updated = await ctx.db.get(migratedUser._id);
      console.log("✅ Link successful:", updated?.clerk_user_id);
      return updated;
    }

    console.log("❌ No therapist found for email:", email);
    return null;
  },
});

export const checkTherapistByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    return {
      exists: !!therapist,
      therapistId: therapist?._id,
      legacyId: therapist?.id,
      email: therapist?.email,
      clerkUserId: therapist?.clerk_user_id,
    };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .unique();

    return user;
  },
});
