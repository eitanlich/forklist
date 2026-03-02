import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* More generous padding for boutique feel */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-24 pt-8 md:px-8 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
