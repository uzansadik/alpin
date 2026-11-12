"use client";

import { authClient } from "@alpin/auth/client";
import { Button } from "@alpin/ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SignOutButtonProps = {
  label: string;
  pendingLabel?: string;
};

export function SignOutButton({ label, pendingLabel }: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    await authClient.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <Button disabled={isSigningOut} onClick={handleSignOut} type="button" variant="outline">
      {isSigningOut ? (pendingLabel ?? label) : label}
    </Button>
  );
}
