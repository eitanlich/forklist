"use client";

import { useT } from "@/lib/i18n/context";

const testimonials = [
  {
    quoteKey: "landingTestimonial1",
    author: "Sofia M.",
    role: "Food Blogger",
    avatar: "🍷",
  },
  {
    quoteKey: "landingTestimonial2",
    author: "Marco T.",
    role: "Restaurant Explorer",
    avatar: "🍜",
  },
  {
    quoteKey: "landingTestimonial3",
    author: "Elena R.",
    role: "Home Chef",
    avatar: "🍳",
  },
] as const;

export function SocialProof() {
  const t = useT();

  return (
    <section className="py-32 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-6">
            {t("landingSocialTitle")}
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="relative p-8 rounded-2xl bg-background border border-border/50"
            >
              {/* Quote mark */}
              <div className="absolute -top-4 left-8 text-5xl text-primary/30 font-serif">
                &ldquo;
              </div>
              
              {/* Quote */}
              <p className="text-foreground/90 leading-relaxed mb-6 pt-4">
                {t(testimonial.quoteKey as any)}
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", labelKey: "landingStatUsers" },
            { value: "50K+", labelKey: "landingStatReviews" },
            { value: "120+", labelKey: "landingStatCities" },
            { value: "4.9", labelKey: "landingStatRating" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-serif text-4xl md:text-5xl text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {t(stat.labelKey as any)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
