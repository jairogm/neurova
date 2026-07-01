"use client";

import { useState } from "react";
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
import { EmergencyContact } from "@/lib/types";
import { COUNTRIES, Country } from "@/lib/constants/countries";

interface EditEmergencyContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: EmergencyContact;
  onSave: (updated: EmergencyContact) => void;
}

export function EditEmergencyContactModal({
  open,
  onOpenChange,
  contact,
  onSave,
}: EditEmergencyContactModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    contact.country_code || COUNTRIES[0]
  );
  const [formValues, setFormValues] = useState<EmergencyContact>({
    ...contact,
    phone: contact.phone ?? "",
    country_code: contact.country_code || COUNTRIES[0],
  });

  const handleChange = (key: keyof EmergencyContact, value: string | Country) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const fields: { label: string; key: keyof EmergencyContact }[] = [
    { label: "Name", key: "name" },
    { label: "Relationship", key: "relationship" },
  ];

  const handleSaveClick = () => {
    const updated: EmergencyContact = {
      ...formValues,
      country_code: selectedCountry,
      phone: formValues.phone,
    };
    onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-12">
          <DialogTitle className="text-[17px] font-extrabold">Edit emergency contact</DialogTitle>
          <DialogDescription>Update the emergency contact information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {/* Name and Relationship fields */}
          {fields.map(({ label, key }) => (
            <div key={key} className="grid gap-2">
              <label className="text-sm font-medium">{label}</label>
              <Input
                value={formValues[key]?.toString() ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}

          {/* Phone field with country code */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone</label>
            <div className="flex gap-2">
              <select
                value={selectedCountry.iso}
                onChange={(e) => {
                  const country = COUNTRIES.find(c => c.iso === e.target.value);
                  if (country) {
                    setSelectedCountry(country);
                    handleChange("country_code", country);
                  }
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
                value={formValues.phone?.toString() ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveClick}>Save Changes</Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
