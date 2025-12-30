"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { patientSchema } from "@/lib/schemas/patient";
import { COUNTRIES, Country } from "@/lib/constants/countries";
import { toast } from "sonner";

interface AddPatientProps {
  variant?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddPatient = ({ variant, open: controlledOpen, onOpenChange }: AddPatientProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPatient = useMutation(api.patients.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = patientSchema.safeParse({
      name: form.name,
      email: form.email,
      country_code: selectedCountry,
      phone_number: form.phone_number,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await createPatient({
        name: result.data.name,
        email: result.data.email,
        phone_number: result.data.phone_number,
        country_code: JSON.stringify(result.data.country_code),
      });

      setForm({ name: "", email: "", phone_number: "" });
      setSelectedCountry(COUNTRIES[0]);
      setOpen(false);
      toast.success("Patient created successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to create patient: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger if not controlled externally */}
      {controlledOpen === undefined && (
        <DialogTrigger
          className={
            variant
              ? `border-sky-500 text-sky-600 hover:text-sky-600 w-full border rounded-md flex items-center justify-center gap-2 p-2`
              : `bg-sky-600 border-sky-600 text-white hover:bg-sky-500 hover:text-white rounded-md w-full max-w-52 flex items-center justify-center gap-2 p-2`
          }
        >
          <Plus className={variant ? `text-sky-600` : `text-white`} size={20} />
          Add Patient
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new patient</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone with country code */}
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <div className="flex gap-2">
              <select
                value={selectedCountry.iso}
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.iso === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="border rounded-md px-2 py-1 text-sm min-w-24"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.flag} {country.phoneCode}
                  </option>
                ))}
              </select>
              <Input
                id="phone_number"
                type="tel"
                placeholder="3001234567"
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
              />
            </div>
            {errors.country_code && (
              <p className="text-red-500 text-sm">{errors.country_code}</p>
            )}
            {errors.phone_number && (
              <p className="text-red-500 text-sm">{errors.phone_number}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
