import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

async function currentTherapist(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const therapist = await ctx.db
    .query("therapists")
    .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
    .first();
  return therapist;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) return [];
    const therapistId = therapist.id ?? therapist._id;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    return tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const aTime = a.done ? (a.completed_at ?? 0) : Date.parse(a.created_at);
      const bTime = b.done ? (b.completed_at ?? 0) : Date.parse(b.created_at);
      return bTime - aTime;
    });
  },
});

export const add = mutation({
  args: { label: v.string(), meta: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const therapistId = therapist.id ?? therapist._id;
    return await ctx.db.insert("tasks", {
      therapist_id: therapistId,
      label: args.label,
      meta: args.meta ?? "Added just now",
      done: false,
      created_at: new Date().toISOString(),
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Task not found");
    }
    await ctx.db.patch(args.id, {
      done: !task.done,
      completed_at: !task.done ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const therapist = await currentTherapist(ctx);
    if (!therapist) throw new Error("Not authenticated");
    const task = await ctx.db.get(args.id);
    if (!task || task.therapist_id !== (therapist.id ?? therapist._id)) {
      throw new Error("Task not found");
    }
    await ctx.db.delete(args.id);
  },
});
