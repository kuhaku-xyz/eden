"use client";

import React, { useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, User2Icon, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/db/instant";
import { Account } from "@lens-protocol/client";
import { useChatApp } from "../chat-app-context";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { useAccountsBulk, evmAddress } from "@lens-protocol/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UsersPanelProps {
  isUsersCollapsed: boolean;
  setIsUsersCollapsed: (v: boolean) => void;
  account: Account | null;
}

export function UsersPanel({ isUsersCollapsed, setIsUsersCollapsed }: UsersPanelProps) {
  const { selectedServer, account } = useChatApp();
  const server = db.room('server', selectedServer?.address);
  const { user: myPresence, peers, publishPresence } = db.rooms.usePresence(server);

  // Query all members of the current server
  const { data: serverMembersData } = db.useQuery(
    selectedServer
      ? { serverMembers: { $: { where: { serverId: selectedServer.id } } } }
      : {}
  );

  // Query user details for all members
  const memberUserIds = useMemo(() => {
    return (serverMembersData?.serverMembers || []).map(member => member.userId);
  }, [serverMembersData]);

  const { data: usersData } = db.useQuery(
    memberUserIds.length > 0
      ? { users: { $: { where: { id: { $in: memberUserIds } } } } }
      : {}
  );

  useEffect(() => {
    if (account) {
      publishPresence({
        name: account.username?.localName,
        address: account.address,
        avatar: account.metadata?.picture,
      });
    }
  }, [account, publishPresence]);

  const combinedUsers = useMemo(() => {
    const onlineUsers = new Map();

    Object.values(peers || {}).forEach((peer: any) => {
      if (peer && peer.address) {
        onlineUsers.set(peer.address, {
          ...peer,
          isOnline: true
        });
      }
    });

    if (myPresence?.address) {
      onlineUsers.set(myPresence.address, {
        ...myPresence,
        isOnline: true,
        isSelf: true
      });
    }

    const allUsers = new Map();

    (usersData?.users || []).forEach(user => {
      const onlineUser = onlineUsers.get(user.address);

      allUsers.set(user.address, {
        address: user.address,
        name: user.username,
        avatar: null,
        isOnline: !!onlineUser,
        isSelf: user.address === account?.address,
        ...(onlineUser || {})
      });
    });

    return Array.from(allUsers.values()).sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      if (a.isSelf !== b.isSelf) {
        return a.isSelf ? -1 : 1;
      }
      return (a.name || a.address).localeCompare(b.name || b.address);
    });
  }, [peers, myPresence, usersData, account, selectedServer]);

  // Get all unique addresses for Lens Protocol lookup
  const userAddresses = useMemo(() => {
    return combinedUsers
      .map(user => user.address)
      .filter(Boolean) as string[];
  }, [combinedUsers]);

  // Fetch account details from Lens Protocol
  const { data: lensAccounts } = useAccountsBulk({
    addresses: userAddresses.map(address => evmAddress(address)),
  });

  // Create a map of address to lens account for easy lookup
  const accountsByAddress = useMemo(() => {
    return (lensAccounts || []).reduce((acc: Record<string, Account>, user: Account) => {
      acc[user.address] = user;
      return acc;
    }, {});
  }, [lensAccounts]);

  // Split users into online and offline groups
  const { onlineUsers, offlineUsers } = useMemo(() => {
    return {
      onlineUsers: combinedUsers.filter(user => user.isOnline),
      offlineUsers: combinedUsers.filter(user => !user.isOnline)
    };
  }, [combinedUsers]);

  return (
    <div
      className={`flex flex-col border-l bg-primary/5 h-full transition-all duration-300 ease-in-out ${isUsersCollapsed ? 'min-w-0 max-w-[2rem]' : 'w-72 min-w-[16rem] max-w-[18rem]'}`}
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
              {combinedUsers.length === 0 && (
                <div className="text-muted-foreground text-sm text-center p-2">No users in this server</div>
              )}

              {/* Online users */}
              {onlineUsers.length > 0 && (
                <div className="space-y-1">
                  {onlineUsers.map((user: any, idx: number) => {
                    // Get the Lens account for this user if available
                    const lensAccount = accountsByAddress[user.address];
                    const avatarSrc = lensAccount?.metadata?.picture || user.avatar;
                    const displayName = user.name || lensAccount?.username?.localName || user.address;

                    return (
                      <div
                        key={user.address || idx}
                        className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-muted bg-primary/5"
                      >
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={avatarSrc} alt={displayName} />
                            <AvatarFallback>
                              {displayName?.charAt(0)?.toUpperCase() || user.address?.slice(2, 3)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" title="Online"></div>
                        </div>
                        <span className="truncate" title={displayName}>
                          {displayName}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          {user.isSelf && <Badge variant="outline" className="text-xs px-1.5 py-0.5">You</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {offlineUsers.length > 0 && (
                <div className="space-y-1">
                  {offlineUsers.map((user: any, idx: number) => {
                    // Get the Lens account for this user if available
                    const lensAccount = accountsByAddress[user.address];
                    const avatarSrc = lensAccount?.metadata?.picture || user.avatar;
                    const displayName = user.name || lensAccount?.username?.localName || user.address;

                    return (
                      <div
                        key={user.address || idx}
                        className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-muted text-muted-foreground"
                      >
                        <Avatar className="h-6 w-6 opacity-70">
                          <AvatarImage src={avatarSrc} alt={displayName} />
                          <AvatarFallback>
                            {displayName?.charAt(0)?.toUpperCase() || user.address?.slice(2, 3)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate" title={displayName}>
                          {displayName}
                        </span>
                        <div className="ml-auto flex items-center gap-1">
                          {user.isSelf && <Badge variant="outline" className="text-xs px-1.5 py-0.5">You</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
} 