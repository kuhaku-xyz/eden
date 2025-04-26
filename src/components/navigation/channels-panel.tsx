"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Hash } from "lucide-react";
import { db, type Channel } from "@/lib/db/instant";
import { useChatApp } from "../chat-app-context";
import { fetchAdminsFor, fetchApp } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useAccount } from "wagmi";

export type ChannelsPanelProps = {
  handleCreateChannel: () => void;
  isCollapsed: boolean;
};

export function ChannelsPanel({
  handleCreateChannel,
  isCollapsed
}: ChannelsPanelProps) {
  const { selectedChannel, setSelectedChannel, selectedServer } = useChatApp();
  const { data: user } = useAuthenticatedUser();
  const [admins, setAdmins] = useState<string[]>([]);
  const { address: walletAddress } = useAccount();

  const { isLoading, error, data } = db.useQuery(selectedServer ? { channels: { $: { where: { serverId: selectedServer.id } } } } : {});

  useEffect(() => {
    async function fetchAdmins() {
      if (!selectedServer?.address) return;

      try {
        const lens = await getLensClient();
        const adminsResult = await fetchAdminsFor(lens, {
          address: selectedServer.address,
        });
        const appResult = await fetchApp(lens, {
          app: selectedServer.address,
        });

        if (adminsResult.isOk() && appResult.isOk()) {
          const adminAddresses = adminsResult.value.items.map(admin => admin.account.address.toLowerCase());
          const app = appResult.value;
          const owner = app?.owner;
          setAdmins([...adminAddresses, owner.toLowerCase()]);
        } else {
          if (adminsResult.isErr()) {
            console.error("Error fetching admins:", adminsResult.error);
          }
          if (appResult.isErr()) {
            console.error("Error fetching app:", appResult.error);
          }
          setAdmins([]);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        setAdmins([]);
      }
    }

    fetchAdmins();
  }, [selectedServer?.address]);

  const isAdmin = (user?.address && (admins.includes(user.address))) || (walletAddress && (admins.includes(walletAddress.toLowerCase())));
  console.log(admins, walletAddress)
  const channels: Channel[] = selectedServer ? (data?.channels ?? []) : [];

  const handleDeleteChannel = (channelId: string) => {
    console.log("Attempting to delete channel:", channelId);
    db.transact(db.tx.channels[channelId].delete());
    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null);
    }
  };

  if (!selectedServer && !selectedChannel) {
    return (
      <div className="flex flex-col flex-1 h-full bg-primary/5 space-y-2">
        <div className="flex-grow rounded">
          <div className="flex items-center h-14 px-4 py-2 justify-between border-b">
            <h2 className="text-base font-semibold truncate">Select a server or channel</h2>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col flex-1 h-full bg-primary/5 space-y-2">
      {!isCollapsed && (
        <div className="flex-grow rounded">
          <div className="flex items-center h-14 px-4 py-2 justify-between border-b">
            <h2 className="text-base font-semibold truncate">{selectedServer?.name}</h2>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="px-1" title="Create Channel" onClick={handleCreateChannel}>
                <PlusCircle className="h-6 w-6" />
              </Button>
            )}
          </div>
          <ScrollArea className="h-[calc(100%-40px)]">
            <div className="flex flex-col gap-1 p-2">
              {isLoading && <div className="text-xs text-muted-foreground">Loading channels...</div>}
              {error && <div className="text-xs text-red-500">Error loading channels</div>}
              {channels.length === 0 && !isLoading && (
                <div className="text-xs text-muted-foreground italic">No channels yet.</div>
              )}
              {channels.map((channel) => (
                isAdmin ? (
                  <ContextMenu key={channel.id}>
                    <ContextMenuTrigger>
                      <Button
                        variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                        className="w-full justify-start truncate"
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <Hash className="h-4 w-4 mr-2 text-muted-foreground" /> {channel.name}
                      </Button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onSelect={() => handleDeleteChannel(channel.id)} className="text-red-600">
                        Delete Channel
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ) : (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start truncate"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <Hash className="h-4 w-4 mr-2 text-muted-foreground" /> {channel.name}
                  </Button>
                )
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {/* Collapsed Sidebar */}
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-4 mt-4">
          {isAdmin && (
            <Button variant="ghost" size="icon" title="Create Channel" onClick={handleCreateChannel}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 