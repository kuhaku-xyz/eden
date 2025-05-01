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
          A simple, secure, and open-source chat app on Lens.
        </p>
        <div className="flex flex-col gap-8 w-full max-w-md">
          {/* Feature Card 1 */}
          <div className="border rounded-lg p-4 bg-background">
            <div className="flex items-center mb-2">
              <LockKeyhole className="h-5 w-5 text-muted-foreground mr-3" />
              <h3 className="font-semibold">E2EE</h3>
            </div>
            <p className="text-sm text-muted-foreground ">
              End-to-end encrypted conversations ensure your privacy.
            </p>
          </div>
          {/* Feature Card 2 */}
          <div className="border rounded-lg p-4 bg-background">
            <div className="flex items-center mb-2">
              <Code className="h-5 w-5 text-muted-foreground mr-3" />
              <h3 className="font-semibold">Open Source</h3>
            </div>
            <p className="text-sm text-muted-foreground ">
              Built with transparency. Audit the code and contribute.
            </p>
          </div>
          {/* Feature Card 3 */}
          <div className="border rounded-lg p-4 bg-background">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-muted-foreground mr-3" />
              <h3 className="font-semibold">Community Ran</h3>
            </div>
            <p className="text-sm text-muted-foreground ">
              Built by the community, unaffiliated with Lens Labs.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex flex-col items-start p-4 max-h-[450px] border rounded-lg w-full max-w-xs mt-12 md:mt-0 md:w-1/2">
        <Login />
      </div>
    </div>
  );
} 