import React, { createContext, useContext, useState } from "react";
import type { Account } from "@lens-protocol/client";

interface ChatAppContextValue {
  account: Account | null;
  selectedServerId: string | null;
  setSelectedServerId: (id: string | null) => void;
  selectedChannelId: string | null;
  setSelectedChannelId: (id: string | null) => void;
}

const ChatAppContext = createContext<ChatAppContextValue | undefined>(undefined);

export function ChatAppProvider({ account, children }: { account: Account | null; children: React.ReactNode }) {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const value: ChatAppContextValue = {
    account,
    selectedServerId,
    setSelectedServerId,
    selectedChannelId,
    setSelectedChannelId,
  };

  return <ChatAppContext.Provider value={value}>{children}</ChatAppContext.Provider>;
}

export function useChatApp() {
  const ctx = useContext(ChatAppContext);
  if (!ctx) throw new Error("useChatApp must be used within a ChatAppProvider");
  return ctx;
} 