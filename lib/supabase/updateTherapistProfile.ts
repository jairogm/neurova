import { createClient } from "./client";
import { TherapistProfile } from "../types";

export async function updateTherapistProfile(profile: Partial<TherapistProfile>): Promise<TherapistProfile> {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  // First, check if therapist profile exists
  const { data: existingProfile } = await supabase
    .from("therapists")
    .select("id")
    .eq("user_id", user.id)
    .single();
  
  let result;
  
  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from("therapists")
      .update({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        specialization: profile.specialization,
        license_number: profile.license_number,
        years_of_experience: profile.years_of_experience,
        bio: profile.bio,
        profile_image: profile.profile_image,
        office_address: profile.office_address,
        country_code: profile.country_code,
        emergency_contact: profile.emergency_contact,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();
    
    result = { data, error };
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from("therapists")
      .insert([{
        user_id: user.id,
        full_name: profile.full_name,
        email: profile.email || user.email,
        phone: profile.phone,
        specialization: profile.specialization,
        license_number: profile.license_number,
        years_of_experience: profile.years_of_experience,
        bio: profile.bio,
        profile_image: profile.profile_image,
        office_address: profile.office_address,
        country_code: profile.country_code,
        emergency_contact: profile.emergency_contact,
      }])
      .select()
      .single();
    
    result = { data, error };
  }
  
  if (result.error) throw new Error(result.error.message);
  
  return result.data as TherapistProfile;
}