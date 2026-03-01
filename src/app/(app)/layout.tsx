import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Bottom padding on mobile to account for the fixed BottomNav */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 pt-6 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
