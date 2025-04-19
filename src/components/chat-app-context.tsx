import React, { createContext, useContext, useState } from "react";
import type { Account } from "@lens-protocol/client";
import { Channel, Server } from "@/lib/db/instant";

interface ChatAppContextValue {
  account: Account | null;
  selectedServer: Server | null;
  setSelectedServer: (server: Server | null) => void;
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel | null) => void;
}

const ChatAppContext = createContext<ChatAppContextValue | undefined>(undefined);

export function ChatAppProvider({ account, children }: { account: Account | null; children: React.ReactNode }) {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const value: ChatAppContextValue = {
    account,
    selectedServer,
    setSelectedServer,
    selectedChannel,
    setSelectedChannel,
  };

  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>;
}

export function useChatApp() {
  const ctx = useContext(ChatAppContext);
  if (!ctx) throw new Error("useChatApp must be used within a ChatAppProvider");
  return ctx;
} 