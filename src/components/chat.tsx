"use client";

import { useState, useRef, useEffect } from "react";
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
export default function Chat() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);
  const [createServerOpen, setCreateServerOpen] = useState(false);
  const { me, logOut } = useAccount();

  return (
    <>
      <CreateServerDialog open={createServerOpen} onOpenChange={setCreateServerOpen} />
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col w-full h-full relative" style={{ marginRight: isUsersCollapsed ? 0 : 280 }}>
            <ChatHeader />

            <div className="flex-1 overflow-auto relative">
              <MessagesArea />
            </div>

            <div className="p-3 pb-4 absolute bottom-0 left-0 right-0 z-10 bg-transparent">
              <MessageInput />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}