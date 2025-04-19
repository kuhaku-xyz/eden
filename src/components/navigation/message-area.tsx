"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import type { Message } from "@/lib/db/instant";
import type { Account } from "@lens-protocol/client";
import { db } from "@/lib/db/instant";
import { useChatApp } from "@/components/chat-app-context";

interface MessagesAreaProps {
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessagesArea({
  messagesEndRef,
}: MessagesAreaProps) {
  const { selectedChannelId, account } = useChatApp();
  const { isLoading, error, data } = db.useQuery(
    selectedChannelId
      ? { messages: { $: { where: { channelId: selectedChannelId } } } }
      : { messages: {} }
  );
  const messages: Message[] = selectedChannelId
    ? (data?.messages ?? []).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  return (
    <ScrollArea className="h-full w-full" type="auto">
      <div className="flex flex-col gap-2 p-2">
        {isLoading && <div className="text-xs text-muted-foreground">Loading messages...</div>}
        {error && <div className="text-xs text-red-500">Error loading messages</div>}
        {messages.length === 0 && !isLoading && (
          <div className="text-xs text-muted-foreground italic">No messages yet.</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${account && msg.senderId === account.address ? "items-end" : "items-start"}`}
          >
            <p className={`text-xs text-muted-foreground mb-0.5 ${account && msg.senderId === account.address ? 'mr-2' : 'ml-2'}`}>
              {msg.sender}
            </p>
            <div className={`flex items-end gap-2 ${account && msg.senderId === account.address ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className={`p-2 px-3 rounded-lg max-w-[75%] ${account && msg.senderId === account.address
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
                  }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 