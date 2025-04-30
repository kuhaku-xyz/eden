"use client";
import { Hash, MessageSquare } from "lucide-react";
import React from "react";

export function ChatHeader() {
  const selectedChannel = {
    name: "Test Channel"
  }

  return (
    <div className="border-b h-14 px-4 py-2 flex items-center bg-primary/5 justify-between">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <Hash className="h-4 w-4 text-muted-foreground -mb-1" />
          <span className="hidden sm:inline truncate">
            {selectedChannel ? `${selectedChannel.name}` : "Select a channel"}
          </span>
        </span>
      </div>
    </div>
  );
} 