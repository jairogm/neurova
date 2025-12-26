import { query } from "./_generated/server";
import { v } from "convex/values";

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
      allFields: therapist,
    };
  },
});
