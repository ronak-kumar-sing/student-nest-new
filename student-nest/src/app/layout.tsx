import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AuthModal from "@/components/auth/AuthModal";
import StudentNestChatDrawer from "@/components/chat/StudentNestChatDrawer";

export const metadata: Metadata = {
  title: "StudentNest | Premium Student Housing & Campus Living",
  description: "Discover designer lofts, studios, and en-suite student housing near top universities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <WishlistProvider>
            <ChatProvider>
              {children}
              <AuthModal />
              <StudentNestChatDrawer />
            </ChatProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
