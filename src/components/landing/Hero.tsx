"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export function Hero() {
  const t = useT();

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm rounded-full bg-primary/10 text-primary border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {t("landingBadge")}
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-6 text-foreground">
          {t("landingHeadline")}
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          {t("landingSubheadline")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="group relative px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            {t("landingCTAPrimary")}
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 text-muted-foreground hover:text-foreground font-medium text-lg transition-colors"
          >
            {t("landingCTASecondary")}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
        <span className="text-xs uppercase tracking-widest">{t("landingScroll")}</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
      </div>
    </section>
  );
}
