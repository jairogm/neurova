-- Enable RLS on medical_history_notes table
ALTER TABLE public.medical_history_notes ENABLE ROW LEVEL SECURITY;

-- Policy for therapists to view medical history notes of their own patients
CREATE POLICY "Therapists can view notes of their patients" ON public.medical_history_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients p
    INNER JOIN public.therapists t ON t.id = p.therapist_id
    WHERE p.id = medical_history_notes.patient_id 
    AND t.user_id = auth.uid()
  )
);

-- Policy for therapists to insert medical history notes for their own patients
CREATE POLICY "Therapists can insert notes for their patients" ON public.medical_history_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.patients p
    INNER JOIN public.therapists t ON t.id = p.therapist_id
    WHERE p.id = medical_history_notes.patient_id 
    AND t.user_id = auth.uid()
  )
);

-- Policy for therapists to update medical history notes of their own patients
CREATE POLICY "Therapists can update notes of their patients" ON public.medical_history_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients p
    INNER JOIN public.therapists t ON t.id = p.therapist_id
    WHERE p.id = medical_history_notes.patient_id 
    AND t.user_id = auth.uid()
  )
);

-- Policy for therapists to delete medical history notes of their own patients
CREATE POLICY "Therapists can delete notes of their patients" ON public.medical_history_notes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM public.patients p
    INNER JOIN public.therapists t ON t.id = p.therapist_id
    WHERE p.id = medical_history_notes.patient_id 
    AND t.user_id = auth.uid()
  )
);