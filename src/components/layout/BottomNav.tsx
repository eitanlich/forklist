"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Plus, Search, User } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background backdrop-blur-none pb-safe md:hidden transform-gpu" style={{ position: 'fixed' }}>
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-around px-4">
        {/* Home */}
        <Link
          href="/home"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            pathname === "/home"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home size={20} strokeWidth={pathname === "/home" ? 2 : 1.5} />
          <span className="text-xs">{t("home")}</span>
        </Link>

        {/* Explore */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            pathname.startsWith("/explore")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search size={20} strokeWidth={pathname.startsWith("/explore") ? 2 : 1.5} />
          <span className="text-xs">{t("explore")}</span>
        </Link>

        {/* Add — elevated center FAB */}
        <Link
          href="/add"
          aria-label="Log a visit"
          className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
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
          <span className="text-xs">{t("history")}</span>
        </Link>

        {/* Profile */}
        <Link
          href="/settings/profile"
          className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
            pathname.startsWith("/settings")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User size={20} strokeWidth={pathname.startsWith("/settings") ? 2 : 1.5} />
          <span className="text-xs">{t("profile")}</span>
        </Link>
      </div>
    </nav>
  );
}
