import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get sessions for this patient, sorted by scheduled_date descending
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_patient_id", (q) => q.eq("patient_id", args.patientId))
      .collect();

    return sessions.sort((a, b) => 
      new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
    );
  },
});

export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    return session;
  },
});

// Create a new session
export const create = mutation({
  args: {
    patient_id: v.string(),
    scheduled_date: v.string(),
    duration: v.optional(v.number()),
    session_status: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    payment_amount: v.optional(v.number()),
    notes: v.optional(v.string()),
    event_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id ?? therapist._id;

    // Verify patient belongs to this therapist
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), args.patient_id))
      .first();

    if (!patient || patient.therapist_id !== therapistId) {
      throw new Error("Patient not found or access denied");
    }

    // Generate UUID for session
    const sessionId = crypto.randomUUID();

    // Create session
    const newSessionId = await ctx.db.insert("sessions", {
      id: sessionId,
      patient_id: args.patient_id,
      scheduled_date: args.scheduled_date,
      duration: args.duration,
      session_status: args.session_status,
      payment_status: args.payment_status,
      payment_amount: args.payment_amount,
      notes: args.notes,
      event_id: args.event_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(newSessionId);
  },
});

// Update an existing session
export const update = mutation({
  args: {
    id: v.string(),
    scheduled_date: v.optional(v.string()),
    duration: v.optional(v.number()),
    session_status: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    payment_amount: v.optional(v.number()),
    notes: v.optional(v.string()),
    event_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id ?? therapist._id;

    // Find session by legacy ID
    const session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Verify patient belongs to this therapist
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), session.patient_id))
      .first();

    if (!patient || patient.therapist_id !== therapistId) {
      throw new Error("Access denied");
    }

    // Update session
    const { id, ...updates } = args;
    await ctx.db.patch(session._id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(session._id);
  },
});

// Update payment status
export const updatePayment = mutation({
  args: {
    id: v.string(),
    payment_status: v.string(),
    payment_amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id ?? therapist._id;

    // Find session
    const session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Verify ownership
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), session.patient_id))
      .first();

    if (!patient || patient.therapist_id !== therapistId) {
      throw new Error("Access denied");
    }

    // Update payment
    await ctx.db.patch(session._id, {
      payment_status: args.payment_status,
      payment_amount: args.payment_amount,
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(session._id);
  },
});

// Delete a session
export const remove = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id ?? therapist._id;

    // Find session
    const session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    // Verify ownership
    const patient = await ctx.db
      .query("patients")
      .filter(q => q.eq(q.field("id"), session.patient_id))
      .first();

    if (!patient || patient.therapist_id !== therapistId) {
      throw new Error("Access denied");
    }

    // Delete session
    await ctx.db.delete(session._id);
  },
});

// Delete session by event ID (for calendar integration)
export const removeByEventId = mutation({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    const therapistId = therapist.id ?? therapist._id;

    // Find sessions with this event_id
    const sessions = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("event_id"), args.eventId))
      .collect();

    if (sessions.length === 0) {
      console.log("No sessions found for event_id:", args.eventId);
      return;
    }

    // Verify ownership and delete
    for (const session of sessions) {
      const patient = await ctx.db
        .query("patients")
        .filter(q => q.eq(q.field("id"), session.patient_id))
        .first();

      if (patient && patient.therapist_id === therapistId) {
        await ctx.db.delete(session._id);
      }
    }

    console.log(`✅ Deleted ${sessions.length} session(s) for event_id: ${args.eventId}`);
  },
});
