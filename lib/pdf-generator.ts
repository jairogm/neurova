import jsPDF from "jspdf";

type RGB = [number, number, number];

// NEUROVA light-theme palette (app/globals.css) — exported documents always use the light look.
const TEAL: RGB = [14, 150, 184]; // --primary
const TEAL_DARK: RGB = [11, 118, 147]; // --accent-foreground
const INK: RGB = [21, 37, 44]; // --foreground
const MUTED: RGB = [108, 130, 140]; // --muted-foreground
const FAINT: RGB = [147, 166, 174]; // --nv-faint
const BORDER: RGB = [226, 233, 235]; // --border
const CARD_BG: RGB = [251, 252, 252]; // --sidebar

// Patient status pills, light variants of lib/nv statusTone.
const STATUS_TONES: Record<string, { label: string; bg: RGB; fg: RGB }> = {
  active: { label: "Active", bg: [226, 241, 234], fg: [21, 152, 106] },
  intake: { label: "Intake", bg: [226, 238, 243], fg: [44, 143, 176] },
  paused: { label: "Paused", bg: [246, 236, 216], fg: [190, 124, 22] },
  discharged: { label: "Discharged", bg: [234, 239, 240], fg: [108, 130, 140] },
};

interface MedicalNote {
  title?: string;
  date?: string;
  created_at?: string;
  description?: string;
  content?: unknown; // EditorJS OutputData object, JSON string, or null
}

interface PatientInfo {
  name: string;
  status?: string;
  pronouns?: string;
  age?: string;
  focus?: string;
  summary?: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: number;
  email?: string;
  phone_number?: string;
  city?: string;
}

