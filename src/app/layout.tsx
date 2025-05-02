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
  title: "Box",
  description: "Chat in a box",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default async function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-hidden`}
      >
        <Providers>
          <main className="h-screen w-screen overflow-hidden bg-background">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
