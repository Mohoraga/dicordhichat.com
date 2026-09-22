import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DicordChat — Better group chats for friends",
  description: "A modern chat app for friends, rooms, and invite codes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
