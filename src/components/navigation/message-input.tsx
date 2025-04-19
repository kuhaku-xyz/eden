import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import React from "react";

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (v: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  selectedChannelId: string | null;
}

export function MessageInput({
  messageInput,
  setMessageInput,
  handleSendMessage,
  selectedChannelId,
}: MessageInputProps) {
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