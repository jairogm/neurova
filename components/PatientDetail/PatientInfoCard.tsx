"use client";

import { useState } from "react";
import { Pencil, MessageCircle, CameraIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, formatDateOfBirth } from "@/lib/utils";
import { EditPatientModal } from "../modals/EditPatientModal";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Country } from "@/lib/constants/countries";

type Props = {
  id: string;
  name: string;
  country_code: Country;
  phone_number?: string;
  email?: string;
  profile_img?: string;
  gender?: string;
  date_of_birth?: string;
  language?: string;
  height?: number;
  occupation?: string;
};

type PatientUpdateData = {
  name?: string;
  country_code?: Country;
  phone_number?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  language?: string;
  occupation?: string;
  [key: string]: unknown;
};

export const PatientInfoCard = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updatePatient = useMutation(api.patients.update);

  const handleSave = async (updated: PatientUpdateData) => {
    try {
      // Convert country_code object to JSON string for storage
      const updates = {
        ...updated,
        country_code: updated.country_code ? JSON.stringify(updated.country_code) : undefined,
      };
      await updatePatient({ id: props.id, updates });
      toast.success("Patient updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update patient: " + message);
    }
  };

  const fields = [
    {
      label: "Phone",
      value: props.country_code?.flag && props.country_code?.phoneCode && props.phone_number
        ? `${props.country_code.flag} ${props.country_code.phoneCode} ${props.phone_number}`
        : props.phone_number || "--"
    },
    { label: "Email", value: props.email },
    { label: "Gender", value: props.gender || "--" },
    { label: "DOB", value: formatDateOfBirth(props.date_of_birth) },
    { label: "Language", value: props.language || "--" },
    { label: "Occupation", value: props.occupation || "--" },
  ];

  return (
    <>
      <Card className="shadow-xs border border-gray-200 relative">
        <CardHeader className="flex flex-col items-center text-center relative">
          <div className="relative w-20 h-20 mb-2">
            <Avatar className="w-full h-full">
              <AvatarImage src={props.profile_img} />
              <AvatarFallback>{getInitials(props.name)}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 shadow-xs">
              <CameraIcon className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          <CardTitle className="text-lg font-semibold">{props.name}</CardTitle>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 hover:bg-gray-100"
            onClick={() => setIsModalOpen(true)}
          >
            <Pencil className="w-4 h-4 text-gray-400" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 space-y-1 text-sm">
          {fields.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center gap-2"
            >
              <span className="text-gray-400">{label}</span>
              <span className="text-primary text-right">{value}</span>
            </div>
          ))}

          <Button>
            <MessageCircle className="mr-2 w-4 h-4" />
            Whatsapp
          </Button>
        </CardContent>
      </Card>

      <EditPatientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        patient={{
          name: props.name,
          country_code: props.country_code,
          phone_number: props.phone_number,
          email: props.email,
          gender: props.gender,
          date_of_birth: props.date_of_birth,
          language: props.language,
          occupation: props.occupation,
        }}
        onSave={handleSave}
      />
    </>
  );
};
