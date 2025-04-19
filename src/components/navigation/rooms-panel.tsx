import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Hash } from "lucide-react";
import { Avatar } from "../ui/avatar";
import type { Server, Channel } from "@/lib/db/instant";
import type { Account } from "@lens-protocol/client";
import React from "react";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  servers: Server[];
  selectedServerId: string | null;
  setSelectedServerId: (id: string) => void;
  channels: Channel[];
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string) => void;
  onCreateServerClick: () => void;
  handleCreateChannel: () => void;
  account: Account | null;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  serversLoading: boolean;
  serversError: any;
  channelsLoading: boolean;
  channelsError: any;
}

export function Sidebar({
  servers,
  selectedServerId,
  setSelectedServerId,
  channels,
  selectedChannelId,
  setSelectedChannelId,
  onCreateServerClick,
  handleCreateChannel,
  account,
  isCollapsed,
  setIsCollapsed,
  serversLoading,
  serversError,
  channelsLoading,
  channelsError,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-row">
      {/* Server icons column */}
      <div className="flex flex-col items-center py-2 px-1 bg-muted/40 border-r space-y-2 min-w-[60px]">
        {serversLoading && <div className="text-xs text-muted-foreground">...</div>}
        {servers.map((server) => (
          <Button
            key={server.id}
            variant={selectedServerId === server.id ? "secondary" : "ghost"}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center overflow-hidden border"
            onClick={() => setSelectedServerId(server.id)}
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
      {/* Channels panel */}
      <div className="flex flex-col flex-1 h-full space-y-2">
        {!isCollapsed && <UserMenu account={account} />}
        {!isCollapsed && (
          <div className="flex-grow p-2 rounded">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold truncate">Channels</h2>
              <Button variant="ghost" size="icon" title="Create Channel" onClick={handleCreateChannel}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-40px)]">
              <div className="space-y-1">
                {channelsLoading && <div className="text-xs text-muted-foreground">Loading channels...</div>}
                {channelsError && <div className="text-xs text-red-500">Error loading channels</div>}
                {channels.length === 0 && !channelsLoading && (
                  <div className="text-xs text-muted-foreground italic">No channels yet.</div>
                )}
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start truncate"
                    onClick={() => setSelectedChannelId(channel.id)}
                  >
                    <Hash className="h-4 w-4 mr-2 text-muted-foreground" /> {channel.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        {/* Collapsed Sidebar */}
        {isCollapsed && (
          <div className="flex flex-col items-center space-y-4 mt-4">
            <Button variant="ghost" size="icon" title="Create Channel" onClick={handleCreateChannel}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 