"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAuthenticatedUser,
  useAccountsAvailable,
  usePublicClient,
  useLogin,
  Account,
} from "@lens-protocol/react";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignMessage, useWalletClient } from "wagmi";
import { db } from "@/lib/db/instant";
import { id } from "@instantdb/react";
import { lookup } from "@instantdb/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

export function Login() {
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  const { execute: authenticate, loading: authenticateLoading } = useLogin();
  const { data: walletClient } = useWalletClient();
  const { data: availableAccounts, loading: accountsLoading } = useAccountsAvailable({ managedBy: walletClient?.account.address, });
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();

  const handleLogin = async (accountAddress: string) => {
    if (!walletClient) return;
    try {
      await authenticate({
        accountOwner: {
          account: accountAddress,
          app: process.env.NEXT_PUBLIC_APP_ADDRESS,
          owner: walletClient.account.address
        },
        signMessage: async (message: string) => {
          return await signMessageAsync({ message });
        },
      });
      // Upsert user identity in DB
      try {
        const username = availableAccounts?.items.find(acc => acc.account.address === accountAddress)?.account.username?.localName || "";
        try {
          await db.transact(
            db.tx.users[lookup('address', accountAddress)].update({
              address: accountAddress,
              owner: walletClient.account.address,
              username,
            })
          );
        } catch (err) {
          // If lookup upsert fails (e.g. first login), fallback to insert with new id
          try {
            await db.transact(
              db.tx.users[id()].update({
                address: accountAddress,
                owner: walletClient.account.address,
                username,
              })
            );
          } catch (err2) {
            console.error("Failed to insert user in DB:", err2);
          }
        }
      } catch (err) {
        console.error("Failed to upsert user in DB:", err);
      } finally {
        router.refresh();
      }
    } catch (error) {
      console.error("Lens authentication failed:", error);
    }
  };

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
                <p className="text-xs text-muted-foreground">
                  Connect your wallet to get started.
                </p>
              </>
            );
          }

          if (isWalletConnected && !authenticatedUser) {
            return (
              <Dialog
                open={showAccountSelector}
                onOpenChange={setShowAccountSelector}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={authenticateLoading || accountsLoading}
                    className="w-full"
                  >
                    {authenticateLoading
                      ? "Authenticating..."
                      : accountsLoading
                        ? "Loading Accounts..."
                        : "Sign in with Lens"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[200px]">
                  <DialogHeader>
                    <DialogTitle>Select Lens Account</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex flex-col gap-2 py-4 max-h-[400px] pr-4">
                    <div className="flex flex-col gap-2">
                      {accountsLoading && <p>Loading accounts...</p>}
                      {!accountsLoading && availableAccounts?.items.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No Lens profiles found for this wallet address (
                          {connectKitDisplayName}). You might need to create one
                          or ensure it's managed by this wallet.
                        </p>
                      )}
                      {!accountsLoading &&
                        availableAccounts &&
                        availableAccounts.items.map((acc) => (
                          <Button
                            key={acc.account.address}
                            variant="outline"
                            onClick={() => handleLogin(acc.account.address)}
                            disabled={authenticateLoading}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={acc.account.metadata?.picture} />
                              <AvatarFallback>
                                {acc.account.username?.localName?.charAt(0) || acc.account.address.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {acc.account.username?.localName}
                          </Button>
                        ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
                {(authenticateLoading || accountsLoading) && (
                  <p className="text-xs text-muted-foreground">
                    Checking authentication...
                  </p>
                )}
              </Dialog>
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