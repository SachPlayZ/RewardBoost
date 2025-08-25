import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "RewardBoost - Web3 Quest & Reward Platform",
  description:
    "Create and participate in Web3 quests with blockchain-powered rewards. Build communities, engage users, and earn tokens through gamified experiences.",
  openGraph: {
    title: "RewardBoost - Web3 Quest & Reward Platform",
    description:
      "Create and participate in Web3 quests with blockchain-powered rewards. Build communities, engage users, and earn tokens through gamified experiences.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "RewardBoost Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RewardBoost - Web3 Quest & Reward Platform",
    description:
      "Create and participate in Web3 quests with blockchain-powered rewards. Build communities, engage users, and earn tokens through gamified experiences.",
    images: ["/logo.png"],
  },
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style>{`
html {
  font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}
        `}</style>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
