import { createImage, useAccount } from "jazz-react";
import { Chat } from "@/lib/db/schema";
import { useCoState } from "jazz-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Account, ID } from "jazz-tools";
import { Message } from "@/lib/db/schema";
import { ScrollArea } from "../ui/scroll-area";
import { ChatMessage } from "./chat-message";

export function MessagesArea(props: { chatID: ID<Chat> }) {
  const chat = useCoState(Chat, props.chatID, { resolve: { $each: true } });
  const account = useAccount();
  const [showNLastMessages, setShowNLastMessages] = useState(30);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [chat]);

  if (!chat)
    return (
      <div className="flex-1 flex justify-center items-center">Loading...</div>
    );

  return (
    <ScrollArea
      className="pb-20 px-2 overflow-y-auto flex flex-col-reverse"
      ref={messagesEndRef}
      >
        {chat.length > showNLastMessages && (
          <button
            className="px-4 py-1 block mx-auto my-2 border rounded"
            onClick={() => setShowNLastMessages(showNLastMessages + 10)}
          >
            Show more
          </button>
        )}
        {chat.length > 0 ? (
          chat
            .slice(-showNLastMessages)
            .map((msg) => <ChatMessage me={account.me} msg={msg} key={msg.id} />)
        ) : (
        <div className="flex-1 flex justify-center items-center">Start a conversation below</div>
      )}
    </ScrollArea>
  );
}