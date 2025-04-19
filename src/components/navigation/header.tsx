"use client";
import { MessageSquare } from "lucide-react";
import type { Channel } from "@/lib/db/instant";
import React from "react";

interface ChatHeaderProps {
  selectedChannelId: string | null;
  channels: Channel[];
}

export function ChatHeader({ selectedChannelId, channels }: ChatHeaderProps) {
  return (
    <div className="border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5" />
          <span className="hidden sm:inline truncate">
            {selectedChannelId
              ? `#${channels.find((c) => c.id === selectedChannelId)?.name || "channel"}`
              : "Select a channel"}
          </span>
        </span>
      </div>
    </div>
  );
} 