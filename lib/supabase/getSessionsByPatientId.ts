import { createClient } from "./client";

export async function getSessionsByPatientId(patientId: string) {
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
    .from("medical_history_notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
