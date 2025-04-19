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
import { ScrollArea } from "@/components/ui/scroll-area";
import { id, db, Room, Message } from "@/lib/db/instant";
import type { Account } from "@lens-protocol/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Chat({ account }: { account: Account | null }) {
  // --- State ---
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);

  // --- InstantDB Queries ---
  const { isLoading: roomsLoading, error: roomsError, data: roomsData } = db.useQuery({ rooms: {} });
  const { isLoading: messagesLoading, error: messagesError, data: messagesData } = db.useQuery(
    selectedRoomId
      ? { messages: { $: { where: { roomId: selectedRoomId } } } }
      : { messages: {} }
  );

  // --- Derived Data ---
  const rooms: Room[] = roomsData?.rooms ?? [];
  const messages: Message[] = selectedRoomId
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
    if (!messageInput.trim() || !selectedRoomId || !account) return;
    await db.transact(
      db.tx.messages[id()].update({
        roomId: selectedRoomId,
        text: messageInput.trim(),
        sender: account.username?.localName || account.address,
        senderId: account.address,
        createdAt: Date.now(),
      })
    );
    setMessageInput("");
  };

  const handleCreateRoom = () => {
    const name = prompt("Enter room name:");
    if (!name) return;
    db.transact(
      db.tx.rooms[id()].update({
        name: name.trim(),
        createdAt: Date.now(),
      })
    );
  };

  // --- UI ---
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screen w-full rounded-lg border"
    >
      {/* Sidebar: Rooms */}
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
        <div className="flex h-full flex-col space-y-2">
          {/* Auth Info */}
          {!isCollapsed && (
            <div className="p-4 py-2 h-12 border-b flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={account?.metadata?.picture} />
                <AvatarFallback>
                  {account?.username?.localName?.charAt(0) || account?.address.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {account?.username?.localName || account?.address}
            </div>
          )}
          {/* Rooms List */}
          {!isCollapsed && (
            <div className="flex-grow p-2 rounded">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold truncate">Rooms</h2>
                <Button variant="ghost" size="icon" title="Create Room" onClick={handleCreateRoom}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100%-40px)]">
                <div className="space-y-1">
                  {roomsLoading && <div className="text-xs text-muted-foreground">Loading rooms...</div>}
                  {roomsError && <div className="text-xs text-red-500">Error loading rooms</div>}
                  {rooms.length === 0 && !roomsLoading && (
                    <div className="text-xs text-muted-foreground italic">No rooms yet.</div>
                  )}
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={selectedRoomId === room.id ? "secondary" : "ghost"}
                      className="w-full justify-start truncate"
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <Hash className="h-4 w-4 mr-2 text-muted-foreground" /> {room.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          {/* Collapsed Sidebar */}
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              <Button variant="ghost" size="icon" title="Create Room" onClick={handleCreateRoom}>
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      {/* Main Chat Area */}
      <ResizablePanel defaultSize={50}>
        <div className="flex flex-col w-full h-full" style={{ marginRight: isUsersCollapsed ? 0 : 280 }}>
          {/* Chat Header */}
          <div className="border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline truncate">
                  {selectedRoomId
                    ? `#${rooms.find((r) => r.id === selectedRoomId)?.name || "room"}`
                    : "Select a room"}
                </span>
              </span>
            </div>
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden p-4">
            {selectedRoomId ? (
              <ScrollArea className="h-full w-full" type="auto">
                <div className="flex flex-col gap-2 p-2">
                  {messagesLoading && <div className="text-xs text-muted-foreground">Loading messages...</div>}
                  {messagesError && <div className="text-xs text-red-500">Error loading messages</div>}
                  {messages.length === 0 && !messagesLoading && (
                    <div className="text-xs text-muted-foreground italic">No messages yet.</div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${account && msg.senderId === account.address ? "items-end" : "items-start"}`}
                    >
                      <p className={`text-xs text-muted-foreground mb-0.5 ${account && msg.senderId === account.address ? 'mr-2' : 'ml-2'}`}>
                        {msg.sender}
                      </p>
                      <div className={`flex items-end gap-2 ${account && msg.senderId === account.address ? "flex-row-reverse" : "flex-row"}`}>
                        <div
                          className={`p-2 px-3 rounded-lg max-w-[75%] ${account && msg.senderId === account.address
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                            }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-semibold mb-1">
                  Select a room to start chatting
                </h3>
                <p className="text-sm">
                  Create or join a room from the sidebar.
                </p>
              </div>
            )}
          </div>
          {/* Message Input */}
          <div className="border-t p-3 bg-background">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
              <Input
                type="text"
                placeholder={selectedRoomId ? "Type your message..." : "Select a room to chat"}
                className="flex-1"
                disabled={!selectedRoomId}
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
                disabled={!selectedRoomId || !messageInput.trim()}
                title="Send Message"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send Message</span>
              </Button>
            </form>
          </div>
        </div>
      </ResizablePanel>
      {/* Users Panel (static and collapsible) */}
      <div
        className={`flex flex-col border-l bg-background h-full transition-all duration-300 ease-in-out ${isUsersCollapsed ? 'w-8 min-w-[2rem] max-w-[2rem]' : 'w-72 min-w-[16rem] max-w-[18rem]'
          }`}
        style={{ position: 'relative' }}
      >
        <button
          className="absolute -left-4 top-4 z-10 bg-background border rounded-full shadow p-1 hover:bg-muted transition"
          onClick={() => setIsUsersCollapsed((v) => !v)}
          title={isUsersCollapsed ? 'Expand Users Panel' : 'Collapse Users Panel'}
          type="button"
        >
          <span className="sr-only">{isUsersCollapsed ? 'Expand' : 'Collapse'} Users Panel</span>
          <svg
            className={`w-4 h-4 transition-transform ${isUsersCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {!isUsersCollapsed && (
          <>
            <h2 className="text-lg font-semibold p-4 py-2 border-b truncate">
              Users
            </h2>
            <ScrollArea className="flex-grow">
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-2 p-1.5 rounded text-sm hover:bg-muted">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate" title={account?.username?.localName || account?.address}>
                    {account?.username?.localName || account?.address}
                  </span>
                  <Badge variant="outline" className="ml-auto text-xs px-1.5 py-0.5">You</Badge>
                </div>
                {/* Add more users here if you implement user presence */}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </ResizablePanelGroup>
  );
} 