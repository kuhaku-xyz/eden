import { Login } from "@/components/login";

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Eden</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Connect your wallet and Sign in with Lens to start chatting in public rooms. <br />
        Powered by Lens Protocol and InstantDB.
      </p>
      <div className="w-full max-w-xs">
        <Login />
      </div>
    </div>
  );
} 