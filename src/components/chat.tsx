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
import { ServerRoomsPanel } from "@/components/navigation/rooms-panel";
import { ChatHeader } from "@/components/navigation/header";
import { MessagesArea } from "@/components/navigation/message-area";
import { MessageInput } from "@/components/navigation/message-input";
import { UsersPanel } from "@/components/navigation/users-panel";
import { CreateServerDialog } from "./navigation/create-server-dialog";

export default function Chat({ account }: { account: Account | null }) {
  // --- State ---
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);
  const [createServerOpen, setCreateServerOpen] = useState(false);

  // --- InstantDB Queries ---
  const { isLoading: serversLoading, error: serversError, data: serversData } = db.useQuery({ servers: {} });
  const { isLoading: channelsLoading, error: channelsError, data: channelsData } = db.useQuery(
    selectedServerId ? { channels: { $: { where: { serverId: selectedServerId } } } } : { channels: {} }
  );
  const { isLoading: messagesLoading, error: messagesError, data: messagesData } = db.useQuery(
    selectedChannelId
      ? { messages: { $: { where: { channelId: selectedChannelId } } } }
      : { messages: {} }
  );

  // --- Derived Data ---
  const servers: Server[] = serversData?.servers ?? [];
  const channels: Channel[] = channelsData?.channels ?? [];
  const messages: Message[] = selectedChannelId
    ? (messagesData?.messages ?? []).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  // --- Effects ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannelId || !account) return;
    await db.transact(
      db.tx.messages[id()].update({
        channelId: selectedChannelId,
        text: messageInput.trim(),
        sender: account.username?.localName || account.address,
        senderId: account.address,
        createdAt: Date.now(),
      })
    );
    setMessageInput("");
  };

  const handleCreateServer = async (appData: App, appAddress: string) => {
    await db.transact(
      db.tx.servers[id()].update({
        address: appAddress,
        name: appData.metadata?.name || appAddress,
        icon: appData.metadata?.logo || "",
        createdAt: Date.now(),
        owner: appData.owner || "",
      })
    );
    setCreateServerOpen(false);
  };

  const handleCreateChannel = () => {
    if (!selectedServerId) return;
    const name = prompt("Enter channel name:");
    if (!name) return;
    db.transact(
      db.tx.channels[id()].update({
        name: name.trim(),
        serverId: selectedServerId,
        createdAt: Date.now(),
      })
    );
  };

  // --- UI ---
  return (
    <>
      <CreateServerDialog
        open={createServerOpen}
        onOpenChange={setCreateServerOpen}
        onCreate={handleCreateServer}
      />
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen w-full rounded-lg border"
      >
        <ResizablePanel
          defaultSize={25}
          collapsible={true}
          minSize={15}
          maxSize={30}
          collapsedSize={4}
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className={`transition-all duration-300 ease-in-out ${isCollapsed ? "min-w-[50px]" : "min-w-[250px]"}`}
        >
          <ServerRoomsPanel
            servers={servers}
            selectedServerId={selectedServerId}
            setSelectedServerId={(id) => {
              setSelectedServerId(id);
              setSelectedChannelId(null);
            }}
            channels={channels}
            selectedChannelId={selectedChannelId}
            setSelectedChannelId={setSelectedChannelId}
            onCreateServerClick={() => setCreateServerOpen(true)}
            handleCreateChannel={handleCreateChannel}
            account={account}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            serversLoading={serversLoading}
            serversError={serversError}
            channelsLoading={channelsLoading}
            channelsError={channelsError}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col w-full h-full" style={{ marginRight: isUsersCollapsed ? 0 : 280 }}>
            <ChatHeader selectedChannelId={selectedChannelId} channels={channels} />
            <div className="flex-1 overflow-hidden p-4">
              {selectedChannelId ? (
                <MessagesArea
                  messages={messages}
                  messagesLoading={messagesLoading}
                  messagesError={messagesError}
                  account={account}
                  messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                />
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
              <MessageInput
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                handleSendMessage={handleSendMessage}
                selectedChannelId={selectedChannelId}
              />
            </div>
          </div>
        </ResizablePanel>
        {/* Users Panel (static and collapsible) */}
        <UsersPanel
          serverId={selectedServerId}
          isUsersCollapsed={isUsersCollapsed}
          setIsUsersCollapsed={setIsUsersCollapsed}
          currentUser={account ? { name: account.username?.localName || account.address, address: account.address } : null}
        />
      </ResizablePanelGroup>
    </>
  );
} 