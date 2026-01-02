import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// --- Soft Delete ---

export const softDeletePatient = mutation({
  args: { 
    id: v.id("patients"),
    cascade: v.optional(v.boolean()) 
  },
  handler: async (ctx, args) => {
    const deletedAt = Date.now();
    await ctx.db.patch(args.id, { deleted_at: deletedAt });
    
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
            .filter(q => q.eq(q.field("deleted_at"), undefined)) // Only delete active records
            .collect();
            
         for (const record of records) {
            await ctx.db.patch(record._id, { deleted_at: deletedAt });
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
    const patient = await ctx.db.get(args.id);
    if (!patient || !patient.deleted_at) return;

    const deletedAt = patient.deleted_at;

    // Restore the patient
    await ctx.db.patch(args.id, { deleted_at: undefined });

    // Restore cascaded records: find records deleted at the exact same time
    const lookupId = patient.id ?? patient._id;
    const records = await ctx.db
        .query("medical_history_notes")
        .withIndex("by_patient_id", q => q.eq("patient_id", lookupId))
        .filter(q => q.eq(q.field("deleted_at"), deletedAt))
        .collect();

    for (const record of records) {
        await ctx.db.patch(record._id, { deleted_at: undefined });
    }
  },
});

export const restoreRecord = mutation({
  args: { id: v.id("medical_history_notes") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Record not found");

    // Check if the patient is deleted
    // Try to find patient by ID. Note that record.patient_id is a string UUID, 
    // but we query mainly by legacy ID or we can try to find by `id` field.
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), record.patient_id))
      .first();

    if (patient && patient.deleted_at) {
        throw new Error("Cannot restore record because the associated patient is deleted. Please restore the patient first.");
    }
    
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
