"use client";

import { api } from "@/convex/_generated/api";
import { EditEmergencyContactModal } from "@/components/modals/EditEmergencyContactModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COUNTRIES } from "@/lib/constants/countries";
import type { EmergencyContact } from "@/lib/types";
import { useMutation } from "convex/react";
import { AlertTriangle, Pencil, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const EmergencyContactCard = ({ emergency_contact, patientId }: { emergency_contact?: EmergencyContact; patientId: string }) => {
  const [open, setOpen] = useState(false);
  const updatePatient = useMutation(api.patients.update);

  const save = async (contact: EmergencyContact) => {
    try {
      await updatePatient({ id: patientId, updates: { emergency_contact: JSON.stringify(contact) } });
      toast.success("Emergency contact updated");
    } catch (error) {
      toast.error(`Failed to update contact: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <Card className="p-[18px]">
        <div className="mb-[13px] flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Emergency contact</div>
          <AlertTriangle size={15} strokeWidth={1.8} className="text-[#d2574f]" />
        </div>
        {emergency_contact?.name || emergency_contact?.phone ? (
          <div>
            <div className="text-[13.5px] font-bold text-foreground">{emergency_contact.name || "Unnamed contact"}</div>
            <div className="mb-1.5 text-xs text-muted-foreground">{emergency_contact.relationship || "Relationship not set"}</div>
            <div className="flex items-center gap-2 font-mono text-[12px] text-foreground/80"><Phone size={13} className="text-[var(--nv-faint)]" />{emergency_contact.country_code?.phoneCode} {emergency_contact.phone}</div>
          </div>
        ) : <div className="text-[12.5px] text-[var(--nv-faint)]">No emergency contact on file.</div>}
        <Button variant="outline" onClick={() => setOpen(true)} className="mt-3 h-8 w-full text-[11.5px]"><Pencil size={13} />Edit contact</Button>
      </Card>

      <EditEmergencyContactModal open={open} onOpenChange={setOpen} contact={emergency_contact || { name: "", country_code: COUNTRIES[0], phone: "", relationship: "" }} onSave={save} />
    </>
  );
};