interface EditorBlock {
  type?: string;
  data?: {
    text?: string;
    level?: number;
    style?: string;
    items?: unknown[];
    caption?: string;
  };
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BOTTOM_LIMIT = PAGE_H - 25;

function htmlToText(value: unknown): string {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function blocksOf(content: unknown): EditorBlock[] {
  let data = content;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  const blocks = (data as { blocks?: unknown } | null)?.blocks;
  return Array.isArray(blocks) ? (blocks as EditorBlock[]) : [];
}

function listItemText(item: unknown): { text: string; children: unknown[] } {
  if (typeof item === "string") return { text: htmlToText(item), children: [] };
  const record = (item ?? {}) as { content?: string; text?: string; items?: unknown[] };
  return {
    text: htmlToText(record.content ?? record.text ?? ""),
    children: Array.isArray(record.items) ? record.items : [],
  };
}

function longDate(value?: string): string {
  if (!value) return "N/A";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function shortDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function exportPatientMedicalHistoryPDF(patient: PatientInfo, notes: MedicalNote[]) {
  const doc = new jsPDF();
  let y = 0;

  const setColor = (rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);

  const ensure = (height: number) => {
    if (y + height <= BOTTOM_LIMIT) return;
    doc.addPage();
    y = MARGIN + 4;
  };

  // Uppercase tracked label, mirroring the app's section headers. jsPDF's align:"right"
  // ignores charSpace, so right-aligned tracked text is positioned manually.
  const trackedLabel = (text: string, x: number, baseline: number, rgb: RGB, alignRight = false) => {
    const label = text.toUpperCase();
    const charSpace = 0.4;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    setColor(rgb);
    const width = doc.getTextWidth(label) + charSpace * Math.max(label.length - 1, 0);
    doc.text(label, alignRight ? x - width : x, baseline, { charSpace });
    return width;
  };

  const wrapped = (text: string, width: number) =>
    doc.splitTextToSize(text, width) as string[];

  // ===== Header: wordmark + document meta =====
  y = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  setColor(TEAL);
  doc.text("NEUROVA", MARGIN, y, { charSpace: 0.7 });

  trackedLabel("Medical history", PAGE_W - MARGIN, y - 4, MUTED, true);
  const generatedAt = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  setColor(FAINT);
  doc.text(`Generated on ${generatedAt}`, PAGE_W - MARGIN, y + 0.5, { align: "right" });

  y += 6;
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;

  // ===== Patient card =====
  const pad = 7;
  const innerW = CONTENT_W - pad * 2;
  const colW = innerW / 3;

  const fields: Array<{ label: string; value: string }> = [
    { label: "ID", value: patient.national_id?.toString() || "N/A" },
    { label: "Date of birth", value: longDate(patient.date_of_birth) },
    {
      label: "Gender",
      value: patient.gender
        ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
        : "N/A",
    },
    { label: "Email", value: patient.email || "N/A" },
    { label: "Phone", value: patient.phone_number || "N/A" },
    { label: "Location", value: patient.city || "N/A" },
  ];
  if (patient.focus) fields.push({ label: "Focus", value: patient.focus });

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  const fieldRows: Array<Array<{ label: string; lines: string[] }>> = [];
  for (let i = 0; i < fields.length; i += 3) {
    fieldRows.push(
      fields.slice(i, i + 3).map((field) => ({
        label: field.label,
        lines: wrapped(field.value, colW - 5).slice(0, 2),
      }))
    );
  }
  const rowHeights = fieldRows.map(
    (row) => 5 + Math.max(...row.map((cell) => cell.lines.length)) * 4 + 3
  );

  doc.setFontSize(9);
  const summaryLines = patient.summary ? wrapped(patient.summary, innerW) : [];

  const subParts = [patient.pronouns, patient.age ? `${patient.age} yrs` : ""].filter(Boolean);
  const headBlock = 7 + (subParts.length ? 5 : 2.5);
  const summaryBlock = summaryLines.length ? 7 + summaryLines.length * 4 : 0;
  const cardH = pad + headBlock + 4 + rowHeights.reduce((sum, h) => sum + h, 0) + summaryBlock + pad - 2;

  doc.setFillColor(...CARD_BG);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, "FD");

  let cy = y + pad + 4;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  setColor(INK);
  doc.text(patient.name, MARGIN + pad, cy);

  const tone = STATUS_TONES[patient.status?.toLowerCase() || "active"] ?? STATUS_TONES.active;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  const pillW = doc.getTextWidth(tone.label) + 6;
  const pillX = PAGE_W - MARGIN - pad - pillW;
  doc.setFillColor(...tone.bg);
  doc.roundedRect(pillX, cy - 4.2, pillW, 5.8, 2.9, 2.9, "F");
  setColor(tone.fg);
  doc.text(tone.label, pillX + 3, cy - 0.3);

  if (subParts.length) {
    cy += 5.5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(MUTED);
    doc.text(subParts.join("  ·  "), MARGIN + pad, cy);
  }

  cy += 4.5;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + pad, cy, PAGE_W - MARGIN - pad, cy);
  cy += 6.5;

  fieldRows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const x = MARGIN + pad + colIndex * colW;
      trackedLabel(cell.label, x, cy, FAINT);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      setColor(INK);
      cell.lines.forEach((line, lineIndex) => doc.text(line, x, cy + 4.5 + lineIndex * 4));
    });
    cy += rowHeights[rowIndex];
  });

  if (summaryLines.length) {
    trackedLabel("Clinical summary", MARGIN + pad, cy, FAINT);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(MUTED);
    summaryLines.forEach((line, index) => doc.text(line, MARGIN + pad, cy + 4.5 + index * 4));
  }

  y += cardH + 12;

  // ===== Session notes =====
  const sorted = [...notes].sort((a, b) =>
    (a.date || a.created_at || "").localeCompare(b.date || b.created_at || "")
  );

  trackedLabel("Session notes", MARGIN, y, MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(FAINT);
  doc.text(`${sorted.length} ${sorted.length === 1 ? "record" : "records"}`, PAGE_W - MARGIN, y, {
    align: "right",
  });
  y += 3;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  const writeParagraph = (text: string, size: number, rgb: RGB, indent = 0, style = "normal") => {
    if (!text) return;
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    const lineH = size * 0.48;
    for (const line of wrapped(text, CONTENT_W - indent)) {
      ensure(lineH);
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      setColor(rgb);
      doc.text(line, MARGIN + indent, y);
      y += lineH;
    }
  };

  const writeList = (items: unknown[], ordered: boolean, depth = 0) => {
    items.forEach((item, index) => {
      const { text, children } = listItemText(item);
      const marker = ordered ? `${index + 1}.` : "•";
      const indent = 3 + depth * 5;
      if (text) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = wrapped(text, CONTENT_W - indent - 5);
        lines.forEach((line, lineIndex) => {
          ensure(4.4);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          setColor(MUTED);
          if (lineIndex === 0) {
            setColor(TEAL_DARK);
            doc.text(marker, MARGIN + indent, y);
            setColor(MUTED);
          }
          doc.text(line, MARGIN + indent + 5, y);
          y += 4.4;
        });
      }
      if (children.length) writeList(children, ordered, depth + 1);
    });
    y += 1;
  };

  const writeBlocks = (blocks: EditorBlock[]) => {
    for (const block of blocks) {
      const data = block.data ?? {};
      switch (block.type) {
        case "header": {
          const level = Math.min(Math.max(data.level ?? 2, 1), 6);
          y += 1.5;
          writeParagraph(htmlToText(data.text), 12.5 - level * 0.7, INK, 0, "bold");
          y += 0.5;
          break;
        }
        case "list":
        case "checklist":
          writeList(data.items ?? [], data.style === "ordered");
          break;
        case "quote": {
          const start = y;
          writeParagraph(htmlToText(data.text), 9, MUTED, 5, "italic");
          doc.setDrawColor(...TEAL);
          doc.setLineWidth(0.6);
          doc.line(MARGIN + 1, start - 3, MARGIN + 1, y - 2.5);
          if (data.caption) writeParagraph(`— ${htmlToText(data.caption)}`, 8, FAINT, 5, "italic");
          break;
        }
        case "delimiter":
          ensure(6);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          setColor(FAINT);
          doc.text("· · ·", PAGE_W / 2, y, { align: "center" });
          y += 6;
          break;
        default:
          writeParagraph(htmlToText(data.text), 9, MUTED);
      }
      y += 1.5;
    }
  };

  if (sorted.length === 0) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "italic");
    setColor(FAINT);
    doc.text("No session notes on file.", MARGIN, y);
  } else {
    sorted.forEach((note, index) => {
      ensure(24);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      setColor(TEAL_DARK);
      doc.text(shortDate(note.date || note.created_at), MARGIN, y);
      y += 5.5;

      ensure(8);
      doc.setFontSize(11.5);
      doc.setFont("helvetica", "bold");
      setColor(INK);
      doc.text(note.title || "Untitled", MARGIN, y);
      y += 6;

      const blocks = blocksOf(note.content);
      if (blocks.length) {
        writeBlocks(blocks);
      } else {
        writeParagraph(htmlToText(note.description) || "No content", 9, MUTED);
      }

      if (index < sorted.length - 1) {
        y += 3;
        ensure(10);
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 8;
      }
    });
  }

  // ===== Watermark + footer on every page =====
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.saveGraphicsState();
    // @ts-expect-error - jsPDF GState typing issue
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.setFontSize(50);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(108, 130, 140);
    doc.text("CONFIDENTIAL", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
    doc.restoreGraphicsState();

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 16, PAGE_W - MARGIN, PAGE_H - 16);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    setColor(TEAL);
    doc.text("NEUROVA", MARGIN, PAGE_H - 11, { charSpace: 0.4 });

    doc.setFont("helvetica", "normal");
    setColor(FAINT);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 11, { align: "right" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text(
      "CONFIDENTIAL — This document contains private medical information",
      PAGE_W / 2,
      PAGE_H - 11,
      { align: "center" }
    );
  }

  doc.setProperties({
    title: `Medical History - ${patient.name}`,
    subject: "Patient Medical History",
    author: "Neurova",
    keywords: "medical, history, patient",
    creator: "Neurova Medical System",
  });

  const fileName = `${patient.name.trim().replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ") || "Patient"}.pdf`;
  doc.save(fileName);
}
