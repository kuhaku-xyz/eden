import { Geist, Geist_Mono } from "next/font/google";
import "../../public/globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eden",
  description: "Chat on lens in the garden of Eden",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <Providers>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-hidden`}
        >
          <main className="h-screen w-screen overflow-hidden bg-background">
            {children}
          </main>
        </body>
      </Providers>
    </html>
  );
}
