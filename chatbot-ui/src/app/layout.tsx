import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { AppProvider } from "@/context/AppContext";
import ShellWrapper from "@/components/ShellWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeoPulse AI",
  description: "Next-gen AI assistant for Christ University",
};

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
      <body className="h-full flex overflow-hidden text-slate-900 bg-white">
        <UserProvider>
          <AppProvider>
            <ShellWrapper>{children}</ShellWrapper>
          </AppProvider>
        </UserProvider>
      </body>
    </html>
  );
}
