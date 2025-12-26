import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Patient } from "@/lib/types";
import { formatDateOfBirth } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/constants/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ViewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  isEditMode?: boolean;
}

export function ViewPatientModal({ open, onOpenChange, patient, isEditMode = false }: ViewPatientModalProps) {
  const [editMode, setEditMode] = useState(false);
  const updatePatient = useMutation(api.patients.update);

  // Update edit mode when modal opens with isEditMode prop
  useEffect(() => {
    if (open) {
      setEditMode(isEditMode);
    }
  }, [open, isEditMode]);

  // Patient info state
  const [name, setName] = useState(patient.name);
  const [email, setEmail] = useState(patient.email || "");
  const [phone, setPhone] = useState(patient.phone_number || "");
  const [city, setCity] = useState(patient.city || "");
  const [occupation, setOccupation] = useState(patient.occupation || "");
  const [language, setLanguage] = useState(patient.language || "");
  const [gender, setGender] = useState(patient.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(patient.date_of_birth || "");
  const [nationalId, setNationalId] = useState(patient.national_id?.toString() || "");

  // Emergency contact state
  const [emergencyName, setEmergencyName] = useState(patient.emergency_contact?.name || "");
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergency_contact?.phone || "");
  const [emergencyRelationship, setEmergencyRelationship] = useState(patient.emergency_contact?.relationship || "");

  const handleSave = async () => {
    try {
      const updates: Record<string, unknown> = {
        name,
        email,
        phone_number: phone,
        city,
        occupation,
        language,
        gender,
        date_of_birth: dateOfBirth,
        national_id: nationalId ? parseInt(nationalId) : undefined,
        emergency_contact: JSON.stringify({
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship,
          country_code: patient.emergency_contact?.country_code || COUNTRIES[0],
        }),
      };

      await updatePatient({ id: patient.id, updates });
      toast.success("Patient updated successfully");
      setEditMode(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update patient: " + message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Patient Information" : "Patient Information"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              {!editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                {editMode ? (
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.name}</p>
                )}
              </div>
              <div>
                <Label>Date of Birth</Label>
                {editMode ? (
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                ) : (
                  <p className="font-medium mt-1">{formatDateOfBirth(patient.date_of_birth)}</p>
                )}
              </div>
              <div>
                <Label>Gender</Label>
                {editMode ? (
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium mt-1 capitalize">{patient.gender || "—"}</p>
                )}
              </div>
              <div>
                <Label>National ID</Label>
                {editMode ? (
                  <Input
                    type="number"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                ) : (
                  <p className="font-medium mt-1">{patient.national_id || "—"}</p>
                )}
              </div>
              <div>
                <Label>Phone</Label>
                {editMode ? (
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">
                    {patient.country_code?.flag && patient.country_code?.phoneCode && patient.phone_number
                      ? `${patient.country_code.flag} ${patient.country_code.phoneCode} ${patient.phone_number}`
                      : patient.phone_number || "—"}
                  </p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {editMode ? (
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.email || "—"}</p>
                )}
              </div>
              <div>
                <Label>City</Label>
                {editMode ? (
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.city || "—"}</p>
                )}
              </div>
              <div>
                <Label>Occupation</Label>
                {editMode ? (
                  <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.occupation || "—"}</p>
                )}
              </div>
              <div>
                <Label>Language</Label>
                {editMode ? (
                  <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.language || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-red-600">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                {editMode ? (
                  <Input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.emergency_contact?.name || "—"}</p>
                )}
              </div>
              <div>
                <Label>Phone</Label>
                {editMode ? (
                  <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">
                    {patient.emergency_contact?.country_code?.flag &&
                      patient.emergency_contact?.country_code?.phoneCode &&
                      patient.emergency_contact?.phone
                      ? `${patient.emergency_contact.country_code.flag} ${patient.emergency_contact.country_code.phoneCode} ${patient.emergency_contact.phone}`
                      : patient.emergency_contact?.phone || "—"}
                  </p>
                )}
              </div>
              <div>
                <Label>Relationship</Label>
                {editMode ? (
                  <Input value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} />
                ) : (
                  <p className="font-medium mt-1">{patient.emergency_contact?.relationship || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History Summary */}
          {!editMode && patient.medical_history && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Medical History Summary</h3>
              <div className="space-y-3">
                {patient.medical_history.expectations && (
                  <div>
                    <p className="text-sm text-gray-500">Expectations</p>
                    <p className="text-sm">{patient.medical_history.expectations}</p>
                  </div>
                )}
                {patient.medical_history.mainTopic && (
                  <div>
                    <p className="text-sm text-gray-500">Main Topic</p>
                    <p className="text-sm">{patient.medical_history.mainTopic}</p>
                  </div>
                )}
                {patient.medical_history.symptoms && (
                  <div>
                    <p className="text-sm text-gray-500">Symptoms</p>
                    <p className="text-sm">{patient.medical_history.symptoms}</p>
                  </div>
                )}
                {patient.medical_history.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="text-sm">{patient.medical_history.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {editMode && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
