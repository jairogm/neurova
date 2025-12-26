import { createClient } from "@/lib/supabase/client";

export async function deletePatient(id: string) {
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

  // Delete the patient (only if it belongs to the current therapist)
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("therapist_id", therapist.id);

  if (error) throw error;
}