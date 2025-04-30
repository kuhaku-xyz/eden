import { createImage, useAccount } from "jazz-react";
import { Chat } from "@/lib/db/schema";
import { useCoState } from "jazz-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Account, ID } from "jazz-tools";
import { Message } from "@/lib/db/schema";
import { BubbleImage } from "../ui";
import { ChatBody, BubbleContainer, BubbleBody, BubbleText, BubbleInfo, InputBar, ImageInput, TextInput } from "@/components/ui";
import { ScrollArea } from "../ui/scroll-area";

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
    <>
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
            .map((msg) => <ChatBubble me={account.me} msg={msg} key={msg.id} />)
        ) : (
          <div className="flex-1 flex justify-center items-center">Start a conversation below</div>
        )}
      </ScrollArea>
    </>
  );
}

function ChatBubble(props: { me: Account; msg: Message }) {
  if (!props.me.canRead(props.msg)) {
    return (
      <BubbleContainer fromMe={false}>
        <BubbleBody fromMe={false}>
          <BubbleText
            text="Message not readable"
            className="text-gray-500 italic"
          />
        </BubbleBody>
      </BubbleContainer>
    );
  }

  const lastEdit = props.msg._edits.text;
  const fromMe = lastEdit.by?.isMe;
  const { text, image } = props.msg;

  return (
    <BubbleContainer fromMe={fromMe}>
      <BubbleBody fromMe={fromMe}>
        {image && <BubbleImage image={image} />}
        <BubbleText text={text} />
      </BubbleBody>
      <BubbleInfo by={lastEdit.by?.profile?.name} madeAt={lastEdit.madeAt} />
    </BubbleContainer>
  );
}
