"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchAdminsFor, fetchApp } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";
import { App } from "@lens-protocol/client";
import { db } from "@/lib/db/instant";
import { id } from "@instantdb/react";
import { useChatApp } from "@/components/chat-app-context";

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const [appAddress, setAppAddress] = useState("");
  const [appData, setAppData] = useState<App | null>(null);
  const [fetchingApp, setFetchingApp] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { account } = useChatApp();

  const handleFetchApp = async () => {
    setFetchingApp(true);
    setFetchError(null);
    setAppData(null);
    try {
      const lens = await getLensClient();
      const app = await fetchApp(lens, { app: appAddress });
      if (!app || app.isErr()) {
        setFetchError("App not found: " + app.error.message);
        setFetchingApp(false);
        return;
      }
      setAppData(app.value);
    } catch (err: any) {
      setFetchError("Failed to fetch app data");
    } finally {
      setFetchingApp(false);
    }
  };

  const handleCreate = async () => {
    if (appData) {
      await db.transact(
        db.tx.servers[id()].update({
          address: appAddress,
          name: appData.metadata?.name || appAddress,
          icon: appData.metadata?.logo || "",
          createdAt: Date.now(),
          owner: appData.owner || account?.address || "",
        })
      );
      setAppAddress("");
      setAppData(null);
      setFetchError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Server</DialogTitle>
          <DialogDescription>
            Enter a Lens app address to create a server from its data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="App address (0x...)"
            value={appAddress}
            onChange={e => setAppAddress(e.target.value)}
            disabled={fetchingApp}
          />
          <Button onClick={handleFetchApp} disabled={!appAddress || fetchingApp}>
            {fetchingApp ? "Fetching..." : "Fetch App Data"}
          </Button>
          {fetchError && <div className="text-red-500 text-sm">{fetchError}</div>}
          {appData && (
            <div className="flex items-center gap-2 p-2 border rounded">
              {appData.metadata?.logo && <img src={appData.metadata?.logo} alt="icon" className="w-8 h-8 rounded-full" />}
              <div>
                <div className="font-semibold">{appData.metadata?.name}</div>
                <div className="text-xs text-muted-foreground">Owner: {appData.owner}</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={!appData}>Create Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 