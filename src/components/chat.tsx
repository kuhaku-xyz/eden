"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, PlusCircle, User as UserIcon, Send, LogIn, Hash } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { id, db, Server, Channel, Message } from "@/lib/db/instant";
import type { Account, App } from "@lens-protocol/client";
import { ServerPanel } from "@/components/navigation/server-panel";
import { ChatHeader } from "@/components/navigation/chat-header";
import { MessagesArea } from "@/components/navigation/message-area";
import { MessageInput } from "@/components/navigation/message-input";
import { UsersPanel } from "@/components/navigation/users-panel";
import { CreateServerDialog } from "./navigation/create-server-dialog";
import { ChatAppProvider, useChatApp } from "@/components/chat-app-context";

function ChatContent() {
  const {
    account,
    selectedServer,
    setSelectedServer,
    selectedChannel,
    setSelectedChannel,
  } = useChatApp();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);
  const [createServerOpen, setCreateServerOpen] = useState(false);

  const { isLoading: serversLoading, error: serversError, data: serversData } = db.useQuery({ servers: {} });
  const servers: Server[] = serversData?.servers ?? [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!serversLoading && servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0]);
    }
  }, [serversLoading, servers, selectedServer, setSelectedServer]);

  return (
    <>
      <CreateServerDialog open={createServerOpen} onOpenChange={setCreateServerOpen} />
      <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full rounded-lg border">
        <ResizablePanel
          defaultSize={25}
          collapsible
          minSize={20}
          maxSize={50} collapsedSize={7} onCollapse={() => setIsCollapsed(true)} onExpand={() => setIsCollapsed(false)} className={`${isCollapsed ? "min-w-[50px]" : "min-w-[250px]"}`}>
          <ServerPanel
            servers={servers}
            serversLoading={serversLoading}
            onCreateServerClick={() => setCreateServerOpen(true)}
            isCollapsed={isCollapsed}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col w-full h-full" style={{ marginRight: isUsersCollapsed ? 0 : 280 }}>
            <ChatHeader />
            <div className="flex-1 overflow-hidden p-4">
              {selectedChannel ? (
                <MessagesArea messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                  <MessageSquare className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold mb-1">
                    Select a channel to start chatting
                  </h3>
                  <p className="text-sm">
                    Create or join a channel from the sidebar.
                  </p>
                </div>
              )}
            </div>
            {/* Message Input */}
            <div className="border-t p-3 bg-background">
              <MessageInput />
            </div>
          </div>
        </ResizablePanel>

        <UsersPanel
          isUsersCollapsed={isUsersCollapsed}
          setIsUsersCollapsed={setIsUsersCollapsed}
          account={account}
        />
      </ResizablePanelGroup>
    </>
  );
}

export default function Chat({ account }: { account: Account | null }) {
  return (
    <ChatAppProvider account={account}>
      <ChatContent />
    </ChatAppProvider>
  );
} 