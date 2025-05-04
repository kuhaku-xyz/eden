"use client";

import { getPublicClient } from "@/lib/lens/lens-client";
import { chains } from "@lens-chain/sdk/viem";
import { LensProvider } from "@lens-protocol/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { env } from "process";
import { JSX } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { JazzProvider } from "./jazz-provider";

const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(),
      [chains.testnet.id]: http(),
    },
    appName: "Box",
    appDescription: "Chat in a box.",
    appUrl: "https://lens.box",
    appIcon: "https://lens.box/favicon.ico",
  }),
);

export const Providers = ({ children }: { children: JSX.Element }) => {
  const queryClient = new QueryClient();
  const publicClient = getPublicClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <LensProvider client={publicClient}>
              <JazzProvider>
                {children}
              </JazzProvider>
            </LensProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
};
