import { Playfair_Display, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/user";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import "../globals.css";

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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
          <I18nProvider>
            <UserProvider>
              <div className="flex min-h-dvh flex-col">
                <Header />
                <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-8 md:px-8 md:pb-10">
                  {children}
                </main>
                <BottomNav />
              </div>
            </UserProvider>
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
