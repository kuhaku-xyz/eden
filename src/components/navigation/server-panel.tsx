"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "../ui/avatar";
import { PlusCircle, Home } from "lucide-react";
import { db, Channel } from "@/lib/db/instant";
import { ChannelsPanel } from "./channels-panel";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ServerBrowserDialog } from "./server-browser-dialog";

export function ServerPanel({
  onCreateServerClick,
  isCollapsed,
}: {
  onCreateServerClick: () => void;
  isCollapsed: boolean;
}) {
  const {
    selectedServer,
    setSelectedServer,
    selectedChannel,
    setSelectedChannel,
    account,
  } = useChatApp();

  const [showServerBrowser, setShowServerBrowser] = useState(false);
  const { data: userData } = db.useQuery(
    account ? { users: { $: { where: { address: account.address } } } } : {}
  );
  const currentUser = userData?.users?.[0];

  const { data: membershipData, isLoading: membershipLoading } = db.useQuery(
    currentUser ? { serverMembers: { $: { where: { userId: currentUser.id } } } } : {}
  );
  const joinedServerIds = new Set((membershipData?.serverMembers || []).map(member => member.serverId));

  const { data: joinedServersData, isLoading: joinedServersLoading } = db.useQuery(
    joinedServerIds.size > 0
      ? { servers: { $: { where: { id: { $in: Array.from(joinedServerIds) } } } } }
      : {}
  );
  const joinedServers = joinedServersData?.servers || [];

  // Auto-show server browser when user has no servers joined
  useEffect(() => {
    const hasCheckedForServers = joinedServerIds.size > 0 || joinedServers.length > 0;

    if (currentUser &&
      !membershipLoading &&
      !joinedServersLoading &&
      joinedServerIds.size === 0 &&
      joinedServers.length === 0 &&
      !hasCheckedForServers) {

      const timer = setTimeout(() => {
        setShowServerBrowser(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [membershipLoading, joinedServersLoading, currentUser, joinedServers.length, joinedServerIds]);

  const handleCreateChannel = () => {
    if (!selectedServer) return;
    const name = prompt("Enter channel name:");
    if (!name) return;
    db.transact(
      db.tx.channels[id()].update({
        name: name.trim(),
        serverId: selectedServer.id,
        createdAt: Date.now(),
      })
    );
  };

  return (
    <>
      <div className="flex flex-row h-full">
        <div className="flex flex-col items-center py-2 px-1 bg-primary/15 border-r gap-3 min-w-[60px] h-full">
          <Button
            variant="ghost"
            size="icon"
            title="Browse Servers"
            className="rounded-full w-10 h-10"
            onClick={() => setShowServerBrowser(true)}
          >
            <Home className="h-5 w-5" />
          </Button>

          {(membershipLoading || joinedServersLoading) && <div className="text-xs text-muted-foreground">...</div>}
          {joinedServers.length > 0 && (
            joinedServers.map((server) => (
              <Button
                key={server.id}
                variant={selectedServer?.id === server.id ? "secondary" : "ghost"}
                className={cn("rounded-xl w-10 h-10 p-0 flex items-center justify-center overflow-hidden border", selectedServer?.id === server.id && "ring-2 ring-primary")}
                onClick={() => {
                  setSelectedServer(server);
                  setSelectedChannel(null);
                }}
                title={server.name}
              >
                <Avatar className="w-10 h-10 items-center justify-center flex">
                  {server.icon ? (
                    <img src={server.icon} alt={server.name} className="w-8 h-8 rounded-xl" />
                  ) : (
                    <span className="text-lg font-bold">{server.name[0]}</span>
                  )}
                </Avatar>
              </Button>
            ))
          )}

          <Button variant="ghost" size="icon" title="Create Server" className="rounded-full w-10 h-10" onClick={onCreateServerClick}>
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {selectedServer && (
          <ChannelsPanel
            handleCreateChannel={handleCreateChannel}
            isCollapsed={isCollapsed}
          />
        )}
        {!selectedServer && (
          <div className="flex flex-col flex-1 h-full bg-primary/5 space-y-2">
            <div className="flex items-center h-14 px-4 py-2 justify-between border-b">
              <h2 className="text-base font-semibold truncate">Select a server</h2>
            </div>
          </div>
        )}
      </div>

      <ServerBrowserDialog
        open={showServerBrowser}
        onOpenChange={setShowServerBrowser}
        onCreateServerClick={onCreateServerClick}
        currentUser={currentUser}
        joinedServerIds={joinedServerIds}
        account={account}
      />
    </>
  );
}