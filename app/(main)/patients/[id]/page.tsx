// app/patients/[id]/page.tsx
import PatientDetailClient from "@/components/PatientDetailClient";

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto">
      <PatientDetailClient id={id} />
    </div>
  );
}
