"use client";

import Link from "next/link";
import { useT, useI18n } from "@/lib/i18n/context";

export function Footer() {
  const t = useT();
  const { locale, setLocale } = useI18n();

  return (
    <footer className="py-16 px-6 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-medium text-foreground">
                ForkList
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-sm">
              {t("landingFooterTagline")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              {t("landingFooterProduct")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-foreground/80 hover:text-primary transition-colors">
                  {t("landingFooterFeatures")}
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-foreground/80 hover:text-primary transition-colors">
                  {t("landingFooterGetStarted")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language toggle */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              {t("language")}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setLocale("en")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  locale === "en"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale("es")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  locale === "es"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                ES
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ForkList. {t("landingFooterRights")}</p>
          <div className="flex items-center gap-1">
            <span>{t("landingFooterMadeWith")}</span>
            <span className="text-primary">♥</span>
            <span>{t("landingFooterForFoodies")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
