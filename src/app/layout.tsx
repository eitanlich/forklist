import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
