"use client";
import { useWorkspaceText } from "@/hooks/useWorkspaceText";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const tr = useWorkspaceText();
  const { signOut } = useClerk();
  const router = useRouter();

  const logout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>{tr("Logout")}</Button>;
}
