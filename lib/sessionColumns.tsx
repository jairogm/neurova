"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session, PaymentStatus } from "./types";
import { updatePaymentStatus } from "@/lib/supabase/sessions";

// Payment status cell component
function PaymentStatusCell({ session }: { session: Session }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (status: PaymentStatus) => updatePaymentStatus(session.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions", session.patient_id] });
      toast.success("Payment status updated");
    },
    onError: (error) => {
      toast.error("Failed to update payment: " + error.message);
    },
  });

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "partially_paid":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "refunded":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Select
      value={session.payment_status}
      onValueChange={(value) => updateMutation.mutate(value as PaymentStatus)}
      disabled={updateMutation.isPending}
    >
      <SelectTrigger className={`w-[140px] h-8 ${getPaymentColor(session.payment_status)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending
          </span>
        </SelectItem>
        <SelectItem value="paid">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Paid
          </span>
        </SelectItem>
        <SelectItem value="partially_paid">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Partially Paid
          </span>
        </SelectItem>
        <SelectItem value="refunded">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Refunded
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export const sessionColumns: ColumnDef<Session>[] = [
  {
    accessorKey: "scheduled_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("scheduled_date");
      const date = new Date(dateValue as string);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return <span className="text-muted-foreground">Invalid date</span>;
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "MMM dd, yyyy")}</span>
          <span className="text-sm text-muted-foreground">{format(date, "hh:mm a")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return <span>{duration} min</span>;
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ row }) => <PaymentStatusCell session={row.original} />,
  },
];
