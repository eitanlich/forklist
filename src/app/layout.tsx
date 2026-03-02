import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ForkList",
    template: "%s | ForkList",
  },
  description: "Track your restaurant adventures. Log visits, rate your experience, and build your personal food diary.",
  keywords: ["restaurants", "food", "reviews", "diary", "tracking", "ratings"],
  authors: [{ name: "ForkList" }],
  creator: "ForkList",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://forklist-phi.vercel.app",
    siteName: "ForkList",
    title: "ForkList - Track your restaurant adventures",
    description: "Log visits, rate your experience, and build your personal food diary.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ForkList - Track your restaurant adventures",
    description: "Log visits, rate your experience, and build your personal food diary.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${cormorant.variable} ${inter.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
