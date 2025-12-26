import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patients: defineTable({
    // Preserving Supabase ID for reference/migration
    id: v.string(), // This was a UUID in Supabase
    name: v.string(),
    date_of_birth: v.optional(v.string()), // saved as string yyyy-mm-dd
    gender: v.optional(v.string()),
    national_id: v.optional(v.number()),
    phone_number: v.optional(v.string()),
    email: v.optional(v.string()),
    city: v.optional(v.string()),
    occupation: v.optional(v.string()),
    emergency_contact: v.optional(v.string()), // It's a JSON string in the dump
    medical_history: v.optional(v.string()), // JSON string in dump
    created_at: v.string(),
    updated_at: v.string(),
    profile_img: v.optional(v.any()), // null in dump, unsure of type, using any or optional string
    language: v.optional(v.string()),
    height: v.optional(v.any()), // null in dump
    therapist_id: v.string(), // UUID string
    country_code: v.optional(v.string()), // JSON string
  }).index("by_therapist_id", ["therapist_id"]),

  therapists: defineTable({
    id: v.optional(v.string()), // Supabase UUID (optional for new)
    user_id: v.optional(v.string()), // Supabase Auth User ID (kept for migrated data)
    clerk_user_id: v.optional(v.string()), 
    bio: v.optional(v.string()),
    email: v.optional(v.string()),
    years_of_experience: v.optional(v.number()),
    created_at: v.string(),
    updated_at: v.string(),
    license_number: v.optional(v.string()),
    full_name: v.optional(v.string()),
    phone: v.optional(v.string()),
    specialization: v.optional(v.string()),
    office_address: v.optional(v.string()),
    country_code: v.optional(v.string()), // JSON string
    profile_image: v.optional(v.any()),
    emergency_contact: v.optional(v.string()), // JSON string
    calendar_info: v.optional(v.string()), // JSON string
    subscription_plan: v.optional(v.string()),
    subscription_status: v.optional(v.string()),
    subscription_expires_at: v.optional(v.any()),
    patient_limit: v.optional(v.number()),
    payment_provider: v.optional(v.string()), // Keep for migrated data
  }).index("by_user_id", ["user_id"]).index("by_clerk_id", ["clerk_user_id"]).index("by_email", ["email"]),

  sessions: defineTable({
    id: v.optional(v.string()),
    patient_id: v.string(),
    scheduled_date: v.string(),
    duration: v.optional(v.number()),
    session_status: v.optional(v.string()),
    payment_status: v.optional(v.string()),
    payment_amount: v.optional(v.any()),
    notes: v.optional(v.string()),
    created_at: v.string(),
    updated_at: v.string(),
    event_id: v.optional(v.string()),
  }).index("by_patient_id", ["patient_id"]),

  medical_history_notes: defineTable({
    id: v.optional(v.string()),
    patient_id: v.string(),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    content: v.optional(v.string()), // JSON string for EditorJS
    created_at: v.string(),
    updated_at: v.string(),
    description: v.optional(v.string()),
  }).index("by_patient_id", ["patient_id"]),

  therapist_patients: defineTable({
    therapist_id: v.string(),
    patient_id: v.string(),
    created_at: v.string(),
  })
  .index("by_therapist_id", ["therapist_id"])
  .index("by_patient_id", ["patient_id"]),
});
