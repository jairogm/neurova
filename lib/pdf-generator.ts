import jsPDF from "jspdf";

interface MedicalNote {
  id: string;
  title?: string;
  date?: string;
  description?: string;
  content?: unknown;
}

interface Patient {
  name: string;
  date_of_birth?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  national_id?: number;
}

export const generatePatientMedicalHistoryPDF = (
  patient: Patient,
  notes: MedicalNote[]
): string => {
  const doc = new jsPDF();
  
  // Colors - Neurova blue (typed as tuples for TypeScript)
  const blueRGB: [number, number, number] = [37, 99, 235];
  const lightBlueRGB: [number, number, number] = [219, 234, 254];
  const grayRGB: [number, number, number] = [107, 114, 128];
  const darkGrayRGB: [number, number, number] = [31, 41, 55];
  
  let yPos = 20;
  
  // Logo (top right) - Blue color matching navbar
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...blueRGB);
  doc.text("NEUROVA", 192, 15, { align: "right" });
  
  // Patient header section
  doc.setFillColor(...lightBlueRGB);
  doc.rect(14, yPos, 182, 25, "F");
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkGrayRGB);
  doc.text(patient.name, 18, yPos);
  
  yPos += 7;
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayRGB);
  doc.text(`Generated on ${currentDate}`, 18, yPos);
  
  // Patient Information Section
  yPos += 12;
  doc.setFillColor(...blueRGB);
  doc.rect(14, yPos, 182, 8, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Patient Information", 18, yPos + 5.5);
  
  yPos += 12;
  
  // Patient details in grid format
  doc.setFontSize(9);
  doc.setTextColor(...darkGrayRGB);
  doc.setFont("helvetica", "normal");
  
  const leftCol = 18;
  const midCol = 80;
  const rightCol = 140;
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text("ID:", leftCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(patient.national_id?.toString() || "N/A", leftCol, yPos + 4);
  
  doc.setFont("helvetica", "bold");
  doc.text("Date of Birth:", midCol, yPos);
  doc.setFont("helvetica", "normal");
  const dob = patient.date_of_birth 
    ? new Date(patient.date_of_birth).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "N/A";
  doc.text(dob, midCol, yPos + 4);
  
  doc.setFont("helvetica", "bold");
  doc.text("Gender:", rightCol, yPos);
  doc.setFont("helvetica", "normal");
  const gender = patient.gender 
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    : "N/A";
  doc.text(gender, rightCol, yPos + 4);
  
  yPos += 12;
  
  // Row 2
  doc.setFont("helvetica", "bold");
  doc.text("Email:", leftCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(patient.email || "N/A", leftCol, yPos + 4);
  
  doc.setFont("helvetica", "bold");
  doc.text("Phone:", midCol, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(patient.phone_number || "N/A", midCol, yPos + 4);
  
  yPos += 15;
  
  // Medical History Section
  doc.setFillColor(...blueRGB);
  doc.rect(14, yPos, 182, 8, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Medical History", 18, yPos + 5.5);
  
  yPos += 15;
  
  // Medical Records - Card format
  if (notes.length === 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...grayRGB);
    doc.text("No medical records found.", 18, yPos);
  } else {
    notes.forEach((note) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Date
      const date = note.date
        ? new Date(note.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...blueRGB);
      doc.text(date, 18, yPos);
      
      yPos += 6;
      
      // Title
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkGrayRGB);
      doc.text(note.title || "Untitled", 18, yPos);
      
      yPos += 6;
      
      // Content
      let content = note.description || "No content";
      content = content.replace(/<[^>]*>/g, ""); // Strip HTML
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayRGB);
      
      const maxWidth = 178;
      const lines = doc.splitTextToSize(content, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 18, yPos);
        yPos += 4.5;
      });
      
      // Separator line
      yPos += 3;
      doc.setDrawColor(...grayRGB);
      doc.setLineWidth(0.3);
      doc.line(18, yPos, 196, yPos);
      
      yPos += 8;
    });
  }
  
  // Watermark and Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add watermark
    doc.saveGraphicsState();
    // @ts-expect-error - jsPDF GState typing issue
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(50);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 150);
    
    // Rotate and center the watermark
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.text(
      "CONFIDENTIAL",
      pageWidth / 2,
      pageHeight / 2,
      { align: "center", angle: 45 }
    );
    doc.restoreGraphicsState();
    
    // Page number
    doc.setFontSize(8);
    doc.setTextColor(...grayRGB);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 15,
      { align: "center" }
    );
    
    // Confidential notice
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...grayRGB);
    doc.text(
      "CONFIDENTIAL - This document contains private medical information",
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }
  
  // Set PDF metadata for filename
  doc.setProperties({
    title: `Medical History - ${patient.name}`,
    subject: 'Patient Medical History',
    author: 'Neurova',
    keywords: 'medical, history, patient',
    creator: 'Neurova Medical System'
  });
  
  // Return as blob URL
  const pdfBlob = doc.output("blob");
  return URL.createObjectURL(pdfBlob);
};

export const downloadPDF = (blobUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  link.click();
};
