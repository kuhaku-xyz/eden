"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "../ui/avatar";
import { PlusCircle, Home, Check, Plus } from "lucide-react";
import { db, Server, Channel, ServerMember } from "@/lib/db/instant";
import { ChannelsPanel } from "./channels-panel";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ServerPanel({
  servers,
  serversLoading,
  onCreateServerClick,
  isCollapsed,
}: {
  servers: Server[];
  serversLoading: boolean;
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
    account ? { users: { $: { where: { address: account.address } } } } : { users: {} }
  );
  const currentUser = userData?.users?.[0];

  const { data: membershipData, isLoading: membershipLoading } = db.useQuery(
    currentUser ? { serverMembers: { $: { where: { userId: currentUser.id } } } } : { serverMembers: {} }
  );
  const joinedServerIds = new Set((membershipData?.serverMembers || []).map(member => member.serverId));

  const { data: joinedServersData, isLoading: joinedServersLoading } = db.useQuery(
    joinedServerIds.size > 0
      ? { servers: { $: { where: { id: { $in: Array.from(joinedServerIds) } } } } }
      : { servers: { $: { limit: 0 } } } // Empty query when no joined servers
  );
  const joinedServers = joinedServersData?.servers || [];

  const { isLoading, error, data } = db.useQuery(
    selectedServer ? { channels: { $: { where: { serverId: selectedServer.id } } } } : { channels: {} }
  );
  const channels: Channel[] = selectedServer ? (data?.channels ?? []) : [];

  const { data: allServersData } = db.useQuery({ servers: {} });
  const allServers = allServersData?.servers || [];

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

  const handleJoinServer = (server: Server) => {
    if (!currentUser) return;

    db.transact(
      db.tx.serverMembers[id()].update({
        userId: currentUser.id,
        serverId: server.id,
        joinedAt: Date.now(),
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
            channels={channels}
            handleCreateChannel={handleCreateChannel}
            channelsLoading={isLoading}
            channelsError={error}
            isCollapsed={isCollapsed}
          />
        )}
      </div>

      <Dialog open={showServerBrowser} onOpenChange={setShowServerBrowser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Browse Servers</DialogTitle>
            <DialogDescription>
              {joinedServerIds.size === 0
                ? "You haven't joined any servers yet. Select a server below to get started."
                : "Join any server from the list below or create your own."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto mt-4">
            {allServers.length === 0 ? (
              <div className="text-center p-4 border rounded-md">
                <p className="text-sm text-muted-foreground mb-2">No servers available</p>
                <Button variant="outline" size="sm" onClick={onCreateServerClick}>Create Your First Server</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {allServers.map((server) => {
                  const isJoined = joinedServerIds.has(server.id);
                  const isOwner = account && server.owner === account.address;
                  return (
                    <div key={server.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-full">
                          {server.icon ? (
                            <img src={server.icon} alt={server.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span className="text-lg font-bold">{server.name[0]}</span>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{server.name}</p>
                          {isOwner && <p className="text-xs text-muted-foreground">You own this server</p>}
                        </div>
                      </div>

                      {isJoined ? (
                        <Button variant="ghost" size="sm" disabled className="gap-1">
                          <Check className="h-4 w-4" />
                          Joined
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleJoinServer(server)}>
                          <Plus className="h-4 w-4" />
                          Join
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}