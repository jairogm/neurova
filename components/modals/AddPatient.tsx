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
import { useTranslations } from "next-intl";

interface AddPatientProps {
  variant?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddPatient = ({ variant, open: controlledOpen, onOpenChange }: AddPatientProps) => {
  const t = useTranslations("addPatient");
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
      toast.success(t("successToast"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(t("errorToast", { message }));
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
              ? "flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-primary text-[13px] font-bold text-primary hover:bg-primary/10"
              : "flex h-10 w-full max-w-52 items-center justify-center gap-2 rounded-[10px] bg-primary text-[13px] font-bold text-primary-foreground hover:bg-[#0b7693]"
          }
        >
          <Plus className="text-current" size={16} aria-hidden="true" />
          {t("trigger")}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary"><Plus size={18} strokeWidth={2.2} /></span>
            <div>
              <DialogTitle className="text-[17px] font-extrabold">{t("title")}</DialogTitle>
              <DialogDescription className="mt-1 text-[12.5px]">{t("description")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6" noValidate>
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              {t("fullName")} <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t("fullNamePlaceholder")}
              value={form.name}
              required
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">
              {t("email")} <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={form.email}
              required
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone with country code */}
          <div className="grid gap-2">
            <Label htmlFor="phone_number">
              {t("phoneNumber")} <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <div className="flex gap-2">
              <label htmlFor="country_code" className="sr-only">
                {t("countryCodeLabel")}
              </label>
              <select
                id="country_code"
                value={selectedCountry.iso}
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.iso === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="h-10 min-w-24 rounded-[9px] border border-input bg-card px-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
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
                placeholder={t("phoneNumberPlaceholder")}
                value={form.phone_number}
                required
                aria-required="true"
                aria-invalid={errors.phone_number || errors.country_code ? true : undefined}
                aria-describedby={
                  errors.phone_number
                    ? "phone_number-error"
                    : errors.country_code
                    ? "country_code-error"
                    : undefined
                }
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
              />
            </div>
            {errors.country_code && (
              <p id="country_code-error" role="alert" className="text-red-500 text-sm">{errors.country_code}</p>
            )}
            {errors.phone_number && (
              <p id="phone_number-error" role="alert" className="text-red-500 text-sm">{errors.phone_number}</p>
            )}
          </div>

          <DialogFooter className="mt-6 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-28">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
