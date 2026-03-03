import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/user";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <UserProvider>
        <div className="flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-8 md:px-8 md:pb-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </UserProvider>
    </I18nProvider>
  );
}
