"use client";
import { Login } from "@/components/login";
import { motion } from "motion/react";
import { Noto_Sans_JP, Yuji_Boku } from "next/font/google";
import { LockKeyhole, Code, Users } from 'lucide-react';

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});

// Import Yuji Boku font directly in the component
const yujiBoku = Yuji_Boku({
  variable: "--font-yuji-boku",
  subsets: ["latin"],
  weight: ["400"],
  preload: true,
});

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-full w-full p-8 md:p-12 gap-12 md:gap-24">
      {/* Left Column */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
        <h2 className="text-5xl font-bold mb-2">Chat-in-a-Box</h2>
        <p className="text-muted-foreground text-sm mb-4 text-center max-w-md mb-12">
          Talk to all of your Lens friends in a secure way.
        </p>
        <div className="flex flex-col gap-8 w-full max-w-md">
          <Login />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-start p-4 max-h-[450px] gap-8 rounded-lg w-full max-w-md mt-12 md:mt-0 md:w-1/2">

        {/* Feature Card 1 */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center mb-2">
            <LockKeyhole className="h-5 w-5 text-muted-foreground mr-3" />
            <h3 className="font-semibold">Secure</h3>
          </div>
          <p className="text-sm text-muted-foreground ">
            <b>End-to-end encrypted</b> conversations ensure your privacy.
            Box uses public-key cryptography to encrypt messages.
            Your passkey never leave your device.
          </p>
        </div>
        {/* Feature Card 2 */}
        <div className="border rounded-lg p-4 w-full bg-background">
          <div className="flex items-center mb-2">
            <Code className="h-5 w-5 text-muted-foreground mr-3" />
            <h3 className="font-semibold">Open Source</h3>
          </div>
          <p className="text-sm text-muted-foreground ">
            Built with transparency. <a href="https://github.com/kuhaku-xyz/eden" className="text-primary hover:underline">Audit the code</a> or <a href="https://github.com/kuhaku-xyz/eden" className="text-primary hover:underline">contribute</a>.
          </p>
        </div>
        {/* Feature Card 3 */}
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-muted-foreground mr-3" />
            <h3 className="font-semibold">Community Ran</h3>
          </div>
          <p className="text-sm text-muted-foreground ">
            Built by the community, for the community. Unaffiliated with Lens Labs.
          </p>
        </div>

      </div>
    </div>
  );
} 