"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, Sparkles } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { completeOnboarding } from "@/lib/actions/profile";

interface FirstReviewStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  },
};

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
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-background to-red-500/10"
        animate={{
          background: [
            "linear-gradient(to bottom right, rgba(249, 115, 22, 0.2), var(--background), rgba(239, 68, 68, 0.1))",
            "linear-gradient(to bottom right, rgba(239, 68, 68, 0.2), var(--background), rgba(249, 115, 22, 0.1))",
            "linear-gradient(to bottom right, rgba(249, 115, 22, 0.2), var(--background), rgba(239, 68, 68, 0.1))",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating food emojis */}
      <motion.div
        className="absolute text-4xl"
        style={{ top: "15%", left: "10%" }}
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🍕
      </motion.div>
      <motion.div
        className="absolute text-3xl"
        style={{ top: "25%", right: "15%" }}
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🍣
      </motion.div>
      <motion.div
        className="absolute text-4xl"
        style={{ bottom: "25%", left: "15%" }}
        animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🌮
      </motion.div>
      <motion.div
        className="absolute text-3xl"
        style={{ bottom: "30%", right: "10%" }}
        animate={{ y: [0, -20, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        ☕
      </motion.div>

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-10"
      >
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </motion.div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleSkip}
        className="absolute top-6 right-6 z-10 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("skipForNow")}
      </motion.button>

      {/* Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 items-center justify-center px-6"
      >
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Icon with glow */}
          <motion.div variants={itemVariants} className="relative mb-8">
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/30 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-2 ring-primary/20"
              whileHover={{ scale: 1.05 }}
            >
              <UtensilsCrossed className="h-14 w-14 text-primary" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4"
          >
            {t("firstReviewTitle")}
          </motion.h1>

          {/* Subtitle - emotional hook */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-muted-foreground leading-relaxed mb-8"
          >
            {t("firstReviewDesc")}
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants} className="w-full">
            <Link
              href="/add?onboarding=true"
              onClick={handleAddReview}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-2xl bg-primary px-8 py-5 text-lg font-semibold text-primary-foreground shadow-xl shadow-primary/30 text-center"
              >
                {t("firstReviewCTA")}
              </motion.div>
            </Link>
          </motion.div>

          {/* Secondary hint */}
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-sm text-muted-foreground flex items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏱️
            </motion.span>
            {t("firstReviewHint")}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
