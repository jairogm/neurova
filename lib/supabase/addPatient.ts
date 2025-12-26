// lib/supabase/addPatient.ts
import { createClient } from "@/lib/supabase/client";
import { Country } from "@/lib/constants/countries";

export async function addPatient(data: {
  name: string;
  email: string;
  country_code: Country;
  phone_number: string;
}) {
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
  
  const { error } = await supabase.from("patients").insert([
    {
      name: data.name,
      email: data.email,
      country_code: data.country_code,
      phone_number: data.phone_number,
      therapist_id: therapist.id,
    },
  ]);

  if (error) throw error;
}
