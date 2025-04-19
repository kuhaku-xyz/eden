"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "../ui/avatar";
import { PlusCircle } from "lucide-react";
import { db, Server, Channel } from "@/lib/db/instant";
import { ChannelsPanel } from "./channels-panel";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";

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
    selectedServerId,
    setSelectedServerId,
    selectedChannelId,
    setSelectedChannelId,
  } = useChatApp();

  // Fetch channels only when a server is selected
  const { isLoading, error, data } = db.useQuery(
    selectedServerId ? { channels: { $: { where: { serverId: selectedServerId } } } } : { channels: {} }
  );
  const channels: Channel[] = selectedServerId ? (data?.channels ?? []) : [];

  // Channel creation handler
  const handleCreateChannel = () => {
    if (!selectedServerId) return;
    const name = prompt("Enter channel name:");
    if (!name) return;
    db.transact(
      db.tx.channels[id()].update({
        name: name.trim(),
        serverId: selectedServerId,
        createdAt: Date.now(),
      })
    );
  };

  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-col items-center py-2 px-1 bg-muted/40 border-r space-y-2 min-w-[60px] h-full">
        {serversLoading && <div className="text-xs text-muted-foreground">...</div>}
        {servers.map((server) => (
          <Button
            key={server.id}
            variant={selectedServerId === server.id ? "secondary" : "ghost"}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center overflow-hidden border"
            onClick={() => {
              setSelectedServerId(server.id);
              setSelectedChannelId(null);
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
        <Button variant="ghost" size="icon" title="Create Server" className="rounded-full w-10 h-10 mt-2" onClick={onCreateServerClick}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      {selectedServerId && (
        <ChannelsPanel
          channels={channels}
          selectedChannelId={selectedChannelId}
          setSelectedChannelId={setSelectedChannelId}
          handleCreateChannel={handleCreateChannel}
          channelsLoading={isLoading}
          channelsError={error}
          isCollapsed={isCollapsed}
        />
      )}
    </div>
  );
}