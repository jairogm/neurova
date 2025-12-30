import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Create therapist profile from Clerk webhook
export const createFromClerk = mutation({
  args: {
    clerk_user_id: v.string(),
    email: v.string(),
    full_name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if therapist already exists
    const existing = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (existing) {
      console.log("Therapist already exists:", args.clerk_user_id);
      return existing._id;
    }

    // Create new therapist profile
    const therapistId = await ctx.db.insert("therapists", {
      clerk_user_id: args.clerk_user_id,
      email: args.email,
      full_name: args.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    console.log("Created therapist profile:", therapistId);
    return therapistId;
  },
});

// Update therapist profile from Clerk webhook
export const updateFromClerk = mutation({
  args: {
    clerk_user_id: v.string(),
    email: v.string(),
    full_name: v.string(),
  },
  handler: async (ctx, args) => {
    // Find therapist by Clerk ID
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", args.clerk_user_id))
      .first();

    if (!therapist) {
      console.log("Therapist not found, creating new:", args.clerk_user_id);
      // If not found, create it
      return await ctx.db.insert("therapists", {
        clerk_user_id: args.clerk_user_id,
        email: args.email,
        full_name: args.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Update existing therapist
    await ctx.db.patch(therapist._id, {
      email: args.email,
      full_name: args.full_name,
      updated_at: new Date().toISOString(),
    });

    console.log("Updated therapist profile:", therapist._id);
    return therapist._id;
  },
});

// Delete all therapist data (called from delete account button)
export const deleteAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id || therapist._id.toString();

    // Delete all patients and their related data
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();

    for (const patient of patients) {
      const patientId = patient.id;

      // Delete all sessions for this patient
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_patient_id", (q) => q.eq("patient_id", patientId))
        .collect();

      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }

      // Delete all medical history notes for this patient
      const notes = await ctx.db
        .query("medical_history_notes")
        .withIndex("by_patient_id", (q) => q.eq("patient_id", patientId))
        .collect();

      for (const note of notes) {
        await ctx.db.delete(note._id);
      }

      // Delete the patient
      await ctx.db.delete(patient._id);
    }

    // Delete the therapist profile
    await ctx.db.delete(therapist._id);

    console.log("Deleted all data for therapist:", identity.subject);
    return { success: true };
  },
});
