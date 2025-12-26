import { createClient } from "./client";
import { Session, SessionStatus, PaymentStatus } from "@/lib/types";

/**
 * Get all sessions for a specific patient
 */
export async function getSessionsByPatientId(patientId: string): Promise<Session[]> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // First verify the patient belongs to this therapist
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .eq("therapist_id", therapist.id)
    .single();

  if (!patient) throw new Error("Patient not found or access denied");

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("patient_id", patientId)
    .order("scheduled_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Create a new session
 */
export async function createSession(session: Omit<Session, "id" | "created_at" | "updated_at">): Promise<Session> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // Verify the patient belongs to this therapist
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", session.patient_id)
    .eq("therapist_id", therapist.id)
    .single();

  if (!patient) throw new Error("Patient not found or access denied");

  const { data, error } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update an existing session
 */
export async function updateSession(id: string, updates: Partial<Omit<Session, "id" | "created_at" | "updated_at">>): Promise<Session> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // Verify ownership through patient relationship
  const { data: session } = await supabase
    .from("sessions")
    .select("patient_id")
    .eq("id", id)
    .single();

  if (!session) throw new Error("Session not found");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", session.patient_id)
    .eq("therapist_id", therapist.id)
    .single();

  if (!patient) throw new Error("Access denied");

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<void> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // Verify ownership through patient relationship
  const { data: session } = await supabase
    .from("sessions")
    .select("patient_id")
    .eq("id", id)
    .single();

  if (!session) throw new Error("Session not found");

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", session.patient_id)
    .eq("therapist_id", therapist.id)
    .single();

  if (!patient) throw new Error("Access denied");

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Update session status
 */
export async function updateSessionStatus(id: string, status: SessionStatus): Promise<Session> {
  return updateSession(id, { session_status: status });
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Session> {
  return updateSession(id, { payment_status: status });
}

/**
 * Delete session by event ID (used when canceling appointments)
 * This is the primary method for deleting sessions linked to Google Calendar events
 */
export async function deleteSessionByEventId(eventId: string): Promise<void> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // Get session(s) with this event_id and verify ownership
  const { data: sessions, error: fetchError } = await supabase
    .from("sessions")
    .select("*, patients!inner(therapist_id)")
    .eq("patients.therapist_id", therapist.id)
    .eq("event_id", eventId);

  if (fetchError) {
    console.error("Error fetching sessions by event_id:", fetchError);
    throw new Error(fetchError.message);
  }

  if (!sessions || sessions.length === 0) {
    console.log("No sessions found for event_id:", eventId);
    return;
  }

  // Delete the matching session(s)
  const sessionIds = sessions.map(s => s.id);
  const { error: deleteError } = await supabase
    .from("sessions")
    .delete()
    .in("id", sessionIds);

  if (deleteError) {
    console.error("Error deleting sessions:", deleteError);
    throw new Error(deleteError.message);
  }

  console.log(`✅ Successfully deleted ${sessionIds.length} session(s) for event_id: ${eventId}`);
}

/**
 * Delete session by scheduled date (fallback when event_id is not available)
 * @deprecated Use deleteSessionByEventId instead when event_id is available
 */
export async function deleteSessionByDate(scheduledDate: string, patientId?: string): Promise<void> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  // First, get all sessions to find matching one(s)
  // We need to verify the session belongs to this therapist's patient
  const { data: sessions, error: fetchError } = await supabase
    .from("sessions")
    .select("*, patients!inner(therapist_id)")
    .eq("patients.therapist_id", therapist.id)
    .eq("scheduled_date", scheduledDate);

  if (fetchError) {
    console.error("Error fetching sessions:", fetchError);
    throw new Error(fetchError.message);
  }

  if (!sessions || sessions.length === 0) {
    console.log("No sessions found for scheduled_date:", scheduledDate);
    return; // No session found, nothing to delete
  }

  // Filter by patient_id if provided
  const sessionsToDelete = patientId
    ? sessions.filter(s => s.patient_id === patientId)
    : sessions;

  if (sessionsToDelete.length === 0) {
    console.log("No matching sessions found");
    return;
  }

  // Delete the matching session(s)
  const sessionIds = sessionsToDelete.map(s => s.id);
  const { error: deleteError } = await supabase
    .from("sessions")
    .delete()
    .in("id", sessionIds);

  if (deleteError) {
    console.error("Error deleting sessions:", deleteError);
    throw new Error(deleteError.message);
  }

  console.log(`Successfully deleted ${sessionIds.length} session(s)`);
}

/**
 * Update session by scheduled date (used when rescheduling appointments)
 */
export async function updateSessionByDate(
  oldScheduledDate: string,
  newScheduledDate: string,
  duration?: number
): Promise<void> {
  const supabase = createClient();

  // Get current therapist ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!therapist) throw new Error("Therapist profile not found");

  const updates: Partial<Session> = {
    scheduled_date: newScheduledDate,
  };

  if (duration !== undefined) {
    updates.duration = duration;
  }

  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("scheduled_date", oldScheduledDate);

  if (error) throw new Error(error.message);
}
