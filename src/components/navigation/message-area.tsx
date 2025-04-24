"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import type { Message } from "@/lib/db/instant";
// @ts-ignore TODO: fix account type
import type { Account } from "@lens-protocol/client"; // Ensure Account is imported
import { db } from "@/lib/db/instant";
import { useChatApp } from "@/components/chat-app-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { evmAddress, useAccountsBulk } from "@lens-protocol/react";
import { cn } from "@/lib/utils";


interface MessageGroup {
  senderId: string;
  messages: Message[];
  account?: Account;
  isSelf: boolean;
}

export function MessagesArea() {
  const { selectedChannel, account } = useChatApp();
  const { isLoading, error, data } = db.useQuery(selectedChannel ? { messages: { $: { where: { channelId: selectedChannel.id } } } } : { messages: {} });

  const sortedMessages: Message[] = selectedChannel ? (data?.messages ?? []).sort((a, b) => a.createdAt - b.createdAt) : [];

  const senderIds = Array.from(new Set(sortedMessages.map((msg) => msg.senderId))).filter(id => !!id);

  const { data: users } = useAccountsBulk({
    addresses: senderIds.map(id => evmAddress(id)),
  });

  const accountsByAddress = (users ?? []).reduce((acc: Record<string, Account>, user: Account) => {
    acc[user.address] = user;
    return acc;
  }, {});


  const messageGroups: MessageGroup[] = React.useMemo(() => {
    const groups: MessageGroup[] = [];
    if (sortedMessages.length === 0) return groups;

    let currentGroup: MessageGroup | null = null;

    for (const msg of sortedMessages) {
      if (!msg.senderId) continue;

      const senderAddress = msg.senderId;
      const isSelf = msg.sender === account?.username?.localName;
      const userAccount = accountsByAddress[senderAddress];

      if (currentGroup && senderAddress === currentGroup.senderId) {
        currentGroup.messages.push(msg);
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          senderId: senderAddress,
          messages: [msg],
          account: userAccount,
          isSelf: isSelf
        };
      }
    }
    if (currentGroup) {
      groups.push(currentGroup);
    }
    return groups;
  }, [sortedMessages, accountsByAddress]);


  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messageGroups, selectedChannel]);


  return (
    <ScrollArea className="h-full w-full" type="auto">
      <div className="px-4 pt-2 pb-2 pb-18">
        {isLoading && <div className="text-xs text-muted-foreground pb-16 text-center p-4">Loading messages...</div>}
        {error && <div className="text-xs text-red-500 text-center p-4">Error loading messages: {error.message}</div>}
        {messageGroups.length === 0 && !isLoading && (
          <div className="text-xs text-muted-foreground italic text-center p-4">No messages yet.</div>
        )}

        {messageGroups.map((group, groupIndex) => (
          <div key={group.senderId + groupIndex} className={`relative flex gap-2 ${group.isSelf ? "justify-end" : "justify-start"} mb-2`}>

            {!group.isSelf && (
              <div className="sticky bottom-19 self-end flex-shrink-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={group.account?.metadata?.picture} />
                  <AvatarFallback>{group.account?.username?.localName?.charAt(0)?.toUpperCase() || group.senderId?.slice(2, 3)?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className={`flex flex-col gap-0.5 ${group.isSelf ? "items-end" : "items-start"} max-w-[75%]`}>
              {group.messages.map((msg, msgIndex) => {
                const isFirstInGroup = msgIndex === 0;
                const isLastInGroup = msgIndex === group.messages.length - 1;

                return (
                  <div key={msg.id} className={`flex items-center gap-2 w-full ${group.isSelf ? "flex-row-reverse justify-start" : "flex-row justify-start"}`}>
                    <div className={`p-2 px-3 rounded-lg ${group.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {isFirstInGroup && (
                        <p className={`text-xs font-semibold ${group.isSelf ? 'text-left' : 'text-left'}`}>{group.account?.username?.localName || msg.sender || 'Unknown User'}</p>
                      )}
                      <div className="flex flex-row">
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <span className={`text-xs text-muted-foreground whitespace-nowrap flex items-end text-right ml-2 ${group.isSelf ? 'text-secondary/40' : ''}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    {!isLastInGroup && <div className="w-12 flex-shrink-0"></div>}
                  </div>
                );
              })}
            </div>

            {group.isSelf && (
              <div className="sticky bottom-19 self-end flex-shrink-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={group.account?.metadata?.picture} />
                  <AvatarFallback>{group.account?.username?.localName?.charAt(0)?.toUpperCase() || 'Me'}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 