"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmergencyContact } from "@/lib/types";
import { EditEmergencyContactModal } from "../modals/EditEmergencyContactModal";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/constants/countries";

type Props = {
  emergency_contact?: EmergencyContact;
  patientId: string;
};

export const EmergencyContactCard = ({ emergency_contact, patientId }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updatePatient = useMutation(api.patients.update);

  const handleSave = async (updated: EmergencyContact) => {
    try {
      await updatePatient({
        id: patientId,
        updates: { emergency_contact: JSON.stringify(updated) }
      });
      toast.success("Emergency contact updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update patient: " + message);
    }
  };

  return (
    <>
      <Card className="shadow-xs border border-red-200  relative">
        <CardHeader className="text-center flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-red-500">
            Emergency Contact
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-red-200"
            onClick={() => setIsModalOpen(true)}
          >
            <Pencil className="w-4 h-4 text-red-400" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 space-y-1 text-sm">
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400">Name</span>
            <span className="text-primary text-right">
              {emergency_contact?.name ?? "--"}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400">Phone</span>
            <span className="text-primary text-right">
              {emergency_contact?.country_code?.flag && emergency_contact?.country_code?.phoneCode && emergency_contact?.phone
                ? `${emergency_contact.country_code.flag} ${emergency_contact.country_code.phoneCode} ${emergency_contact.phone}`
                : emergency_contact?.phone || "--"}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-400">Relationship</span>
            <span className="text-primary text-right">
              {emergency_contact?.relationship ?? "--"}
            </span>
          </div>
        </CardContent>
      </Card>

      <EditEmergencyContactModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        contact={{
          name: emergency_contact?.name ?? "",
          country_code: emergency_contact?.country_code ?? COUNTRIES[0],
          phone: emergency_contact?.phone ?? "",
          relationship: emergency_contact?.relationship ?? "",
        }}
        onSave={handleSave}
      />
    </>
  );
};
