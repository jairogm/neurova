import { mutation, query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const MAX_SIZE = 10 * 1024 * 1024;
const TYPES = ["application/pdf", "image/jpeg", "image/png"];

async function requirePatient(ctx: QueryCtx, patientId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const therapist = await ctx.db.query("therapists")
    .withIndex("by_clerk_id", q => q.eq("clerk_user_id", identity.subject)).first();
  const patient = await ctx.db.query("patients")
    .filter(q => q.eq(q.field("id"), patientId)).first();
  if (!therapist || !patient || patient.deleted_at !== undefined ||
      patient.therapist_id !== (therapist.id ?? therapist._id)) {
    throw new Error("Patient not found");
  }
  return identity;
}

export const list = query({
  args: { patientId: v.string() },
  handler: async (ctx, { patientId }) => {
    await requirePatient(ctx, patientId);
    const documents = await ctx.db.query("patient_documents")
      .withIndex("by_patient_id", q => q.eq("patient_id", patientId)).collect();
    return documents.sort((a, b) => b._creationTime - a._creationTime)
      .map(({ storage_id: _storageId, uploaded_by: _uploadedBy, ...document }) => document);
  },
});

export const generateUploadUrl = mutation({
  args: { patientId: v.string() },
  handler: async (ctx, { patientId }) => {
    await requirePatient(ctx, patientId);
    return ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    patientId: v.string(), storageId: v.id("_storage"), name: v.string(),
    kind: v.union(v.literal("consent"), v.literal("other")),
  },
  handler: async (ctx, args) => {
    const identity = await requirePatient(ctx, args.patientId);
    const name = args.name.trim();
    if (!name || name.length > 255) throw new Error("Invalid file name");
    const existing = await ctx.db.query("patient_documents")
      .withIndex("by_storage_id", q => q.eq("storage_id", args.storageId)).first();
    if (existing) throw new Error("File already attached");
    const metadata = await ctx.db.system.get(args.storageId);
    if (!metadata || metadata.size <= 0 || metadata.size > MAX_SIZE ||
        !TYPES.includes(metadata.contentType || "")) {
      throw new Error("Upload a PDF, JPG or PNG up to 10 MB");
    }
    return ctx.db.insert("patient_documents", {
      patient_id: args.patientId, storage_id: args.storageId, name, kind: args.kind,
      content_type: metadata.contentType!, size: metadata.size,
      uploaded_by: identity.subject, uploaded_at: new Date().toISOString(),
    });
  },
});

export const download = query({
  args: { id: v.id("patient_documents") },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);
    if (!document) throw new Error("Document not found");
    await requirePatient(ctx, document.patient_id);
    return ctx.storage.getUrl(document.storage_id);
  },
});

export const remove = mutation({
  args: { id: v.id("patient_documents") },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);
    if (!document) throw new Error("Document not found");
    await requirePatient(ctx, document.patient_id);
    // Delete the stored file as well so previously issued download URLs stop working.
    await ctx.storage.delete(document.storage_id);
    await ctx.db.delete(id);
  },
});
