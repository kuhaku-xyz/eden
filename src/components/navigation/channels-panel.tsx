"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Hash } from "lucide-react";
import type { Channel } from "@/lib/db/instant";

export type ChannelsPanelProps = {
  channels: Channel[];
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string) => void;
  handleCreateChannel: () => void;
  channelsLoading: boolean;
  channelsError: any;
  isCollapsed: boolean;
};

export function ChannelsPanel({
  channels,
  selectedChannelId,
  setSelectedChannelId,
  handleCreateChannel,
  channelsLoading,
  channelsError,
  isCollapsed
}: ChannelsPanelProps) {
  return (
    <div className="flex flex-col flex-1 h-full space-y-2">
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
  );
} 