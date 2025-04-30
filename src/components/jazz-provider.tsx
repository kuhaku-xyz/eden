"use client"

import { User } from "@/lib/db/schema";
import { useAccount, useAuthenticatedUser } from "@lens-protocol/react";
import { JazzProvider as JazzReactProvider } from "jazz-react";
import { useAccount as useJazzAccount } from "jazz-react";
import { useEffect } from "react";

const JAZZ_PEER_KEY = process.env.NEXT_PUBLIC_JAZZ_PEER_KEY
if (!JAZZ_PEER_KEY) {
  throw new Error("JAZZ_PEER_KEY is not set")
}

export function JazzProvider(props: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
      sync={{ peer: `wss://cloud.jazz.tools/?key=${JAZZ_PEER_KEY}` }}
      AccountSchema={User}
      
      defaultProfileName={getRandomUsername()}
    >
      {props.children}
    </JazzReactProvider>
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
