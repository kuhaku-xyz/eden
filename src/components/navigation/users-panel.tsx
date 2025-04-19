import { User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Account } from "@lens-protocol/client";
import React from "react";

interface UsersPanelProps {
  account: Account | null;
  isUsersCollapsed: boolean;
  setIsUsersCollapsed: (v: boolean) => void;
}

export function UsersPanel({ account, isUsersCollapsed, setIsUsersCollapsed }: UsersPanelProps) {
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
          <h2 className="text-lg font-semibold p-4 py-2 border-b truncate">
            Users
          </h2>
          <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
              <div className="flex items-center gap-2 p-1.5 rounded text-sm hover:bg-muted">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="truncate" title={account?.username?.localName || account?.address}>
                  {account?.username?.localName || account?.address}
                </span>
                <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0.5">You</Badge>
              </div>
              {/* Add more users here if you implement user presence */}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
} 