"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-safe md:hidden transform-gpu">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-8">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            pathname === "/"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home size={20} strokeWidth={pathname === "/" ? 2 : 1.5} />
          <span className="text-xs">Home</span>
        </Link>

        {/* Add — elevated center FAB */}
        <Link
          href="/add"
          aria-label="Log a visit"
          className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>

        {/* History */}
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            pathname === "/history"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen size={20} strokeWidth={pathname === "/history" ? 2 : 1.5} />
          <span className="text-xs">History</span>
        </Link>
      </div>
    </nav>
  );
}
