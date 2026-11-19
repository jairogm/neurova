import type { ReactNode } from "react";

export function NoteToolbar({ children }: { children: ReactNode }) {
  return <div className="nv-note-toolbar rounded-t-[15px]">{children}</div>;
}

export function DraftReview({ tr = text => text, draft, edit, approve, discard }: {
  tr?: (text: string) => string; draft: string; edit?: (text: string) => void; approve?: () => void; discard?: () => void;
}) {
  return <div className="nv-draft-review">
    <label>{tr("Review summary draft")}<textarea aria-label={tr("Review summary draft")} value={draft} onChange={e => edit?.(e.target.value)} /></label>
    <div className="nv-actions">
      <button type="button" data-action="approve" disabled={!draft.trim()} onClick={approve}>{tr("Approve & insert")}</button>
      <button type="button" data-action="discard" onClick={discard}>{tr("Discard")}</button>
    </div>
  </div>;
}

export function PaymentStatus({ tr = text => text, value, change, demo = false }: {
  tr?: (text: string) => string; value: string; change?: (value: string) => void; demo?: boolean;
}) {
  const options = ["Paid", "Unpaid", "Waived"];
  if (value === "overdue") options.push("Overdue");
  return <select aria-label={tr("Payment status")} className="nv-payment-status" data-status={value} value={value} onChange={e => change?.(e.target.value)}>
    {options.map(label => <option key={label} value={demo ? label : label.toLowerCase()}>{tr(label)}</option>)}
  </select>;
}
