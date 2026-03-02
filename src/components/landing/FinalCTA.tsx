"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/context";

export function FinalCTA() {
  const t = useT();

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h2 className="font-serif text-4xl md:text-6xl font-medium tracking-tight mb-6">
          {t("landingFinalTitle")}
        </h2>
        
        {/* Subtext */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          {t("landingFinalSubtitle")}
        </p>

        {/* CTA */}
        <Link
          href="/sign-up"
          className="group inline-flex items-center gap-2 px-10 py-5 bg-primary text-primary-foreground font-medium rounded-full text-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/25"
        >
          {t("landingFinalCTA")}
          <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
        </Link>

        {/* Trust note */}
        <p className="mt-8 text-sm text-muted-foreground">
          {t("landingFinalTrust")}
        </p>
      </div>
    </section>
  );
}
