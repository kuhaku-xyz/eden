"use client";

import { ChevronLeft, ChevronRight, User2Icon, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { db } from "@/lib/db/instant";
import { Account } from "@lens-protocol/client";
import { useChatApp } from "../chat-app-context";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

interface UsersPanelProps {
  isUsersCollapsed: boolean;
  setIsUsersCollapsed: (v: boolean) => void;
  account: Account | null;
}

export function UsersPanel({ isUsersCollapsed, setIsUsersCollapsed }: UsersPanelProps) {
  const { selectedServer, account } = useChatApp();
  const server = db.room();
  const { user: myPresence, peers, publishPresence } = db.rooms.usePresence(server);

  useEffect(() => {
    if (account) {
      publishPresence({
        name: account.username?.localName,
        address: account.address,
        avatar: account.metadata?.picture,
      });
    }
  }, [account]);

  useEffect(() => {
    console.log('selectedServer', selectedServer);
  }, [selectedServer]);

  const users = [
    ...Object.values(peers || {})
      .filter((peer: any) =>
        peer && peer.address !== myPresence?.address
      )
  ].filter(Boolean);

  return (
    <div
      className={`flex flex-col border-l bg-background h-full transition-all duration-300 ease-in-out ${isUsersCollapsed ? 'min-w-0 max-w-[2rem]' : 'w-72 min-w-[16rem] max-w-[18rem]'}`}
      style={{ position: 'relative' }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={`absolute -left-12 top-2 z-10 bg-background border rounded-full shadow hover:bg-muted transition`}
        onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
        title={isUsersCollapsed ? 'Expand Users Panel' : 'Collapse Users Panel'}
        type="button"
      >
        <span className="sr-only">{isUsersCollapsed ? 'Expand' : 'Collapse'} Users Panel</span>
        {isUsersCollapsed ? (
          <>
            {account?.metadata?.picture ? (
              <img src={account?.metadata?.picture} alt={account?.username?.localName} className="w-full h-full rounded-full" />
            ) : (
              <User2Icon className="w-4 h-4" />
            )}
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
      {!isUsersCollapsed && (
        <>
          <UserMenu account={account} />
          <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
              {users.length === 0 && (
                <div className="text-muted-foreground text-sm p-2">No users online</div>
              )}
              {users.map((user: any, idx: number) => (
                <div key={user.address || idx} className="flex items-center gap-2 p-1.5 rounded text-sm hover:bg-muted">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <User2Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate" title={user.name || user.address}>
                    {user.name || user.address}
                  </span>
                  {user.isSelf && <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0.5">You</Badge>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
} 