"use client";

import { useState, type FormEvent } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { FileDown, Loader2, Upload, ChevronDown, X } from "lucide-react";

export function PatientDocuments({ patientId }: { patientId: string }) {
  const documents = useQuery(api.patient_documents.list, { patientId });
  const generateUploadUrl = useMutation(api.patient_documents.generateUploadUrl);
  const save = useMutation(api.patient_documents.save);
  const remove = useMutation(api.patient_documents.remove);
  const convex = useConvex();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<"consent" | "other">("consent");
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const hasConsent = documents?.some(document => document.kind === "consent");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
        file.size <= 0 || file.size > 10 * 1024 * 1024) {
      toast.error("Choose a PDF, JPG or PNG up to 10 MB");
      return;
    }
    const form = event.currentTarget;
    setBusy(true);
    try {
      const url = await generateUploadUrl({ patientId });
      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": file.type }, body: file,
      });
      if (!response.ok) throw new Error("Upload failed. Please try again.");
      const { storageId } = await response.json();
      await save({ patientId, storageId, name: file.name, kind });
      setFile(null);
      form.reset();
      toast.success("Document uploaded");
    } catch {
      toast.error("Document could not be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDocument(id: Id<"patient_documents">, name: string) {
    if (deleting || !window.confirm(`Delete "${name}"? This permanently removes the uploaded file and cannot be undone.`)) return;
    setDeleting(id);
    try {
      await remove({ id });
      toast.success("Document deleted");
    } catch {
      toast.error("Unable to delete document. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  async function download(id: Id<"patient_documents">) {
    const preview = window.open("about:blank", "_blank");
    if (!preview) {
      toast.error("Allow pop-ups to open documents");
      return;
    }
    preview.opener = null;
    setOpening(id);
    try {
      const url = await convex.query(api.patient_documents.download, { id });
      if (!url) throw new Error("File unavailable");
      preview.location.href = url;
    } catch {
      preview.close();
      toast.error("Unable to open document");
    } finally {
      setOpening(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold">Patient documents</h2>
        <span role="status" className={`rounded-full px-3 py-1 text-xs font-bold ${hasConsent ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
          {documents === undefined ? "Checking consent…" : hasConsent ? "Consent form uploaded" : "Consent form missing"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Upload the patient&apos;s signed consent form or supporting documents. PDF, JPG or PNG, up to 10 MB each. Uploaded consent forms should be reviewed for completeness.</p>
      <form onSubmit={upload} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-secondary p-4">
        <label className="space-y-1 text-sm font-medium">
          <span className="block">Document type</span>
          <span className="relative block">
          <select value={kind} disabled={busy} onChange={event => setKind(event.target.value as "consent" | "other")} className="min-h-11 w-full appearance-none rounded-lg border border-border bg-card py-2.5 pl-4 pr-11 leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <option value="consent">Signed consent form</option>
            <option value="other">Other document</option>
          </select>
          <ChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>
        <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
          <span className="block">File</span>
          <input required type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={busy} onChange={event => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-lg border border-border bg-card p-2 text-sm" />
        </label>
        <button type="submit" disabled={!file || busy} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? "Uploading…" : "Upload"}
        </button>
      </form>
      {documents === undefined ? <p className="text-sm text-muted-foreground">Loading documents…</p> : documents.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No documents uploaded for this patient yet.</p> : (
        <ul className="divide-y divide-border">
          {documents.map(document => (
            <li key={document._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="break-all text-sm font-bold">{document.name}</p>
                <p className="text-xs text-muted-foreground">{document.kind === "consent" ? "Consent form" : "Document"} · {new Date(document.uploaded_at).toLocaleDateString()} · {(document.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
              <button type="button" disabled={opening === document._id || deleting === document._id} onClick={() => download(document._id)} aria-label={`Open ${document.name}`} className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold text-primary disabled:opacity-50">
                <FileDown size={16} />Open
              </button>
              <button type="button" onClick={() => deleteDocument(document._id, document.name)} disabled={deleting !== null} aria-label={`Delete ${document.name}`} title="Delete document" className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-50">
                {deleting === document._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
