"use client";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditPatientModal } from "@/components/modals/EditPatientModal";
import { ScheduleAppointment } from "@/components/modals/ScheduleAppointment";
import type { Country } from "@/lib/constants/countries";
import { getInitials } from "@/lib/utils";
import { useMutation } from "convex/react";
import { FileDown, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  id: string;
  name: string;
  country_code?: Country;
  phone_number?: string;
  email?: string;
  profile_img?: string;
  gender?: string;
  date_of_birth?: string;
  language?: string;
  height?: number;
  occupation?: string;
  city?: string;
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
  const [editOpen, setEditOpen] = useState(false);
  const updatePatient = useMutation(api.patients.update);

  const save = async (updated: PatientUpdateData) => {
    try {
      await updatePatient({
        id: props.id,
        updates: { ...updated, country_code: updated.country_code ? JSON.stringify(updated.country_code) : undefined },
      });
      toast.success("Patient updated");
    } catch (error) {
      toast.error(`Failed to update patient: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const age = props.date_of_birth
    ? Math.max(0, new Date().getFullYear() - new Date(props.date_of_birth).getFullYear())
    : null;
  const phone = props.country_code?.phoneCode && props.phone_number
    ? `${props.country_code.phoneCode} ${props.phone_number}`
    : props.phone_number || "—";

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="p-5 text-center">
          <Avatar className="mx-auto mb-3 size-[72px] rounded-[20px]">
            <AvatarImage src={props.profile_img} alt="" className="object-cover" />
            <AvatarFallback className="rounded-[20px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)] text-[26px] font-extrabold text-white">{getInitials(props.name)}</AvatarFallback>
          </Avatar>
          <div className="text-[18px] font-extrabold text-foreground">{props.name}</div>
          <div className="mb-2.5 text-[12.5px] text-muted-foreground">{props.gender || "Patient"}{age !== null ? ` · ${age} yrs` : ""}</div>
          <span className="rounded-full bg-[#e2f1ea] px-3 py-1 text-[11px] font-bold text-[#15986a] dark:bg-[#11302a] dark:text-[#2ba378]">Active</span>

          <div className="mt-4"><ScheduleAppointment variant="outline" /></div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-9 px-2 text-[11.5px]" onClick={() => toast.info("PDF export is available from the records page")}><FileDown size={13} />Export PDF</Button>
            <Button variant="outline" className="h-9 px-2 text-[11.5px]" onClick={() => setEditOpen(true)}><Pencil size={13} />Edit</Button>
          </div>
        </div>

        <div className="border-t border-border p-[18px]">
          <div className="mb-[13px] text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">Contact</div>
          <div className="flex flex-col gap-[11px] text-[12.5px]">
            <div className="flex items-center gap-2.5"><Phone size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="font-mono text-foreground/80">{phone}</span></div>
            <div className="flex items-center gap-2.5"><Mail size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="break-all text-foreground/80">{props.email || "—"}</span></div>
            <div className="flex items-center gap-2.5"><MapPin size={15} strokeWidth={1.8} className="flex-none text-[var(--nv-faint)]" /><span className="text-foreground/80">{props.city || props.occupation || "—"}</span></div>
          </div>
        </div>
      </Card>

      <EditPatientModal
        open={editOpen}
        onOpenChange={setEditOpen}
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
        onSave={save}
      />
    </>
  );
};
