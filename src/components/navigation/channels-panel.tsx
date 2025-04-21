"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Hash } from "lucide-react";
import type { Channel } from "@/lib/db/instant";
import { useChatApp } from "../chat-app-context";

export type ChannelsPanelProps = {
  channels: Channel[];
  handleCreateChannel: () => void;
  channelsLoading: boolean;
  channelsError: any;
  isCollapsed: boolean;
};

export function ChannelsPanel({
  channels,
  handleCreateChannel,
  channelsLoading,
  channelsError,
  isCollapsed
}: ChannelsPanelProps) {
  const { selectedChannel, setSelectedChannel, selectedServer } = useChatApp();
  return (
    <div className="flex flex-col flex-1 h-full space-y-2">
      {!isCollapsed && (
        <div className="flex-grow rounded">
          <div className="flex items-center h-14 px-4 py-2 justify-between border-b">
            <h2 className="text-base font-semibold truncate">{selectedServer?.name}</h2>
            <Button variant="ghost" size="sm" title="Create Channel" onClick={handleCreateChannel}>
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-40px)]">
            <div className="flex flex-col gap-1 p-2">
              {channelsLoading && <div className="text-xs text-muted-foreground">Loading channels...</div>}
              {channelsError && <div className="text-xs text-red-500">Error loading channels</div>}
              {channels.length === 0 && !channelsLoading && (
                <div className="text-xs text-muted-foreground italic">No channels yet.</div>
              )}
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start truncate"
                  onClick={() => setSelectedChannel(channel)}
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
  );
} 