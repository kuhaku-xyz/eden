"use client";
import React, { useState, useEffect } from "react";
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
import { getLensClient } from "@/lib/lens/lens-client";
import { App, evmAddress } from "@lens-protocol/client";
import { id } from "@instantdb/react";

interface CreateServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateServerDialog({ open, onOpenChange }: CreateServerDialogProps) {
  const [appAddress, setAppAddress] = useState("");
  const [appData, setAppData] = useState<App | null>(null);
  const [fetchingApp, setFetchingApp] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isValidEVMAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  useEffect(() => {
    if (isValidEVMAddress(appAddress)) {
      handleFetchApp();
    }
  }, [appAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAppAddress(value);
    setAppData(null);
    setFetchError(null);
  };

  const handleFetchApp = async () => {
    setFetchingApp(true);
    setFetchError(null);
    try {
      const lens = await getLensClient();
      const app = await fetchApp(lens, { app: evmAddress(appAddress) });
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
      /// TODO: Create server in db
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
          <DialogTitle>Add Server</DialogTitle>
          <DialogDescription>
            Enter a Lens app address to add it as a server.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <Input
            placeholder="App address (0x...)"
            value={appAddress}
            onChange={handleInputChange}
            disabled={fetchingApp}
          />
          {fetchingApp && <div className="text-sm text-muted-foreground">Fetching app data...</div>}
          {fetchError && <div className="text-red-500 text-sm">{fetchError}</div>}
          {appData && (
            <div className="flex items-center gap-2 p-4 border border-t-0 rounded-t-none -mt-1 pt-5 rounded-md">
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
          <Button onClick={handleCreate} disabled={!appData}>Add Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 