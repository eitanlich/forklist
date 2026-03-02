"use client";

import { useT } from "@/lib/i18n/context";

export function AppPreview() {
  const t = useT();

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-6">
            {t("landingPreviewTitle")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("landingPreviewSubtitle")}
          </p>
        </div>

        {/* Phone mockup */}
        <div className="relative mx-auto max-w-sm">
          {/* Phone frame */}
          <div className="relative bg-card border-4 border-border rounded-[3rem] p-3 shadow-2xl shadow-black/50">
            {/* Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-full" />
            
            {/* Screen */}
            <div className="bg-background rounded-[2.25rem] overflow-hidden aspect-[9/19.5]">
              {/* App UI mockup */}
              <div className="h-full flex flex-col p-6 pt-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="h-3 w-20 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-5 w-32 bg-foreground/80 rounded font-serif" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                    👤
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { value: "47", label: "places" },
                    { value: "4.2", label: "avg" },
                    { value: "12", label: "cuisines" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-3 bg-card rounded-xl">
                      <div className="font-serif text-xl text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Review cards */}
                <div className="space-y-3 flex-1">
                  {[
                    { name: "Noma", rating: "4.8", tag: "Fine Dining" },
                    { name: "Disfrutar", rating: "4.9", tag: "Molecular" },
                    { name: "Septime", rating: "4.5", tag: "Bistro" },
                  ].map((review, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        🍽️
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{review.name}</div>
                        <div className="text-xs text-muted-foreground">{review.tag}</div>
                      </div>
                      <div className="text-primary font-serif text-sm">
                        ★ {review.rating}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom nav mockup */}
                <div className="flex justify-around pt-4 mt-4 border-t border-border/30">
                  <div className="w-6 h-6 rounded bg-primary/20" />
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-4 text-lg">
                    +
                  </div>
                  <div className="w-6 h-6 rounded bg-muted-foreground/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-4 bg-primary/10 rounded-[4rem] blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
}
