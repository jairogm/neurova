import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seeds the NEUROVA demo dataset (patients, sessions, notes, tasks,
 * payment methods, invoices) for the signed-in therapist, matching the
 * NEUROVA.dc.html design prototype. Dev-mode helper — run from /debug.
 */
export const seedDemoData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const therapist = await ctx.db
      .query("therapists")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_user_id", identity.subject))
      .first();
    if (!therapist) throw new Error("Therapist profile not found");
    const therapistId = therapist.id ?? therapist._id;

    const existing = await ctx.db
      .query("patients")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    if (existing.length > 0 && !args.force) {
      return { skipped: true, reason: "Patients already exist. Pass force:true to seed anyway." };
    }

    const nowIso = new Date().toISOString();
    const today = new Date();
    const dayAt = (dayOffset: number, hours: number, minutes: number) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset, hours, minutes);
      return date.toISOString();
    };

    const goals = (items: [string, string][]) =>
      JSON.stringify(items.map(([text, tone]) => ({ text, tone })));
    const defaultGoals = goals([
      ["Reduce symptom frequency and intensity", "success"],
      ["Build a daily coping practice", "primary"],
      ["Re-engage with social activities", "warning"],
    ]);
    const defaultSummary =
      "Engaged and responsive to the current approach. Working collaboratively toward agreed goals; progress reviewed each session.";

    const patients = [
      {
        name: "Maya Thompson", color: "#0E96B8", status: "active", focus: "Generalized anxiety · CBT",
        age: "29", pronouns: "she/her", phone: "+1 415 555 0142", email: "maya.t@email.com", city: "San Francisco, CA",
        summary: "Anticipatory worry around work and crowded spaces. Responding well to CBT with graded exposure; panic frequency declining.",
        goals: goals([
          ["Reduce panic episodes to <1 / month", "success"],
          ["Resume weekly social activity", "warning"],
          ["Daily thought-record practice", "primary"],
        ]),
        emergency: { name: "Daniel Thompson", relationship: "Partner", phone: "+1 415 555 0143" },
        medicalHistory: {
          expectations: "Wants practical tools to manage daily anxiety and return to social activities without panic.",
          mainTopic: "Generalized anxiety with anticipatory worry, especially around work performance and crowded spaces.",
          symptoms: "Restlessness, muscle tension, disrupted sleep, occasional panic episodes (2–3 / month).",
          familyInfo: "Supportive partner. Family history of anxiety (mother). Strong friend network, recently reduced contact.",
          diagnosis: "Generalized Anxiety Disorder presentation. Responding well to CBT with exposure components.",
        },
      },
      {
        name: "David Okafor", color: "#2C8FB0", status: "active", focus: "Depression · ACT",
        age: "41", pronouns: "he/him", phone: "+1 415 555 0188", email: "d.okafor@email.com", city: "Oakland, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Amara Okafor", relationship: "Sister", phone: "+1 415 555 0190" },
      },
      {
        name: "Sofia Marin", color: "#5C8A7A", status: "intake", focus: "Intake · Stress",
        age: "34", pronouns: "she/her", phone: "+1 408 555 0117", email: "sofia.m@email.com", city: "San Jose, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Luis Marin", relationship: "Spouse", phone: "+1 408 555 0119" },
      },
      {
        name: "James Lee", color: "#8A6BA8", status: "active", focus: "OCD · ERP",
        age: "26", pronouns: "he/him", phone: "+1 650 555 0193", email: "james.lee@email.com", city: "Palo Alto, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Karen Lee", relationship: "Mother", phone: "+1 650 555 0195" },
      },
      {
        name: "Priya Nair", color: "#B5803A", status: "paused", focus: "Grief · Supportive",
        age: "38", pronouns: "she/her", phone: "+1 415 555 0166", email: "priya.n@email.com", city: "Berkeley, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Ravi Nair", relationship: "Brother", phone: "+1 415 555 0168" },
      },
      {
        name: "Liam Walsh", color: "#3F7E8C", status: "active", focus: "Panic disorder · CBT",
        age: "31", pronouns: "he/him", phone: "+1 415 555 0124", email: "liam.w@email.com", city: "San Francisco, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Erin Walsh", relationship: "Partner", phone: "+1 415 555 0126" },
      },
      {
        name: "Grace Kim", color: "#9A6470", status: "active", focus: "PTSD · EMDR",
        age: "45", pronouns: "she/her", phone: "+1 510 555 0150", email: "grace.kim@email.com", city: "Alameda, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Paul Kim", relationship: "Spouse", phone: "+1 510 555 0152" },
      },
      {
        name: "Noah Bennett", color: "#5677A8", status: "discharged", focus: "Completed · CBT",
        age: "52", pronouns: "he/him", phone: "+1 415 555 0109", email: "noah.b@email.com", city: "Daly City, CA",
        summary: defaultSummary, goals: defaultGoals,
        emergency: { name: "Susan Bennett", relationship: "Spouse", phone: "+1 415 555 0111" },
      },
    ];

    const patientIds: Record<string, string> = {};
    for (const patient of patients) {
      const patientId = crypto.randomUUID();
      patientIds[patient.name] = patientId;
      await ctx.db.insert("patients", {
        id: patientId,
        name: patient.name,
        email: patient.email,
        phone_number: patient.phone,
        city: patient.city,
        therapist_id: therapistId,
        created_at: nowIso,
        updated_at: nowIso,
        status: patient.status,
        focus: patient.focus,
        pronouns: patient.pronouns,
        age: patient.age,
        summary: patient.summary,
        goals: patient.goals,
        avatar_color: patient.color,
        emergency_contact: JSON.stringify(patient.emergency),
        medical_history: patient.medicalHistory ? JSON.stringify(patient.medicalHistory) : undefined,
      });
    }

    const insertSession = async (session: {
      patient: string; date: string; duration?: number; status?: string;
      payment?: string; amount?: number; mode?: string; type?: string;
    }) => {
      await ctx.db.insert("sessions", {
        id: crypto.randomUUID(),
        patient_id: patientIds[session.patient],
        scheduled_date: session.date,
        duration: session.duration ?? 50,
        session_status: session.status ?? "scheduled",
        payment_status: session.payment ?? "unpaid",
        payment_amount: session.amount ?? 120000,
        mode: session.mode ?? "video",
        session_type: session.type ?? "Therapy session",
        created_at: nowIso,
        updated_at: nowIso,
      });
    };

    // Today's agenda (from the design prototype)
    await insertSession({ patient: "Maya Thompson", date: dayAt(0, 8, 30), status: "completed", payment: "paid", mode: "video", type: "Follow-up · CBT" });
    await insertSession({ patient: "David Okafor", date: dayAt(0, 10, 0), status: "scheduled", mode: "inperson", type: "Therapy session" });
    await insertSession({ patient: "Sofia Marin", date: dayAt(0, 11, 30), duration: 60, status: "scheduled", mode: "inperson", type: "Intake assessment" });
    await insertSession({ patient: "James Lee", date: dayAt(0, 14, 0), status: "scheduled", mode: "video", type: "Progress review" });
    await insertSession({ patient: "Priya Nair", date: dayAt(0, 15, 30), status: "scheduled", mode: "inperson", type: "Follow-up" });
    // Later this week
    await insertSession({ patient: "Liam Walsh", date: dayAt(1, 11, 0), status: "scheduled", mode: "video", type: "Follow-up · CBT" });
    await insertSession({ patient: "Grace Kim", date: dayAt(2, 9, 30), status: "scheduled", mode: "inperson", type: "EMDR session" });

    // Maya's session history (design: paid / unpaid / waived states)
    await insertSession({ patient: "Maya Thompson", date: dayAt(-14, 10, 0), status: "completed", payment: "paid", mode: "video", type: "Follow-up · CBT" });
    await insertSession({ patient: "Maya Thompson", date: dayAt(-28, 10, 0), status: "completed", payment: "unpaid", mode: "inperson", type: "Follow-up · CBT" });
    await insertSession({ patient: "Maya Thompson", date: dayAt(-42, 10, 0), status: "no_show", payment: "waived", amount: 0, mode: "video", type: "Follow-up · CBT" });
    await insertSession({ patient: "Maya Thompson", date: dayAt(-56, 10, 0), status: "completed", payment: "paid", mode: "inperson", type: "Follow-up · CBT" });
    for (let index = 0; index < 7; index++) {
      await insertSession({ patient: "Maya Thompson", date: dayAt(-70 - index * 14, 10, 0), status: "completed", payment: "paid", mode: index % 2 ? "video" : "inperson", type: "Follow-up · CBT" });
    }
    // History for the rest of the caseload
    const backlog: [string, number, string?][] = [
      ["David Okafor", 7, "unpaid"], ["James Lee", 14, "overdue"], ["Priya Nair", 6],
      ["Liam Walsh", 9], ["Grace Kim", 20, "unpaid"], ["Noah Bennett", 18],
    ];
    for (const [name, count, pendingState] of backlog) {
      for (let index = 0; index < count; index++) {
        const isPending = pendingState !== undefined && index < (pendingState === "overdue" ? 2 : 1);
        await insertSession({
          patient: name,
          date: dayAt(-7 - index * 7, 9 + (index % 4), 0),
          status: "completed",
          payment: isPending ? pendingState : "paid",
          mode: index % 2 ? "inperson" : "video",
          type: "Therapy session",
        });
      }
    }

    const noteDate = (dayOffset: number) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
      return date.toISOString().slice(0, 10);
    };
    const notes = [
      {
        patient: "Maya Thompson", title: "Progress note", date: noteDate(0),
        description: "Client reports a marked reduction in anticipatory anxiety this week. Completed all exposure homework…",
        content: "Client reports a marked reduction in anticipatory anxiety this week. Completed all exposure homework and used thought records daily.\n\nMood was stable across the week with no panic episodes reported. Continued cognitive restructuring around catastrophic predictions; client demonstrated improved ability to generate balanced alternatives. Plan: maintain weekly cadence, progress exposure hierarchy to crowded transit.",
      },
      {
        patient: "Maya Thompson", title: "Treatment plan", date: noteDate(-14),
        description: "Updated goals around social avoidance. Introduced graded exposure hierarchy and weekly tracking…",
        content: "Updated goals around social avoidance. Introduced graded exposure hierarchy and weekly tracking of avoidance behaviours.\n\nAgreed to progress from low-intensity exposures (short walks in busy areas) toward crowded transit over the next six weeks, reviewing subjective distress ratings each session.",
      },
      {
        patient: "David Okafor", title: "Follow-up", date: noteDate(-28),
        description: "Reviewed sleep hygiene. Mood stable. Continued cognitive restructuring on catastrophic thoughts…",
        content: "Reviewed sleep hygiene. Mood stable. Continued cognitive restructuring on catastrophic thoughts.\n\nClient engaged with values work and committed action planning; scheduled two pleasant activities for the coming week.",
      },
      {
        patient: "Sofia Marin", title: "Intake assessment", date: noteDate(-100),
        description: "Presenting concern: generalized anxiety with somatic symptoms. No prior therapy. Goals discussed…",
        content: "Presenting concern: generalized anxiety with somatic symptoms. No prior therapy. Goals discussed and collaborative treatment plan drafted.\n\nRisk assessment completed — no acute risk identified. Agreed on weekly sessions with review at week six.",
      },
    ];
    for (const note of notes) {
      await ctx.db.insert("medical_history_notes", {
        id: crypto.randomUUID(),
        patient_id: patientIds[note.patient],
        title: note.title,
        date: note.date,
        description: note.description,
        content: note.content,
        created_at: nowIso,
        updated_at: nowIso,
      });
    }

    const tasks = [
      { label: "Sign off intake notes — Sofia Marin", meta: "Due today", done: false },
      { label: "Send treatment plan — James Lee", meta: "Due tomorrow", done: false },
      { label: "Review AI summary draft — Maya Thompson", meta: "Needs review", done: false },
      { label: "Submit monthly insurance claims", meta: "Done Fri", done: true },
      { label: "Confirm next-week recurring slots", meta: "Done", done: true },
    ];
    for (const [index, task] of tasks.entries()) {
      await ctx.db.insert("tasks", {
        therapist_id: therapistId,
        label: task.label,
        meta: task.meta,
        done: task.done,
        created_at: new Date(Date.now() - (index + 1) * 1000 * 60 * 30).toISOString(),
        completed_at: task.done ? Date.now() - (index + 1) * 1000 * 60 * 10 : undefined,
      });
    }

    const methods = await ctx.db
      .query("payment_methods")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    if (methods.length === 0) {
      await ctx.db.insert("payment_methods", {
        therapist_id: therapistId, brand: "Visa", last4: "4242", exp: "08/28",
        name: therapist.full_name || "Practice card", is_primary: true, created_at: nowIso,
      });
      await ctx.db.insert("payment_methods", {
        therapist_id: therapistId, brand: "Mastercard", last4: "1881", exp: "11/27",
        name: "Practice backup", is_primary: false, created_at: nowIso,
      });
    }

    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_therapist_id", (q) => q.eq("therapist_id", therapistId))
      .collect();
    if (invoices.length === 0) {
      const monthLabel = (offset: number) => {
        const date = new Date(today.getFullYear(), today.getMonth() - offset, 23);
        return {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          month: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          created: date.toISOString(),
        };
      };
      const rows = [
        { n: "006", offset: 0, method: "Visa •••• 4242" },
        { n: "005", offset: 1, method: "Visa •••• 4242" },
        { n: "004", offset: 2, method: "Mastercard •••• 1881" },
      ];
      for (const row of rows) {
        const label = monthLabel(row.offset);
        await ctx.db.insert("invoices", {
          therapist_id: therapistId,
          invoice: `NV-${today.getFullYear()}-${row.n}`,
          date: label.date,
          description: `NEUROVA Individual - ${label.month}`,
          amount: "50.000 COP",
          status: "Paid",
          method: row.method,
          created_at: label.created,
        });
      }
    }

    return { skipped: false, patients: patients.length };
  },
});
