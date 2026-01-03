import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get therapist by Clerk ID
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      return null; // Or handle as "No profile set up"
    }

    // Get patients for this therapist
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapist.id!)) // Assuming therapist.id exists
      .collect();

    const activePatients = patients.filter((p) => !p.deleted_at);
    const activePatientIds = new Set(activePatients.map(p => p.id));

    // Get all sessions
    // Ideally we'd filter sessions by patient_id at the query level if we had a secondary index,
    // but for now we'll fetch all and filter in memory or join.
    // Given the schema lacks a direct "sessions by therapist" or multi-get optimization for this context easily:
    // We will fetch all sessions and filter. This is inefficient at scale but correct for now.
    // IMPROVEMENT: Add index on sessions by patient_id, iterate patients and fetch sessions (N+1 but better than scan if large DB),
    // or add therapist_id to sessions.
    // Current "sessions" query scan:
    const allSessions = await ctx.db.query("sessions").collect();
    
    // Filter sessions belonging to this therapist's ACTIVE patients (or all patients? usually all history)
    // Let's include all patients associated with the therapist, even soft deleted ones for historical revenue.
    const therapistPatientIds = new Set(patients.map(p => p.id));
    const sessions = allSessions.filter(s => therapistPatientIds.has(s.patient_id));

    // Calculate sessions this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    // Check if scheduled_date is >= startOfMonth
    // Note: scheduled_date format needs to be consistent (ISO string). 
    // If it's just YYYY-MM-DD, ISO string comparison works fine.
    const sessionsThisMonth = sessions.filter(s => s.scheduled_date >= startOfMonth).length;

    return {
      totalPatients: activePatients.length,
      totalSessions: sessions.length,
      sessionsThisMonth,
    };
  },
});

export const getUpcomingSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      return [];
    }

    const today = new Date().toISOString();
    
    // Get all sessions scheduled in future (Index scan if possible, or filter)
    // Optimization: filtering everything then checking patient ownership is slow.
    // Better: Get patients -> Get their sessions. 
    // BUT dashboard needs "soonest across all patients".
    // So scan future sessions -> filter by therapist's patient IDs -> sort -> take 5.
    
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapist.id!))
      .collect();
    
    const patientMap = new Map();
    patients.forEach(p => patientMap.set(p.id, p));

    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.gte(q.field("scheduled_date"), today))
      .collect();

    // Filter sessions that belong to our patients
    const mySessions = sessions.filter(s => patientMap.has(s.patient_id));

    // Sort by date ascending (nearest first) and take top 5
    const upcomingSessions = mySessions
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 5);

    // Enhance with patient details
    const sessionsWithPatient = upcomingSessions.map((session) => {
      const patient = patientMap.get(session.patient_id);
      return {
        ...session,
        patientName: patient?.name || "Unknown Patient",
        patientImage: patient?.profile_img,
      };
    });

    return sessionsWithPatient;
  },
});

export const getRecentPatients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get therapist
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();

    if (!therapist) {
      return [];
    }

    // Get recently added/updated patients for ONLY this therapist
    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapist.id!))
      .collect();
    
    const recentPatients = patients
      .filter((p) => !p.deleted_at)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 5);

    return recentPatients;
  },
});
