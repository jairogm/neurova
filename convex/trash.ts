import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// --- Soft Delete ---

export const softDeletePatient = mutation({
  args: { 
    id: v.id("patients"),
    cascade: v.optional(v.boolean()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted_at: Date.now() });
    
    // Cascade soft delete to records if requested
    if (args.cascade) {
      // We need to find the patient's ID (legacy or new) to lookup records
      // But records use `patient_id` which might match this `args.id` or the legacy `id`.
      // Let's first get the patient to see if there's a legacy ID.
      const patient = await ctx.db.get(args.id);
      if (patient) {
         const lookupId = patient.id ?? patient._id;
         
         const records = await ctx.db
            .query("medical_history_notes")
            .withIndex("by_patient_id", q => q.eq("patient_id", lookupId))
            .collect();
            
         for (const record of records) {
            await ctx.db.patch(record._id, { deleted_at: Date.now() });
         }
      }
    }
  },
});

export const softDeleteRecord = mutation({
  args: { id: v.id("medical_history_notes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted_at: Date.now() });
  },
});

// --- Restore ---

export const restorePatient = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted_at: undefined });
  },
});

export const restoreRecord = mutation({
  args: { id: v.id("medical_history_notes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deleted_at: undefined });
  },
});

// --- Permanent Delete ---

export const permanentDeletePatient = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const permanentDeleteRecord = mutation({
  args: { id: v.id("medical_history_notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// --- List Trash ---

export const listTrash = query({
  args: {},
  handler: async (ctx) => {
    const patients = await ctx.db
      .query("patients")
      .filter((q) => q.neq(q.field("deleted_at"), undefined))
      .collect();

    const records = await ctx.db
      .query("medical_history_notes")
      .filter((q) => q.neq(q.field("deleted_at"), undefined))
      .collect();

    return {
      patients,
      records,
    };
  },
});

// --- Cron Job / Internal ---

export const permanentlyDeleteOldTrash = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // 1. Find old deleted patients
    const oldPatients = await ctx.db
      .query("patients")
      .filter((q) => q.lt(q.field("deleted_at"), thirtyDaysAgo))
      .collect();

    for (const patient of oldPatients) {
      if (patient.deleted_at) { // Double check
         await ctx.db.delete(patient._id);
      }
    }

    // 2. Find old deleted records
    const oldRecords = await ctx.db
      .query("medical_history_notes")
      .filter((q) => q.lt(q.field("deleted_at"), thirtyDaysAgo))
      .collect();

    for (const record of oldRecords) {
      if (record.deleted_at) {
        await ctx.db.delete(record._id);
      }
    }
  },
});
