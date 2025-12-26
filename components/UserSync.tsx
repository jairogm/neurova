"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 UserSync: Triggering syncUser mutation");
      syncUser()
        .then((result) => console.log("✅ UserSync: Success", result))
        .catch((error) => console.error("❌ UserSync: Error", error));
    }
  }, [isAuthenticated, syncUser]);

  return null;
}
