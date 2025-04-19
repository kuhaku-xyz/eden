"use client";

import { User2Icon, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { db } from "@/lib/db/instant";
import { Account } from "@lens-protocol/client";
import { useChatApp } from "../chat-app-context";

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

  /// deduplicate users
  const users = [
    ...new Set(
      [
        ...Object.values(peers || {}),
      ].filter(Boolean)
    ),
  ];

  return (
    <div
      className={`flex flex-col border-l bg-background h-full transition-all duration-300 ease-in-out ${isUsersCollapsed ? 'w-8 min-w-[2rem] max-w-[2rem]' : 'w-72 min-w-[16rem] max-w-[18rem]'}`}
      style={{ position: 'relative' }}
    >
      <button
        className="absolute -left-4 top-4 z-10 bg-background border rounded-full shadow p-1 hover:bg-muted transition"
        onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
        title={isUsersCollapsed ? 'Expand Users Panel' : 'Collapse Users Panel'}
        type="button"
      >
        <span className="sr-only">{isUsersCollapsed ? 'Expand' : 'Collapse'} Users Panel</span>
        <svg
          className={`w-4 h-4 transition-transform ${isUsersCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {!isUsersCollapsed && (
        <>
          <h2 className="text-lg font-semibold h-14 px-4 py-2 items-center flex border-b truncate">
            Users
          </h2>
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