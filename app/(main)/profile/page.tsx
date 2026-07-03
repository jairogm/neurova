"use client";

import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { initialsFor } from "@/lib/nv";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useUser();
  const therapist = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "", title: "", email: "", phone: "", specialization: "",
    license_number: "", bio: "", office_address: "",
    emergency_name: "", emergency_phone: "",
  });

  useEffect(() => {
    if (therapist) {
      let emergency = { name: "", phone: "" };
      try {
        if (therapist.emergency_contact) emergency = { ...emergency, ...JSON.parse(therapist.emergency_contact) };
      } catch { /* keep defaults */ }
      setProfile({
        full_name: therapist.full_name || "",
        title: therapist.title || "",
        email: therapist.email || "",
        phone: therapist.phone || "",
        specialization: therapist.specialization || "",
        license_number: therapist.license_number || "",
        bio: therapist.bio || "",
        office_address: therapist.office_address || "",
        emergency_name: emergency.name || "",
        emergency_phone: emergency.phone || "",
      });
    } else if (therapist === null && user) {
      setProfile((current) => ({ ...current, full_name: user.fullName || "", email: user.primaryEmailAddress?.emailAddress || "" }));
    }
  }, [therapist, user]);

  const initials = initialsFor(profile.full_name || profile.email || "NV") || "NV";

  const setField = (key: keyof typeof profile) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try { await user.setProfileImage({ file }); toast.success("Profile picture updated"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Failed to update picture"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: profile.full_name,
        title: profile.title,
        phone: profile.phone,
        specialization: profile.specialization,
        license_number: profile.license_number,
        office_address: profile.office_address,
        bio: profile.bio,
        emergency_contact: JSON.stringify({ name: profile.emergency_name, phone: profile.emergency_phone }),
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (therapist === undefined) return <div className="mx-auto grid max-w-[980px] gap-[18px] px-6 py-8 lg:grid-cols-[1.1fr_.9fr]"><Skeleton className="h-[620px] rounded-[18px]" /><Skeleton className="h-[420px] rounded-[18px]" /></div>;

  const fieldLabel = "mb-[7px] block text-xs font-bold text-foreground/80";

  return (
    <div className="mx-auto max-w-[980px] px-3.5 py-[18px] sm:px-[22px] sm:py-[22px] xl:px-[30px] xl:py-[26px]">
      <div className="mb-5 flex items-center gap-4">
        <button type="button" onClick={() => fileInput.current?.click()} className="group relative block flex-none rounded-[20px]" aria-label="Change profile picture">
          <Avatar className="size-16 rounded-[20px]">
            <AvatarImage src={user?.imageUrl} alt="" />
            <AvatarFallback className="rounded-[20px] bg-[linear-gradient(135deg,#0e96b8,#0b7693)] text-[22px] font-extrabold text-white">{initials}</AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-[#081d25]/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          </span>
        </button>
        <input ref={fileInput} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-.02em] text-foreground">Therapist profile</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">Add your professional information for documents, appointments, and patient-facing details.</p>
        </div>
      </div>

      <div className="grid items-start gap-[18px] lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5">
          <h2 className="mb-4 text-[15px] font-extrabold text-foreground">Professional details</h2>
          <div className="grid gap-[13px] sm:grid-cols-2">
            <div><Label htmlFor="profile-name" className={fieldLabel}>Name</Label><Input id="profile-name" value={profile.full_name} onChange={setField("full_name")} placeholder="Your name" /></div>
            <div><Label htmlFor="profile-title" className={fieldLabel}>Title</Label><Input id="profile-title" value={profile.title} onChange={setField("title")} placeholder="Clinical Psychologist" /></div>
            <div><Label htmlFor="profile-email" className={fieldLabel}>Email</Label><Input id="profile-email" value={profile.email} disabled className="bg-secondary" /></div>
            <div><Label htmlFor="profile-phone" className={fieldLabel}>Phone</Label><Input id="profile-phone" value={profile.phone} onChange={setField("phone")} placeholder="+1 555 000 0000" /></div>
            <div><Label htmlFor="profile-license" className={fieldLabel}>License number</Label><Input id="profile-license" value={profile.license_number} onChange={setField("license_number")} placeholder="PSY-123456" /></div>
            <div><Label htmlFor="profile-specialty" className={fieldLabel}>Specialization</Label><Input id="profile-specialty" value={profile.specialization} onChange={setField("specialization")} placeholder="CBT, trauma, anxiety" /></div>
          </div>
          <div className="mt-[13px]"><Label htmlFor="profile-address" className={fieldLabel}>Office address</Label><Input id="profile-address" value={profile.office_address} onChange={setField("office_address")} placeholder="Practice address" /></div>
          <div className="mt-[13px]"><Label htmlFor="profile-bio" className={fieldLabel}>Bio</Label><Textarea id="profile-bio" rows={5} value={profile.bio} onChange={setField("bio")} placeholder="Short professional bio" /></div>
          <div className="mt-5 flex justify-end">
            <Button onClick={save} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin" />}Save changes</Button>
          </div>
        </Card>

        <div className="flex flex-col gap-[18px]">
          <Card className="p-5">
            <h2 className="mb-3.5 text-[15px] font-extrabold text-foreground">Preview</h2>
            <div className="flex items-center gap-3 rounded-[13px] border border-border bg-secondary p-[13px]">
              <Avatar className="size-[42px] flex-none rounded-full">
                <AvatarImage src={user?.imageUrl} alt="" />
                <AvatarFallback className="bg-[linear-gradient(135deg,#0e96b8,#0b7693)] font-extrabold text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-extrabold text-foreground">{profile.full_name || "Therapist"}</div>
                <div className="truncate text-xs text-muted-foreground">{profile.title || "Clinical professional"}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-foreground">Emergency contact</h2>
              <AlertTriangle size={15} strokeWidth={1.8} className="text-[#d2574f] dark:text-[#e0726a]" />
            </div>
            <div className="flex flex-col gap-3">
              <div><Label htmlFor="therapist-emergency-name" className="sr-only">Contact name</Label><Input id="therapist-emergency-name" value={profile.emergency_name} onChange={setField("emergency_name")} placeholder="Contact name" /></div>
              <div><Label htmlFor="therapist-emergency-phone" className="sr-only">Contact phone</Label><Input id="therapist-emergency-phone" value={profile.emergency_phone} onChange={setField("emergency_phone")} placeholder="Contact phone" /></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
