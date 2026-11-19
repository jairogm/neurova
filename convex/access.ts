import type { QueryCtx } from "./_generated/server";

export async function patientAccess(ctx: QueryCtx, patientId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const therapist = await ctx.db.query("therapists")
    .withIndex("by_clerk_id", q => q.eq("clerk_user_id", identity.subject)).first();
  if (!therapist) return null;
  const patient = await ctx.db.query("patients")
    .withIndex("by_patient_key", q => q.eq("id", patientId)).unique();
  if (!patient || patient.deleted_at !== undefined ||
      patient.therapist_id !== (therapist.id ?? therapist._id)) return null;
  return identity;
}

export async function requirePatient(ctx: QueryCtx, patientId: string) {
  const identity = await patientAccess(ctx, patientId);
  if (!identity) throw new Error("Patient not found");
  return identity;
}
