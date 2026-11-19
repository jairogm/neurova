"use client";
import { useLocale } from "next-intl";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { formatLocalDateTime } from "@/lib/utils";
import { COUNTRIES, Country } from "@/lib/constants/countries";

type PatientData = {
  name: string;
  country_code?: Country;
  phone_number?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  language?: string;
  occupation?: string;
};

interface EditPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientData;
  onSave: (updated: PatientData) => void;
}

export function EditPatientModal({
  open,
  onOpenChange,
  patient,
  onSave,
}: EditPatientModalProps) {
  const locale = useLocale();
  const tr = useWorkspaceText();
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    patient.country_code || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formValues, setFormValues] = useState<
    Omit<PatientData, "country_code" | "phone_number">
  >({
    name: patient.name,
    email: patient.email,
    gender: patient.gender ?? "",
    date_of_birth: patient.date_of_birth ?? "",
    language: patient.language ?? "",
    occupation: patient.occupation ?? "",
  });
  const [dob, setDob] = useState<Date | undefined>(
    patient.date_of_birth ? new Date(patient.date_of_birth) : undefined
  );

  // Load country code and phone number from patient data
  useEffect(() => {
    if (patient.country_code) {
      setSelectedCountry(patient.country_code);
    }
    if (patient.phone_number) {
      setPhoneNumber(patient.phone_number);
    }
    // Update form values when patient data changes
    setFormValues({
      name: patient.name,
      email: patient.email,
      gender: patient.gender ?? "",
      date_of_birth: patient.date_of_birth ?? "",
      language: patient.language ?? "",
      occupation: patient.occupation ?? "",
    });
  }, [patient]);

  const handleChange = (key: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClick = () => {
    const updated: PatientData = {
      ...formValues,
      country_code: selectedCountry,
      phone_number: phoneNumber,
      date_of_birth: dob ? formatLocalDateTime(dob) : undefined,
    };
    onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="text-[17px] font-extrabold">{tr("Edit patient")}</DialogTitle>
          <DialogDescription>{tr("Update the patients details below.")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {/* Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">{tr("Name")}</label>
            <Input
              value={formValues.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={tr("Enter patient name")}
            />
          </div>

          {/* Phone with country code */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">{tr("Phone")}</label>
            <div className="flex gap-2">
              <select
                value={selectedCountry.iso}
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.iso === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="h-10 min-w-24 rounded-[9px] border border-input bg-card px-2 text-[13px] outline-none focus:border-primary"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.iso} value={country.iso}>
                    {country.flag} {country.phoneCode}
                  </option>
                ))}
              </select>
              <Input
                type="tel"
                placeholder="3001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">{tr("Email")}</label>
            <Input
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Gender + Date of Birth */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Gender */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">{tr("Gender")}</label>
              <Select
                value={formValues.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tr("Select gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{tr("Male")}</SelectItem>
                  <SelectItem value="female">{tr("Female")}</SelectItem>
                  <SelectItem value="other">{tr("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">{tr("Date of Birth")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!dob ? "text-muted-foreground" : ""
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? dob.toLocaleDateString(locale, { dateStyle: "long" }) : <span>{tr("Pick a date")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dob}
                    onSelect={setDob}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Language */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">{tr("Language")}</label>
            <Input
              value={formValues.language}
              onChange={(e) => handleChange("language", e.target.value)}
            />
          </div>

          {/* Occupation */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">{tr("Occupation")}</label>
            <Input
              value={formValues.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
            />
          </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tr("Cancel")}</Button>
          <Button onClick={handleSaveClick}>{tr("Save Changes")}</Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
