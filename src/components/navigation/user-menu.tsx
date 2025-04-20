"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { useAccountsAvailable, useLogin, useLogout } from "@lens-protocol/react";
import { useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";
import type { Account } from "@lens-protocol/client";
import { ThemeToggle } from "../theme-toggle";

interface UserMenuProps {
  account: Account | null;
}

export function UserMenu({ account }: UserMenuProps) {
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { data: availableAccounts, loading: accountsLoading } = useAccountsAvailable({ managedBy: walletClient?.account.address });
  const { execute: authenticate, loading: authenticateLoading } = useLogin();
  const { execute: logout, loading: logoutLoading } = useLogout();
  const router = useRouter();

  if (!account) return null;

  const handleSwitchAccount = async (accountAddress: string) => {
    if (!walletClient) return;
    try {
      await authenticate({
        accountOwner: {
          account: accountAddress,
          app: process.env.NEXT_PUBLIC_APP_ADDRESS,
          owner: walletClient.account.address,
        },
        signMessage: async (message: string) => {
          // @ts-ignore
          return await walletClient.signMessage({ message });
        },
      });
      setSwitchDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Lens authentication failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-2 h-14 w-full items-center justify-between border-b">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-1 hover:bg-transparent dark:hover:bg-transparent hover:text-foreground justify-end">
            <span className="truncate">{account?.username?.localName || account?.address}</span>
            <Avatar className="w-8 h-8">
              <AvatarImage src={account?.metadata?.picture} />
              <AvatarFallback>
                {account?.username?.localName?.charAt(0) || account?.address.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                Switch Account
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Switch Account</DialogTitle>
              </DialogHeader>
              {accountsLoading && <div className="text-sm text-muted-foreground">Loading accounts...</div>}
              {availableAccounts && (
                <div className="flex flex-col gap-2 py-2">
                  {availableAccounts.items.map((acc) => (
                    <Button
                      key={acc.account.address}
                      variant={acc.account.address === account.address ? "secondary" : "outline"}
                      disabled={authenticateLoading || acc.account.address === account.address}
                      onClick={() => handleSwitchAccount(acc.account.address)}
                      className="justify-start"
                    >
                      {acc.account.username?.localName || acc.account.address}
                      {acc.account.address === account.address && <span className="ml-2 text-xs text-muted-foreground">(current)</span>}
                    </Button>
                  ))}
                </div>
              )}
              <DialogClose asChild>
                <Button variant="ghost" className="mt-2 w-full">Cancel</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive" disabled={logoutLoading}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 