import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Startup Swarm | AI-Powered Multi-Agent Startup Accelerator",
  description: "Autonomous AI agents analyze, debate, and evaluate your startup idea — delivering a real go/no-go decision, roadmap, and risk assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-white text-[#111827]`}
      >
        {children}
      </body>
    </html>
  );
}

