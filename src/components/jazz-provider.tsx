"use client"

import { User } from "@/lib/db/schema";
import { JazzProvider } from "jazz-react";

export function MyJazzProvider(props: { children: React.ReactNode }) {
  const JAZZ_PEER = process.env.JAZZ_PEER

  if (!JAZZ_PEER || !JAZZ_PEER.startsWith("wss://") && !JAZZ_PEER.startsWith("ws://")) {
    throw new Error("JAZZ_PEER is not set")
  }
  return (
    <JazzProvider
      sync={{ peer: JAZZ_PEER as `wss://${string}` | `ws://${string}` }}
      AccountSchema={User}
      defaultProfileName={getRandomUsername()}
    >
      {props.children}
    </JazzProvider>
  );
}

const animals = [
  "elephant",
  "penguin",
  "giraffe",
  "octopus",
  "kangaroo",
  "dolphin",
  "cheetah",
  "koala",
  "platypus",
  "pangolin",
];

export function getRandomUsername() {
  return `Anonymous ${animals[Math.floor(Math.random() * animals.length)]}`;
}
