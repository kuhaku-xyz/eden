"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "../ui/avatar";
import { PlusCircle } from "lucide-react";
import { db, Server, Channel } from "@/lib/db/instant";
import { ChannelsPanel } from "./channels-panel";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";
import { cn } from "@/lib/utils";

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
  } = useChatApp();

  const { isLoading, error, data } = db.useQuery(
    selectedServer ? { channels: { $: { where: { serverId: selectedServer.id } } } } : { channels: {} }
  );
  const channels: Channel[] = selectedServer ? (data?.channels ?? []) : [];

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
    <div className="flex flex-row h-full">
      <div className="flex flex-col items-center py-2 px-1 bg-primary/10 border-r gap-3 min-w-[60px] h-full">
        {serversLoading && <div className="text-xs text-muted-foreground">...</div>}
        {servers.map((server) => (
          <Button
            key={server.id}
            variant={selectedServer?.id === server.id ? "secondary" : "ghost"}
            className={cn("rounded-full w-10 h-10 p-0 flex items-center justify-center overflow-hidden border", selectedServer?.id === server.id && "ring-2 ring-primary")}
            onClick={() => {
              setSelectedServer(server);
              setSelectedChannel(null);
            }}
            title={server.name}
          >
            <Avatar className="w-10 h-10 rounded-full">
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-lg font-bold">{server.name[0]}</span>
              )}
            </Avatar>
          </Button>
        ))}
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
  );
}