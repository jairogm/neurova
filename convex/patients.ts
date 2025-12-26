import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Use the helper from users.ts (or replicate logic) to get the therapist record
    // We need the Therapist ID, not just the Clerk ID.
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      return [];
    }

    // Determine which ID to use for lookup. 
    // Migrated therapists have a legacy `id`. New ones might only have `_id`.
    // We assume relationships use the legacy ID if available.
    const lookupId = therapist.id ?? therapist._id;

    // Now fetch patients for this therapist
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", lookupId))
      .collect();

    // Map to ensure types match Patient interface expectations
    return patients.map(p => ({
      ...p,
      gender: (["male", "female", "other"].includes(p.gender || "") 
        ? p.gender 
        : undefined) as "male" | "female" | "other" | undefined,
      national_id: p.national_id ?? 0, // Fallback for strict frontend type
      // Parse JSON fields that were stored as strings
      country_code: p.country_code ? JSON.parse(p.country_code) : undefined,
      emergency_contact: p.emergency_contact ? JSON.parse(p.emergency_contact) : undefined,
      medical_history: p.medical_history ? JSON.parse(p.medical_history) : undefined,
    }));
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Verify ownership indirectly? 
    // Ideally we check if the patient belongs to the logged-in therapist.
    // For now, let's just fetch by ID, and optionally check therapist_id matches.
    
    // We can't easily join in one query without a helper, but let's do:
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), args.id)) 
      .first();

    if (!patient) return null;

    // Check ownership
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist || patient.therapist_id !== (therapist.id ?? therapist._id)) {
       // Allow if unrelated? Probably not. 
       // For strict privacy, return null or throw.
       return null; 
    }

    // Parse JSON fields that were stored as strings
    return {
      ...patient,
      emergency_contact: patient.emergency_contact 
        ? JSON.parse(patient.emergency_contact) 
        : undefined,
      medical_history: patient.medical_history 
        ? JSON.parse(patient.medical_history) 
        : undefined,
      country_code: patient.country_code 
        ? JSON.parse(patient.country_code) 
        : undefined,
    };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    updates: v.any(), // Accept any updates for flexibility
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the patient by legacy ID
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Verify ownership
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist || patient.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Not authorized to update this patient");
    }

    // Update the patient
    await ctx.db.patch(patient._id, {
      ...args.updates,
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(patient._id);
  },
});
