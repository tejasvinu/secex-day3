import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar"; // Import the new Navbar
import { cn } from "@/lib/utils";

// Updated Metadata for SOC CTF
export const metadata: Metadata = {
  title: "SOC CTF Platform",
  description: "Monitor logs, detect events, and register observations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <AuthProvider>
          <Navbar /> {/* Add the Navbar here */}
          <main className="container mx-auto px-4 py-8"> {/* Add main tag for content */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}