"use client";

import { useT } from "@/lib/i18n";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { completeOnboarding } from "@/lib/actions/profile";

interface FirstReviewStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function FirstReviewStep({ onSkip }: FirstReviewStepProps) {
  const t = useT();

  const handleSkip = async () => {
    await completeOnboarding();
    onSkip();
  };

  const handleAddReview = async () => {
    await completeOnboarding();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("skipForNow")}
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Icon with glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <UtensilsCrossed className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-4">
          {t("firstReviewTitle")}
        </h1>

        {/* Subtitle - emotional hook */}
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {t("firstReviewDesc")}
        </p>

        {/* CTA */}
        <Link
          href="/add?onboarding=true"
          onClick={handleAddReview}
          className="w-full rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 text-center"
        >
          {t("firstReviewCTA")}
        </Link>

        {/* Secondary hint */}
        <p className="mt-6 text-sm text-muted-foreground">
          {t("firstReviewHint")}
        </p>
      </div>
    </div>
  );
}
