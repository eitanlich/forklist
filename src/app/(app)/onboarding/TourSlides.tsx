"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

interface TourSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    emoji: "📝",
    titleKey: "onboardingSlide1Title" as const,
    descKey: "onboardingSlide1Desc" as const,
  },
  {
    emoji: "📋",
    titleKey: "onboardingSlide2Title" as const,
    descKey: "onboardingSlide2Desc" as const,
  },
  {
    emoji: "👥",
    titleKey: "onboardingSlide3Title" as const,
    descKey: "onboardingSlide3Desc" as const,
  },
];

export function TourSlides({ onComplete }: TourSlidesProps) {
  const t = useT();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("skip")}
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Emoji */}
        <div className="text-8xl mb-8 animate-bounce-slow">
          {slide.emoji}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
          {t(slide.titleKey)}
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t(slide.descKey)}
        </p>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-12 left-0 right-0 px-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            {isLastSlide ? t("getStarted") : t("next")}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
