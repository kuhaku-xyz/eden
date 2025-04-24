"use client";
import { Login } from "@/components/login";
import { motion } from "motion/react";
import { Noto_Sans_JP, Yuji_Boku } from "next/font/google";

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
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      {/* Eden in Japanese katakana with moving gradient */}
      <motion.h1
        className="text-8xl font-normal mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: "200% 200%", fontFamily: yujiBoku.style.fontFamily }}
      >
        エデン
      </motion.h1>
      <div className="flex flex-row gap-2 items-center justify-center">
        <h2 className="text-3xl font-bold mb-4"></h2>
        <h2 className={`text-3xl font-bold mb-4 ${yujiBoku.className}`}>Welcome to Eden</h2>
      </div>

      <div className="w-full max-w-xs mt-10">
        <Login />
      </div>
      <p className="text-muted-foreground text-xs mb-8 text-center max-w-md">
        Connect your wallet and Sign in with Lens to start chatting
      </p>
    </div>
  );
} 