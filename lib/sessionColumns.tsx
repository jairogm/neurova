"use client";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session, PaymentStatus } from "./types";

// Payment status cell component
function PaymentStatusCell({ session }: { session: Session }) {
  const tr = useWorkspaceText();
  const [isUpdating, setIsUpdating] = useState(false);
  const updatePayment = useMutation(api.sessions.updatePayment);

  const handleStatusChange = async (status: PaymentStatus) => {
    if (!session.id) {
      toast.error(tr("Session ID is missing"));
      return;
    }

    try {
      setIsUpdating(true);
      await updatePayment({
        id: session.id,
        payment_status: status,
      });
      toast.success(tr("Payment status updated"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : tr("Unknown error");
      toast.error(tr("Failed to update payment: ") + message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "text-[#15986a] bg-[#e2f1ea] border-[#b9ddcc] dark:bg-[#11302a] dark:border-[#215344]";
      case "pending":
        return "text-[#be7c16] bg-[#f6ecd8] border-[#e7cca0] dark:bg-[#33280f] dark:border-[#604d23]";
      case "partially_paid":
        return "text-primary bg-primary/10 border-primary/30";
      case "refunded":
        return "text-[#d2574f] bg-[#f8e5e3] border-[#edc1bd] dark:bg-[#3a1f1d] dark:border-[#67312d]";
      default:
        return "text-muted-foreground bg-secondary border-border";
    }
  };

  return (
    <Select
      value={session.payment_status || "pending"}
      onValueChange={(value) => handleStatusChange(value as PaymentStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger className={`h-8 w-[140px] rounded-full text-[11px] font-bold ${getPaymentColor(session.payment_status || "pending")}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>{tr("Pending")}</span>
        </SelectItem>
        <SelectItem value="paid">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>{tr("Paid")}</span>
        </SelectItem>
        <SelectItem value="partially_paid">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>{tr("Partially Paid")}</span>
        </SelectItem>
        <SelectItem value="refunded">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>{tr("Refunded")}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export function getSessionColumns(tr: (s: string) => string, locale: string): ColumnDef<Session>[] {
  return [
  {
    accessorKey: "scheduled_date",
    header: ({ column }) => {
      return (
        <button
          type="button"
          className="flex items-center gap-1.5 uppercase"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {tr("Date & Time")}
          <ArrowUpDown size={12} />
        </button>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("scheduled_date");
      const date = new Date(dateValue as string);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <span className="text-muted-foreground">{tr("Invalid date")}</span>;
      }

      return (
        <div className="flex flex-col font-mono">
          <span className="font-semibold text-foreground">{date.toLocaleDateString(locale, {month:"short", day:"numeric", year:"numeric"})}</span>
          <span className="text-[11px] text-muted-foreground">{date.toLocaleTimeString(locale, {hour:"numeric", minute:"2-digit"})}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: tr("Duration"),
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return <span className="font-mono text-foreground/80">{duration} min</span>;
    },
  },
  {
    accessorKey: "payment_status",
    header: tr("Payment"),
    cell: ({ row }) => <PaymentStatusCell session={row.original} />,
  },
];
}
