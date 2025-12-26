import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const importPatients = mutation({
  args: {
    data: v.array(v.any()), // Accepting any temporarily, but adhering to schema structure in logic
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query("patients")
        .filter((q) => q.eq(q.field("id"), item.id))
        .first();
        
      if (!existing) {
        await ctx.db.insert("patients", item);
      }
    }
    return `Imported ${args.data.length} patients`;
  },
});

export const importTherapists = mutation({
  args: {
    data: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query("therapists")
        .filter((q) => q.eq(q.field("id"), item.id))
        .first();

      if (!existing) {
        await ctx.db.insert("therapists", item);
      }
    }
    return `Imported ${args.data.length} therapists`;
  },
});

export const importSessions = mutation({
  args: {
    data: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query("sessions")
        .filter((q) => q.eq(q.field("id"), item.id))
        .first();

      if (!existing) {
        await ctx.db.insert("sessions", item);
      }
    }
    return `Imported ${args.data.length} sessions`;
  },
});

export const importNotes = mutation({
  args: {
    data: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query("medical_history_notes")
        .filter((q) => q.eq(q.field("id"), item.id))
        .first();

      if (!existing) {
        await ctx.db.insert("medical_history_notes", item);
      }
    }
    return `Imported ${args.data.length} notes`;
  },
});

export const importTherapistPatients = mutation({
  args: {
    data: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      // Check for existence based on compound key or just insert?
      // Since there is no unique ID in the JSON for this relationship table, 
      // we check for existing pair.
      const existing = await ctx.db
        .query("therapist_patients")
        .withIndex("by_therapist_id", (q) => q.eq("therapist_id", item.therapist_id))
        .filter((q) => q.eq(q.field("patient_id"), item.patient_id))
        .first();

      if (!existing) {
        await ctx.db.insert("therapist_patients", item);
      }
    }
    return `Imported ${args.data.length} relationship records`;
  },
});
