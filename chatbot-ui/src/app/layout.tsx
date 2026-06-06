import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard | AI Assistant",
  description: "Next-gen AI assistant dashboard",
};

import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
    >
      <body className="h-full flex overflow-hidden text-slate-900 bg-slate-50/50">
        <UserProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
