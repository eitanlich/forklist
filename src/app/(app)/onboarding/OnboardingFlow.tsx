"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TourSlides } from "./TourSlides";
import { UsernameStep } from "./UsernameStep";
import { FirstReviewStep } from "./FirstReviewStep";

type Step = "tour" | "username" | "first-review";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("tour");

  const handleTourComplete = () => {
    setStep("username");
  };

  const handleUsernameComplete = () => {
    setStep("first-review");
  };

  const handleFirstReviewComplete = () => {
    router.push("/home");
  };

  const handleSkipToHome = () => {
    router.push("/home");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {step === "tour" && (
        <TourSlides onComplete={handleTourComplete} />
      )}
      {step === "username" && (
        <UsernameStep onComplete={handleUsernameComplete} />
      )}
      {step === "first-review" && (
        <FirstReviewStep 
          onComplete={handleFirstReviewComplete}
          onSkip={handleSkipToHome}
        />
      )}
    </div>
  );
}
