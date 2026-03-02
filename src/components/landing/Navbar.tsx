"use client";

import Link from "next/link";
import { useT, useI18n } from "@/lib/i18n/context";

export function Navbar() {
  const t = useT();
  const { locale, setLocale } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-medium text-foreground">
            ForkList
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Language toggle */}
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 rounded transition-colors ${
                locale === "en" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <span className="text-border">/</span>
            <button
              onClick={() => setLocale("es")}
              className={`px-2 py-1 rounded transition-colors ${
                locale === "es" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ES
            </button>
          </div>

          {/* Sign in */}
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("landingSignIn")}
          </Link>

          {/* Get started */}
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            {t("landingGetStarted")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
