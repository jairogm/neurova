"use client";

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
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { formatLocalDateTime } from "@/lib/utils";
import { COUNTRIES, Country } from "@/lib/constants/countries";

type PatientData = {
  name: string;
  country_code: Country;
  phone_number: string;
  email: string;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Patient Info</DialogTitle>
          <DialogDescription>
            Update the patients details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formValues.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          {/* Phone with country code */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone</label>
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
                type="tel"
                placeholder="3001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Gender + Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Gender</label>
              <Select
                value={formValues.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !dob ? "text-muted-foreground" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, "PPP") : <span>Pick a date</span>}
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
            <label className="text-sm font-medium">Language</label>
            <Input
              value={formValues.language}
              onChange={(e) => handleChange("language", e.target.value)}
            />
          </div>

          {/* Occupation */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Occupation</label>
            <Input
              value={formValues.occupation}
              onChange={(e) => handleChange("occupation", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveClick}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
