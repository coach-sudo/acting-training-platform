import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Acting Training Platform",
  description: "Keep the thread of every actor's training.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
