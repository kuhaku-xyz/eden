"use client";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Group } from "jazz-tools";
import { Chat } from "@/lib/db/schema";
import { useAccount } from "jazz-react";

export default function NewChatPage() {
  const { me } = useAccount();
  if (!me) {
    return <div>Loading...</div>;
  }

  const group = Group.create();
  group.addMember("everyone", "writer");
  const chat = Chat.create([], group);

  redirect(`/chat/${chat.id}`);
}