import { z } from "zod";

const countrySchema = z.object({
  iso: z.string().length(2, "ISO code must be 2 characters"),
  name: z.string().min(1, "Country name is required"),
  phoneCode: z.string().refine((val) => /^\+\d+$/.test(val), {
    message: "Invalid phone code format",
  }),
  flag: z.string().min(1, "Flag emoji is required"),
});

export const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  country_code: countrySchema,
  phone_number: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .refine((val) => /^\d+$/.test(val), {
      message: "Phone number must contain only digits",
    }),
});


export type PatientSchema = z.infer<typeof patientSchema>;
