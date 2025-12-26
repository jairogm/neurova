import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get medical history notes for this patient
    const notes = await ctx.db
      .query("medical_history_notes")
      .withIndex("by_patient_id", (q) => q.eq("patient_id", args.patientId))
      .collect();

    // Parse content for each note and ensure id field exists
    return notes.map(note => ({
      ...note,
      id: note.id ?? note._id, // Use legacy id if available, otherwise use Convex _id
      content: note.content ? JSON.parse(note.content) : undefined,
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

    const note = await ctx.db
      .query("medical_history_notes")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!note) return null;

    // Parse content if it's a JSON string
    return {
      ...note,
      content: note.content ? JSON.parse(note.content) : undefined,
    };
  },
});

export const create = mutation({
  args: {
    patient_id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the patient belongs to this therapist
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), args.patient_id))
      .first();

    if (!patient) {
      throw new Error("Patient not found");
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist || patient.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Not authorized");
    }

    // Create the note
    const noteId = await ctx.db.insert("medical_history_notes", {
      patient_id: args.patient_id,
      title: args.title,
      description: args.description,
      date: args.date,
      content: JSON.stringify(args.content),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const note = await ctx.db.get(noteId);
    return { id: note?.id, _id: noteId };
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    content: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the note - check both legacy 'id' field and Convex '_id'
    let note = await ctx.db
      .query("medical_history_notes")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    // If not found by legacy id, try finding by Convex _id
    if (!note) {
      try {
        const doc = await ctx.db.get(args.id as any);
        // Verify it's a medical_history_note by checking for patient_id field
        if (doc && 'patient_id' in doc) {
          note = doc as any;
        }
      } catch {
        // Invalid ID format or not found
        note = null;
      }
    }

    if (!note) {
      throw new Error("Note not found");
    }

    // Verify ownership through patient
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), note.patient_id))
      .first();

    if (!patient) {
      throw new Error("Patient not found");
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist || patient.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Not authorized");
    }

    // Update the note
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.date !== undefined) updates.date = args.date;
    if (args.content !== undefined) updates.content = JSON.stringify(args.content);

    await ctx.db.patch(note._id, updates);
    return { id: args.id };
  },
});

export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find the note - check both legacy 'id' field and Convex '_id'
    let note = await ctx.db
      .query("medical_history_notes")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    // If not found by legacy id, try finding by Convex _id
    if (!note) {
      try {
        const doc = await ctx.db.get(args.id as any);
        // Verify it's a medical_history_note by checking for patient_id field
        if (doc && 'patient_id' in doc) {
          note = doc as any;
        }
      } catch {
        // Invalid ID format or not found
        note = null;
      }
    }

    if (!note) {
      throw new Error("Note not found");
    }

    // Verify ownership
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), note.patient_id))
      .first();

    if (!patient) {
      throw new Error("Patient not found");
    }

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist || patient.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(note._id);
    return { success: true };
  },
});
