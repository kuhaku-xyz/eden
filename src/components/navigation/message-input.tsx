"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import React, { useState } from "react";
import { db } from "@/lib/db/instant";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";

export function MessageInput() {
  const { selectedChannel, account } = useChatApp();
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannel || !account) return;
    await db.transact(
      db.tx.messages[id()].update({
        channelId: selectedChannel.id,
        text: messageInput.trim(),
        sender: account.username?.localName || account.address,
        senderId: account.address,
        createdAt: Date.now(),
      })
    );
    setMessageInput("");
  };

  return (
    <form onSubmit={handleSendMessage} className="flex w-full items-center">
      <div className="relative w-full gap-2 shadow-lg rounded-2xl bg-background/80 backdrop-blur-lg border border-primary/10 p-1.5 flex items-center">
        <Input
          type="text"
          placeholder={selectedChannel ? "Type your message..." : "Select a channel to chat"}
          className="flex-1 border-0 rounded-lg drop-shadow-none backdrop-blur-sm shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
          disabled={!selectedChannel}
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
          disabled={!selectedChannel || !messageInput.trim()}
          title="Send Message"
          className="rounded-xl aspect-square p-2 h-9 w-9"
          variant="default"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send Message</span>
        </Button>
      </div>
    </form>
  );
} 