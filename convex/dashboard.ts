import { query } from "./_generated/server";

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

    // Calculate dashboard ranges and payment totals.
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    const startOfWeek = new Date(startOfToday);
    const dayOffset = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayOffset);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    // Check if scheduled_date is >= startOfMonth
    // Note: scheduled_date format needs to be consistent (ISO string). 
    // If it's just YYYY-MM-DD, ISO string comparison works fine.
    const sessionsThisMonth = sessions.filter(s => s.scheduled_date >= startOfMonth).length;

    const sessionsThisWeek = sessions.filter((session) => {
      const date = new Date(session.scheduled_date);
      return date >= startOfWeek && date < endOfWeek;
    }).length;

    const sessionsToday = sessions.filter((session) => {
      const date = new Date(session.scheduled_date);
      return date >= startOfToday && date < endOfToday;
    }).length;

    const completedSessions = sessions.filter((session) => {
      const status = session.session_status?.toLowerCase();
      return status === "completed" || status === "complete";
    }).length;
    const noShowSessions = sessions.filter((session) => {
      const status = session.session_status?.toLowerCase();
      return status === "no-show" || status === "no_show" || status === "missed";
    }).length;
    const attendanceBase = completedSessions + noShowSessions;
    const attendanceRate = attendanceBase
      ? Math.round((completedSessions / attendanceBase) * 100)
      : 100;

    const amountOf = (value: unknown) => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value !== "string") return 0;
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const paymentTotals = sessions.reduce(
      (totals, session) => {
        const amount = amountOf(session.payment_amount);
        const status = session.payment_status?.toLowerCase() || "";

        if (["paid", "collected", "complete", "completed"].includes(status)) {
          totals.collected += amount;
        } else if (["overdue", "late"].includes(status)) {
          totals.overdue += amount;
        } else if (["unpaid", "pending", "open"].includes(status)) {
          totals.unpaid += amount;
        }

        return totals;
      },
      { collected: 0, unpaid: 0, overdue: 0 },
    );

    return {
      totalPatients: activePatients.length,
      totalSessions: sessions.length,
      sessionsThisMonth,
      sessionsThisWeek,
      sessionsToday,
      attendanceRate,
      outstandingAmount: paymentTotals.unpaid + paymentTotals.overdue,
      paymentCollected: paymentTotals.collected,
      paymentUnpaid: paymentTotals.unpaid,
      paymentOverdue: paymentTotals.overdue,
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

    // Include everything from the start of today so completed morning
    // sessions still show on the agenda (matches the NEUROVA design).
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapist.id!))
      .collect();

    const patientMap = new Map();
    patients.forEach(p => patientMap.set(p.id, p));

    const sessions = await ctx.db
      .query("sessions")
      .filter((q) => q.gte(q.field("scheduled_date"), startOfToday))
      .collect();

    // Filter sessions that belong to our patients
    const mySessions = sessions.filter(s => patientMap.has(s.patient_id));

    // Sort by date ascending (nearest first)
    const upcomingSessions = mySessions
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .slice(0, 20);

    // Enhance with patient details
    const sessionsWithPatient = upcomingSessions.map((session) => {
      const patient = patientMap.get(session.patient_id);
      return {
        ...session,
        patientName: patient?.name || "Unknown Patient",
        patientImage: patient?.profile_img,
        patientColor: patient?.avatar_color,
        patientFocus: patient?.focus,
      };
    });

    return sessionsWithPatient;
  },
});

export const getWeekSessions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();
    if (!therapist) return [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monday = new Date(startOfToday);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const patients = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapist.id!))
      .collect();
    const patientMap = new Map();
    patients.forEach(p => patientMap.set(p.id, p));

    const sessions = await ctx.db
      .query("sessions")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduled_date"), monday.toISOString()),
          q.lt(q.field("scheduled_date"), nextMonday.toISOString()),
        ),
      )
      .collect();

    return sessions
      .filter((session) => patientMap.has(session.patient_id))
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
      .map((session) => {
        const patient = patientMap.get(session.patient_id);
        return {
          ...session,
          patientName: patient?.name || "Unknown Patient",
          patientColor: patient?.avatar_color,
        };
      });
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
