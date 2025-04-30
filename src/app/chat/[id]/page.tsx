import ChatView from "@/components/chat";
import { Metadata } from "next";
import { ID } from "jazz-tools";
import { Chat } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat with others",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatView chatID={id as ID<Chat>} />;
} 