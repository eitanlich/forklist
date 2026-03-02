"use client";

import { useT } from "@/lib/i18n/context";

const features = [
  {
    icon: "📓",
    titleKey: "landingFeature1Title",
    descKey: "landingFeature1Desc",
  },
  {
    icon: "🌍",
    titleKey: "landingFeature2Title",
    descKey: "landingFeature2Desc",
  },
  {
    icon: "👥",
    titleKey: "landingFeature3Title",
    descKey: "landingFeature3Desc",
  },
  {
    icon: "📍",
    titleKey: "landingFeature4Title",
    descKey: "landingFeature4Desc",
  },
] as const;

export function Features() {
  const t = useT();

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-6">
            {t("landingFeaturesTitle")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landingFeaturesSubtitle")}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="text-4xl mb-6">{feature.icon}</div>
              
              {/* Title */}
              <h3 className="font-serif text-2xl font-medium mb-3 group-hover:text-primary transition-colors">
                {t(feature.titleKey as any)}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {t(feature.descKey as any)}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
