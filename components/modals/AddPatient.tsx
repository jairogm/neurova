"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AddPatientProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STATUS_CHIPS = [
  { key: "active", label: "Active" },
  { key: "intake", label: "Intake" },
  { key: "paused", label: "Paused" },
  { key: "discharged", label: "Discharged" },
] as const;

const emptyForm = {
  name: "",
  pronouns: "",
  age: "",
  email: "",
  phone: "",
  location: "",
  status: "active",
  focus: "",
  goal: "",
  summary: "",
  ecName: "",
  ecRel: "",
  ecPhone: "",
};

const fieldClass = "w-full rounded-[10px] border border-border bg-secondary px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const labelClass = "mb-[7px] block text-xs font-bold text-foreground/80";

export const AddPatient = ({ open: controlledOpen, onOpenChange }: AddPatientProps) => {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPatient = useMutation(api.patients.create);

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open]);

  const setField = (key: keyof typeof emptyForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Patient name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createPatient({
        name,
        email: form.email || undefined,
        phone_number: form.phone || undefined,
        city: form.location || undefined,
        status: form.status,
        focus: form.focus || "New patient",
        pronouns: form.pronouns || undefined,
        age: form.age || undefined,
        summary: form.summary || "New patient. Add presenting concerns and goals after the first session.",
        goals: JSON.stringify([{ text: form.goal || "Define initial treatment goals", tone: "primary" }]),
        emergency_contact: JSON.stringify({ name: form.ecName, relationship: form.ecRel, phone: form.ecPhone }),
      });
      toast.success("Patient created");
      setOpen(false);
      if (created?.id) router.push(`/patients/${created.id}`);
    } catch {
      toast.error("Failed to create patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] w-[680px] max-w-[94vw] gap-0 overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-[22px] py-5 pr-12 text-left">
          <DialogTitle className="text-[17px] font-extrabold text-foreground">Add patient</DialogTitle>
          <DialogDescription className="mt-[3px] text-[12.5px] text-muted-foreground">
            Set up the core patient info, presenting focus, and first treatment goal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-[18px] p-[22px]">
          <div className="grid gap-[13px] sm:grid-cols-[1.2fr_.7fr_.4fr]">
            <div><label className={labelClass} htmlFor="np-name">Full name</label><input id="np-name" value={form.name} onChange={setField("name")} placeholder="Patient name" className={fieldClass} /></div>
            <div><label className={labelClass} htmlFor="np-pronouns">Pronouns</label><input id="np-pronouns" value={form.pronouns} onChange={setField("pronouns")} placeholder="she/her" className={fieldClass} /></div>
            <div><label className={labelClass} htmlFor="np-age">Age</label><input id="np-age" value={form.age} onChange={setField("age")} placeholder="34" className={fieldClass} /></div>
          </div>

          <div className="grid gap-[13px] sm:grid-cols-2">
            <div><label className={labelClass} htmlFor="np-email">Email</label><input id="np-email" type="email" value={form.email} onChange={setField("email")} placeholder="patient@email.com" className={fieldClass} /></div>
            <div><label className={labelClass} htmlFor="np-phone">Phone</label><input id="np-phone" value={form.phone} onChange={setField("phone")} placeholder="+1 555 000 0000" className={fieldClass} /></div>
          </div>

          <div><label className={labelClass} htmlFor="np-location">Location</label><input id="np-location" value={form.location} onChange={setField("location")} placeholder="City, state" className={fieldClass} /></div>

          <div>
            <span className={labelClass}>Status</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, status: chip.key }))}
                  className={`rounded-full border px-[13px] py-2 text-xs font-bold transition-colors ${form.status === chip.key ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground/80 hover:border-primary/50"}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-[13px] sm:grid-cols-2">
            <div><label className={labelClass} htmlFor="np-focus">Presenting focus</label><input id="np-focus" value={form.focus} onChange={setField("focus")} placeholder="Anxiety · CBT" className={fieldClass} /></div>
            <div><label className={labelClass} htmlFor="np-goal">First active goal</label><input id="np-goal" value={form.goal} onChange={setField("goal")} placeholder="Define initial treatment goals" className={fieldClass} /></div>
          </div>

          <div><label className={labelClass} htmlFor="np-summary">Summary / formulation</label><textarea id="np-summary" value={form.summary} onChange={setField("summary")} placeholder="Brief clinical summary or intake notes" className={`${fieldClass} min-h-[82px] resize-y leading-normal`} /></div>

          <div className="rounded-[13px] border border-border bg-secondary p-3.5">
            <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[.08em] text-muted-foreground">Emergency contact</div>
            <div className="grid gap-2.5 sm:grid-cols-[1fr_.8fr_.8fr]">
              <input aria-label="Emergency contact name" value={form.ecName} onChange={setField("ecName")} placeholder="Name" className={`${fieldClass} bg-card px-[11px] py-[9px] text-[12.5px]`} />
              <input aria-label="Emergency contact relationship" value={form.ecRel} onChange={setField("ecRel")} placeholder="Relationship" className={`${fieldClass} bg-card px-[11px] py-[9px] text-[12.5px]`} />
              <input aria-label="Emergency contact phone" value={form.ecPhone} onChange={setField("ecPhone")} placeholder="Phone" className={`${fieldClass} bg-card px-[11px] py-[9px] text-[12.5px]`} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 px-[22px] pb-[22px]">
          <button type="button" onClick={() => setOpen(false)} className="rounded-[10px] border border-border bg-card px-[18px] py-2.5 text-[13px] font-bold text-foreground/80">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={isSubmitting} className="flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(11,90,95,.4)] transition-colors hover:bg-[#0b7693] disabled:opacity-60">
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}Create patient
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
