"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import React, { useState } from "react";
import { db } from "@/lib/db/instant";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";

export function MessageInput() {
  const { selectedChannelId, account } = useChatApp();
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannelId || !account) return;
    await db.transact(
      db.tx.messages[id()].update({
        channelId: selectedChannelId,
        text: messageInput.trim(),
        sender: account.username?.localName || account.address,
        senderId: account.address,
        createdAt: Date.now(),
      })
    );
    setMessageInput("");
  };

  return (
    <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
      <Input
        type="text"
        placeholder={selectedChannelId ? "Type your message..." : "Select a channel to chat"}
        className="flex-1"
        disabled={!selectedChannelId}
        autoComplete="off"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            handleSendMessage(e as any);
          }
        }}
      />
      <Button
        type="submit"
        disabled={!selectedChannelId || !messageInput.trim()}
        title="Send Message"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send Message</span>
      </Button>
    </form>
  );
} 