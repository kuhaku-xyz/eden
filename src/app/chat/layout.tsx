"use client"

import { useAccount } from "@lens-protocol/react";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useEffect } from "react";
import { useAccount as useJazzAccount } from "jazz-react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: authenticatedUser } = useAuthenticatedUser()
  const { data: account } = useAccount({ address: authenticatedUser?.address })
  const { me, logOut } = useJazzAccount();

  useEffect(() => {
    if (!me?.profile || !account?.username?.localName) return;

    me.profile.name = account?.username?.localName
  }, [account])

  return (
    <div className="flex flex-col h-screen">
      {children}
    </div>
  )
} 