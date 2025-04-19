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
import { getPublicClient } from "@/lib/lens/client";
import type { Account } from "@lens-protocol/client";

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="py-1.5 px-1 h-12 w-full flex items-center gap-2 border-b rounded-none justify-start">
            <Avatar className="w-6 h-6">
              <AvatarImage src={account?.metadata?.picture} />
              <AvatarFallback>
                {account?.username?.localName?.charAt(0) || account?.address.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{account?.username?.localName || account?.address}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
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
    </>
  );
} 