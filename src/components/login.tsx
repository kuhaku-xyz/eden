"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  useAuthenticatedUser,
  usePublicClient,
} from "@lens-protocol/react";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AccountSelector } from "./account-selector";
import { type Account } from "@lens-protocol/client";

export function Login() {
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  return (
    <div className="p-2 space-y-2 mb-2">
      <ConnectKitButton.Custom>
        {({
          isConnected: isWalletConnected,
          show,
          truncatedAddress,
          ensName,
          chain,
        }) => {
          const connectKitDisplayName = ensName ?? truncatedAddress;

          if (!isWalletConnected) {
            return (
              <>
                <Button onClick={show} className="w-full">
                  Connect Wallet
                </Button>
              </>
            );
          }

          if (isWalletConnected && !authenticatedUser) {
            return (
              <AccountSelector
                open={showAccountSelector}
                onOpenChange={setShowAccountSelector}
                updateDatabase={true}
                trigger={
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Sign in with Lens
                    </Button>
                  </DialogTrigger>
                }
              />
            );
          }

          if (isWalletConnected && authenticatedUser) {
            const displayIdentity = connectKitDisplayName ?? "...";
            return (
              <div className="flex items-center gap-2 text-sm w-full justify-between">
                <span
                  className="text-muted-foreground truncate"
                  title={authenticatedUser.address}
                >
                  Signed in as:{" "}
                  <span className="text-primary font-semibold">
                    {displayIdentity}
                  </span>
                </span>
              </div>
            );
          }

          return (
            <p className="text-xs text-muted-foreground">
              Checking status...
            </p>
          );
        }}
      </ConnectKitButton.Custom>
    </div>
  );
} 