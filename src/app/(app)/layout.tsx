import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { I18nProvider } from "@/lib/i18n";
import { UserProvider } from "@/lib/user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UserProvider>
        <div className="flex min-h-dvh flex-col">
          <Header />
          {/* More generous padding for boutique feel */}
          <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-8 md:px-8 md:pb-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </UserProvider>
    </I18nProvider>
  );
}
