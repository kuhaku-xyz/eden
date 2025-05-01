"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { DialogTrigger } from "./ui/dialog";
import { useLogout } from "@lens-protocol/react";
import { useRouter } from "next/navigation";
import type { Account } from "@lens-protocol/client";
import { ThemeToggle } from "./theme-toggle";
import { AccountSelector } from "./account-selector";

interface UserMenuProps {
  account: Account | null;
}

export function UserMenu({ account }: UserMenuProps) {
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const { execute: logout, loading: logoutLoading } = useLogout();
  const router = useRouter();

  if (!account) return null;

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
          <AccountSelector
            open={switchDialogOpen}
            onOpenChange={setSwitchDialogOpen}
            currentAccount={account}
            trigger={
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={e => e.preventDefault()}>
                  Switch Account
                </DropdownMenuItem>
              </DialogTrigger>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} variant="destructive" disabled={logoutLoading}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 