"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DebugPage() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const therapistCheck = useQuery(api.users.checkTherapistByEmail,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );
  const syncUser = useMutation(api.users.syncUser);
  const seedDemoData = useMutation(api.seed.seedDemoData);
  const [syncResult, setSyncResult] = useState<unknown>(null);
  const [syncError, setSyncError] = useState<unknown>(null);
  const [seedResult, setSeedResult] = useState<unknown>(null);

  const handleManualSync = async () => {
    try {
      setSyncError(null);
      const result = await syncUser();
      setSyncResult(result);
      console.log("✅ Manual sync successful:", result);
    } catch (error) {
      setSyncError(error);
      console.error("❌ Manual sync failed:", error);
    }
  };

  const handleSeed = async (force: boolean) => {
    try {
      const result = await seedDemoData({ force });
      setSeedResult(result);
    } catch (error) {
      setSeedResult({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={handleManualSync}>
          Manually Trigger Sync
        </Button>
        <Button variant="outline" onClick={() => handleSeed(false)}>
          Seed NEUROVA demo data
        </Button>
        <Button variant="outline" onClick={() => handleSeed(true)}>
          Seed (force)
        </Button>
      </div>

      {Boolean(seedResult) && (
        <div className="border border-primary p-4 rounded mb-4">
          <h2 className="font-bold text-primary">Seed Result:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(seedResult as Record<string, unknown>, null, 2)}
          </pre>
        </div>
      )}

      {Boolean(syncResult) && (
        <div className="border border-green-500 p-4 rounded mb-4">
          <h2 className="font-bold text-green-600">Sync Result:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(syncResult as Record<string, unknown>, null, 2)}
          </pre>
        </div>
      )}

      {Boolean(syncError) && (
        <div className="border border-red-500 p-4 rounded mb-4">
          <h2 className="font-bold text-red-600">Sync Error:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(syncError as Record<string, unknown>, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold">Clerk User:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              id: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              fullName: user?.fullName,
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold">Current Therapist (from Convex):</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold">Therapist Check by Email:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(therapistCheck, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
