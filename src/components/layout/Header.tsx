"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useI18n, useT, type Locale } from "@/lib/i18n";

const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function Header() {
  const { locale, setLocale } = useI18n();
  const t = useT();
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: "/home", label: t("home") },
    { href: "/history", label: t("history") },
    { href: "/lists", label: t("lists") },
  ];

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 md:px-8">
        <Link
          href="/home"
          className="font-serif text-2xl font-semibold tracking-tight text-primary transition-all duration-300 hover:opacity-70"
        >
          ForkList
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/add"
            className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90"
          >
            <Plus size={16} strokeWidth={2.5} />
            {t("logAVisit")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              aria-label="Change language"
            >
              <Globe size={18} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLocale(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                      locale === lang.code
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 transition-transform duration-300 hover:scale-105",
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label={t("profile")}
                labelIcon={<span className="text-sm">👤</span>}
                href="/settings/profile"
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>
    </header>
  );
}
