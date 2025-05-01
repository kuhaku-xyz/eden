"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  useAuthenticatedUser,
} from "@lens-protocol/react";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AccountSelector } from "./account-selector";
import { type Account } from "@lens-protocol/client";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { usePasskeyAuth } from "jazz-react";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";

// Helper component for step indicator
const StepIndicator = ({ stepNumber, label, completed }: { stepNumber: number, label: string, completed: boolean }) => (
  <div className="flex items-center gap-2">
    {completed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs text-muted-foreground">
        {stepNumber}
      </div>
    )}
    <span className={`text-sm ${completed ? 'text-primary' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </div>
);

export function Login() {
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  const { isConnected: isWagmiConnected } = useAccount();
  const router = useRouter();
  const [mode, setMode] = useState<"initial" | "signup" | "login">("initial");

  // State for login steps
  const [currentStep, setCurrentStep] = useState(1);
  const [isWalletConnectedState, setIsWalletConnectedState] = useState(false);
  const [isLensSignedInState, setIsLensSignedInState] = useState(false);
  const [isPasskeyAddedState, setIsPasskeyAddedState] = useState(false);

  const auth = usePasskeyAuth({
    appName: "Box",
  });

  useEffect(() => {
    setIsWalletConnectedState(isWagmiConnected);
    if (isWagmiConnected) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
      setIsLensSignedInState(false);
      setIsPasskeyAddedState(false);
    }
  }, [isWagmiConnected]);

  useEffect(() => {
    const signedIn = !!authenticatedUser;
    setIsLensSignedInState(signedIn);
    if (signedIn && isWagmiConnected) {
      setCurrentStep(3);
    } else if (isWagmiConnected) {
      setCurrentStep(2);
    }
  }, [authenticatedUser, isWagmiConnected]);

  useEffect(() => {
    setIsPasskeyAddedState(auth.state === "signedIn");

    if (auth.state === "signedIn") {
      router.push("/chat/co_zWmZGwgXJhfW3AcunTr5hdC8t2p");
    }
  }, [auth.state, router]);

  const handlePasskeySetup = async () => {
    if (authenticatedUser?.address) {
      const client = await getLensClient();
      const account = await fetchAccount(client, {
        address: authenticatedUser.address,
      }).unwrapOr(null);
      if (!account?.username?.localName) {
        throw new Error("No username found");
      }
      await auth.signUp(account?.username?.localName);
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      await auth.logIn();
    } catch (error) {
      setMode("initial");
      console.error("Passkey login failed:", error);
    }

  };

  return (
    <div className="space-y-4 mb-2 w-full">
      {/* Initial mode with choice of sign up or login */}
      {mode === "initial" && (
        <div className="space-y-3">
          <Button
            onClick={() => setMode("signup")}
            className="w-full"
            variant="default"
          >
            Sign Up
          </Button>
          <Button
            onClick={() => {
              setMode("login");
              handlePasskeyLogin();
            }}
            className="w-full"
            variant="outline"
          >
            Log In
          </Button>
        </div>
      )}

      {/* Sign Up Flow */}
      {mode === "signup" && (
        <div className="space-y-4">
          <Button
            onClick={() => setMode("initial")}
            variant="ghost"
            className="pl-0 mb-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <div className="flex flex-col gap-2 mb-4">
            <StepIndicator stepNumber={1} label="Connect Wallet" completed={isWalletConnectedState} />
            <StepIndicator stepNumber={2} label="Login with Lens" completed={isLensSignedInState} />
            <StepIndicator stepNumber={3} label="Add Passkey (for E2EE)" completed={isPasskeyAddedState} />
          </div>

          {/* Step 1: Connect Wallet Button */}
          {currentStep === 1 && (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button onClick={show} className="w-full">
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          )}

          {/* Step 2: Sign in with Lens Button */}
          {currentStep === 2 && (
            <AccountSelector
              open={showAccountSelector}
              onOpenChange={setShowAccountSelector}
              updateDatabase={true}
              trigger={
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Sign in with Lens
                  </Button>
                </DialogTrigger>
              }
            />
          )}

          {/* Step 3: Add Passkey Button */}
          {currentStep === 3 && (
            auth.state === "signedIn" ? (
              <div className="flex items-center gap-2 text-sm w-full justify-between p-2 border rounded bg-background/50">
                <span
                  className="text-muted-foreground truncate"
                  title={authenticatedUser?.address}
                >
                  Signed in as:{" "}
                  <span className="text-primary font-semibold">
                    {authenticatedUser?.address}
                  </span>
                </span>
              </div>
            ) : (
              <div className="space-y-2 w-full">
                <Button
                  className="w-full"
                  onClick={handlePasskeySetup}
                  disabled={!authenticatedUser?.address}
                >
                  Add Passkey
                </Button>
              </div>
            )
          )}
        </div>
      )}

      {/* Login Flow - only shows status, no button */}
      {mode === "login" && (
        <div className="space-y-4">
          {auth.state === "signedIn" ? (
            <div className="flex items-center gap-2 text-sm w-full justify-between p-2 border rounded bg-background/50">
              <span className="text-muted-foreground truncate">
                Successfully logged in with passkey
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-sm text-muted-foreground">Logging in...</span>
            </div>
          )}
          <Button
            onClick={() => setMode("initial")}
            variant="ghost"
            className="w-full"
            size="sm"
          >
            Back
          </Button>
        </div>
      )}

      {/* Loading state */}
      {authUserLoading && (
        <Button className="w-full" disabled>
          Loading...
        </Button>
      )}
    </div>
  );
} 