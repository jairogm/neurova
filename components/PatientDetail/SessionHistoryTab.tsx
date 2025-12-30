"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { sessionColumns } from "@/lib/sessionColumns";
import { DataTable } from "../data-table";

interface SessionHistoryTabProps {
  patientId: string;
}

export function SessionHistoryTab({ patientId }: SessionHistoryTabProps) {
  const sessions = useQuery(api.sessions.listByPatient, { patientId });
  const isLoading = sessions === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Session History</h3>
        <p className="text-sm text-muted-foreground">
          View and manage therapy sessions from scheduled appointments
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
          <p className="text-muted-foreground">No sessions recorded yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Sessions will appear here when you schedule appointments
          </p>
        </div>
      ) : (
        <DataTable columns={sessionColumns} data={sessions as any} />
      )}
    </div>
  );
}
