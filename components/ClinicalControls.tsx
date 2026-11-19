import type { ReactNode } from "react";

export function NoteToolbar({ children }: { children: ReactNode }) {
  return <div className="nv-note-toolbar rounded-t-[15px]">{children}</div>;
}

export function DraftReview({ draft, edit, approve, discard }: {
  draft: string; edit?: (text: string) => void; approve?: () => void; discard?: () => void;
}) {
  return <div className="nv-draft-review">
    <label>Review summary draft<textarea aria-label="Review summary draft" value={draft} onChange={e => edit?.(e.target.value)} /></label>
    <div className="nv-actions">
      <button type="button" data-action="approve" disabled={!draft.trim()} onClick={approve}>Approve &amp; insert</button>
      <button type="button" data-action="discard" onClick={discard}>Discard</button>
    </div>
  </div>;
}

export function PaymentStatus({ value, change, demo = false }: {
  value: string; change?: (value: string) => void; demo?: boolean;
}) {
  const options = ["Paid", "Unpaid", "Waived"];
  if (value === "overdue") options.push("Overdue");
  return <select aria-label="Payment status" className="nv-payment-status" data-status={value} value={value} onChange={e => change?.(e.target.value)}>
    {options.map(label => <option key={label} value={demo ? label : label.toLowerCase()}>{label}</option>)}
  </select>;
}
