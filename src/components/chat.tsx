"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageInput } from "@/components/chat/message-input";
import { CreateServerDialog } from "./create-server-dialog";
import { useAccount, useIsAuthenticated } from "jazz-react";
import { MessagesArea } from "./chat/message-area";
import { Chat } from "@/lib/db/schema";
import { ID } from "jazz-tools";
import { redirect, useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ChatViewProps {
  chatID?: ID<Chat>;
}

export default function ChatView({ chatID }: ChatViewProps) {
  const params = useParams();
  const isAuthenticated = useIsAuthenticated();
  const { me } = useAccount()
  const currentChatID = chatID || (params?.id as ID<Chat>);
  const avatar = me?.profile?.picture;

  if (!isAuthenticated) {
    redirect("/");
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col w-full h-full relative overflow-hidden">
            <ChatHeader />

            {currentChatID && <MessagesArea chatID={currentChatID} />}

            <div className="p-4 pr-5 mt-auto gap-4 flex flex-row items-center absolute bottom-0 left-0 right-0 z-10 bg-transparent">
              {avatar && <Avatar className="w-10 h-10" >
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  {me?.profile?.name?.slice(0, 1)}
                </AvatarFallback>
              </Avatar>}
              {currentChatID && <MessageInput chatID={currentChatID} />}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}