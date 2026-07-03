import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
      .filter((q) => q.eq(q.field("deleted_at"), undefined))
      .collect();

    const parseJson = (value?: string) => {
      if (!value) return undefined;
      try { return JSON.parse(value); } catch { return undefined; }
    };
    const amountOf = (value: unknown) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value !== "string") return 0;
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const now = new Date().toISOString();

    return Promise.all(patients.map(async (p) => {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_patient_id", (q) => q.eq("patient_id", p.id))
        .collect();
      const sorted = [...sessions].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
      const nextSession = sorted.find((session) => session.scheduled_date >= now);
      const lastSession = [...sorted].reverse().find((session) => session.scheduled_date < now);
      const medicalHistory = parseJson(p.medical_history);
      const outstandingBalance = sessions.reduce((sum, session) => {
        const status = session.payment_status?.toLowerCase();
        return ["unpaid", "pending", "partially_paid", "overdue"].includes(status || "")
          ? sum + amountOf(session.payment_amount)
          : sum;
      }, 0);
      const hasOverdue = sessions.some((session) => ["overdue", "late"].includes(session.payment_status?.toLowerCase() || ""));
      const balanceState = outstandingBalance <= 0 ? "ok" : hasOverdue ? "overdue" : "pending";

      return {
        ...p,
        gender: (["male", "female", "other"].includes(p.gender || "")
          ? p.gender
          : undefined) as "male" | "female" | "other" | undefined,
        national_id: p.national_id ?? 0,
        country_code: parseJson(p.country_code),
        emergency_contact: parseJson(p.emergency_contact),
        medical_history: medicalHistory,
        status: (p.status || "active") as "active" | "intake" | "paused" | "discharged",
        focus: p.focus || medicalHistory?.mainTopic || medicalHistory?.diagnosis || p.occupation || "General care",
        goals: parseJson(p.goals) ?? [],
        session_count: sessions.length,
        next_session: nextSession?.scheduled_date,
        last_seen: lastSession?.scheduled_date,
        outstanding_balance: outstandingBalance,
        balance_state: balanceState as "ok" | "pending" | "overdue",
      };
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

    const parseJson = (value?: string) => {
      if (!value) return undefined;
      try { return JSON.parse(value); } catch { return undefined; }
    };

    // Parse JSON fields that were stored as strings
    return {
      ...patient,
      emergency_contact: parseJson(patient.emergency_contact),
      medical_history: parseJson(patient.medical_history),
      country_code: parseJson(patient.country_code),
      status: patient.status || "active",
      goals: parseJson(patient.goals) ?? [],
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

const avatarPalette = ["#0E96B8", "#2C8FB0", "#5C8A7A", "#8A6BA8", "#B5803A", "#3F7E8C", "#9A6470", "#5677A8"];

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    country_code: v.optional(v.string()), // JSON string
    status: v.optional(v.string()),
    focus: v.optional(v.string()),
    pronouns: v.optional(v.string()),
    age: v.optional(v.string()),
    city: v.optional(v.string()),
    summary: v.optional(v.string()),
    goals: v.optional(v.string()), // JSON array [{ text, tone }]
    emergency_contact: v.optional(v.string()), // JSON string
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      throw new Error("Therapist profile not found");
    }

    // Use the legacy ID if available, otherwise use _id
    const therapistId = therapist.id ?? therapist._id;

    const existing = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();

    // Generate a UUID for the patient (for compatibility with migrated data)
    const patientId = crypto.randomUUID();

    // Create the patient
    const newPatientId = await ctx.db.insert("patients", {
      id: patientId,
      ...args,
      status: args.status ?? "active",
      avatar_color: avatarPalette[existing.length % avatarPalette.length],
      therapist_id: therapistId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return await ctx.db.get(newPatientId);
  },
});
