import { Patient } from "../types";
import { createClient } from "./client";

export async function getPatientById(id: string): Promise<Patient> {
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

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", therapist.id)
    .single();

  if (error) throw new Error(error.message);

  return data as Patient;
}
