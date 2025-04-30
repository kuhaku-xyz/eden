"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatHeader } from "@/components/navigation/chat-header";
import { MessageInput } from "@/components/navigation/message-input";
import { CreateServerDialog } from "./navigation/create-server-dialog";
import { useAccount } from "jazz-react";
import { MessagesArea } from "./navigation/message-area";
import { Chat } from "@/lib/db/schema";
import { Group, ID } from "jazz-tools";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatViewProps {
  chatID?: ID<Chat>;
}

export default function ChatView({ chatID }: ChatViewProps) {
  const { me } = useAccount();
  const router = useRouter();
  const params = useParams();
  const currentChatID = chatID || (params?.id as ID<Chat>);

  useEffect(() => {
    if (!currentChatID) {
      createChat();
    }
  }, [currentChatID]);

  const createChat = () => {
    if (!me) return;
    const group = Group.create();
    group.addMember("everyone", "writer");
    const chat = Chat.create([], group);
    router.push(`/chat/${chat.id}`);
  };

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col w-full h-full relative overflow-hidden">
            <ChatHeader />

              {currentChatID && <MessagesArea chatID={currentChatID} />}

            <div className="p-3 pb-4 mt-auto absolute bottom-0 left-0 right-0 z-10 bg-transparent">
              {currentChatID && <MessageInput chatID={currentChatID} />}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}