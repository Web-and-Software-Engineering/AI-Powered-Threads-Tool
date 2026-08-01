import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThreadCraft AI • Threads Content Generator & Analytics Engine",
  description: "Automate, personalize, publish, and analyze your Threads content with AI feedback loops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased light">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans-custom">
        {children}
      </body>
    </html>
  );
}
