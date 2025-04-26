"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { db } from "@/lib/db/instant";
import { useChatApp } from "@/components/chat-app-context";
import { id } from "@instantdb/react";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";

export function MessageInput() {
  const { selectedChannel, account } = useChatApp();
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSendMessage} className="flex w-full items-center">
      <div className="relative w-full gap-2 shadow-lg rounded-2xl bg-background/80 backdrop-blur-lg border border-primary/10 p-1.5 flex items-center">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={selectedChannel ? "Type your message..." : "Select a channel to chat"}
            className="flex-1 border-0 rounded-lg drop-shadow-none backdrop-blur-sm shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 pr-8"
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
            type="button"
            variant="ghost"
            size="icon"
            ref={emojiButtonRef}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 hover:bg-accent"
            disabled={!selectedChannel}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Insert emoji</span>
          </Button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute right-0 bottom-full mb-2 z-50 bg-popover border rounded-md shadow-md"
            >
              <div className="w-80">
                <EmojiPicker
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg"
                  emojisPerRow={12}
                  emojiSize={28}
                  onEmojiSelect={handleEmojiSelect}
                >
                  <EmojiPicker.Header className="p-2 pb-0">
                    <EmojiPicker.Input
                      autoFocus={true}
                      className="ml-8 focus:ring-0 ring-0 ring-transparent"
                    />
                  </EmojiPicker.Header>
                  <EmojiPicker.Group>
                    <EmojiPicker.List hideStickyHeader={true} containerHeight={400} />
                  </EmojiPicker.Group>
                </EmojiPicker>
              </div>
            </div>
          )}
        </div>
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