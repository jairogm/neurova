import { patientAccess } from "./access";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    if (!(await patientAccess(ctx, args.patientId))) {
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

    const documentId = ctx.db.normalizeId("sessions", args.id);
    const session = documentId ? await ctx.db.get(documentId) : await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();

    if (!session || !(await patientAccess(ctx, session.patient_id))) return null;
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
    mode: v.optional(v.string()),
    session_type: v.optional(v.string()),
    meet_link: v.optional(v.string()),
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
      mode: args.mode,
      session_type: args.session_type,
      meet_link: args.meet_link,
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
    meet_link: v.optional(v.string()),
    mode: v.optional(v.string()),
    session_type: v.optional(v.string()),
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

    // Find session by legacy id, falling back to Convex _id
    let session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();
    if (!session) {
      try {
        session = await ctx.db.get(args.id as import("./_generated/dataModel").Id<"sessions">);
      } catch {
        session = null;
      }
    }

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
    const { id: _id, ...updates } = args;
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

    // Find session by legacy id, falling back to Convex _id
    let session = await ctx.db
      .query("sessions")
      .filter(q => q.eq(q.field("id"), args.id))
      .first();
    if (!session) {
      try {
        session = await ctx.db.get(args.id as import("./_generated/dataModel").Id<"sessions">);
      } catch {
        session = null;
      }
    }

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

export const wrapUpDetail = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, { id }) => {
    const session = await ctx.db.get(id);
    if (!session || !(await patientAccess(ctx, session.patient_id))) return null;
    const patient = await ctx.db.query("patients").withIndex("by_patient_key", q => q.eq("id", session.patient_id)).unique();
    const note = session.wrap_note_id ? await ctx.db.get(session.wrap_note_id) : null;
    return { ...session, patientName: patient!.name, linkedNote: note && !note.deleted_at ? note._id : null };
  },
});

export const finish = mutation({
  args: {
    id: v.id("sessions"),
    payment: v.union(v.literal("paid"), v.literal("unpaid"), v.literal("waived")),
    existingNote: v.optional(v.id("medical_history_notes")),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session || !(await patientAccess(ctx, session.patient_id))) throw new Error("Session unavailable");
    if (["cancelled", "canceled", "no_show", "no-show", "missed"].includes(session.session_status?.toLowerCase() ?? "")) throw new Error("This session cannot be finished");
    const now = new Date().toISOString();
    let noteId = session.wrap_note_id;
    if (noteId && (await ctx.db.get(noteId))?.deleted_at !== undefined) noteId = undefined;
    if (args.existingNote) {
      const note = await ctx.db.get(args.existingNote);
      if (!note || note.patient_id !== session.patient_id || note.deleted_at !== undefined) throw new Error("Note unavailable");
      if (noteId && noteId !== note._id) throw new Error("Refresh to see the linked note");
      noteId = note._id;
    }
    const text = args.text?.trim();
    if (text && !noteId) {
      if (text.length > 24000) throw new Error("Note is too long");
      const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      noteId = await ctx.db.insert("medical_history_notes", {
        id: crypto.randomUUID(), patient_id: session.patient_id, title: "Session note",
        date: session.scheduled_date.slice(0, 10), created_at: now, updated_at: now,
        description: text.slice(0, 120),
        content: JSON.stringify({ blocks: escaped.split(/\n+/).map(line => ({ type: "paragraph", data: { text: line } })) }),
      });
    } else if (text && noteId) {
      // A retry of the same save is harmless. A different draft must never be silently discarded.
      const saved = await ctx.db.get(noteId);
      const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      const content = JSON.stringify({ blocks: escaped.split(/\n+/).map(line => ({ type: "paragraph", data: { text: line } })) });
      if (saved?.content !== content) throw new Error("A note has already been linked. Refresh before editing.");
    }
    await ctx.db.patch(session._id, { session_status: "completed", payment_status: args.payment, wrap_note_id: noteId, updated_at: now });
    return noteId ?? null;
  },
});
