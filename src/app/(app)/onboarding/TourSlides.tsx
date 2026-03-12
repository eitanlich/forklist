"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    gradient: "from-orange-500/20 via-red-500/10 to-yellow-500/20",
  },
  {
    emoji: "📋",
    titleKey: "onboardingSlide2Title" as const,
    descKey: "onboardingSlide2Desc" as const,
    gradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
  },
  {
    emoji: "👥",
    titleKey: "onboardingSlide3Title" as const,
    descKey: "onboardingSlide3Desc" as const,
    gradient: "from-blue-500/20 via-purple-500/10 to-pink-500/20",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function TourSlides({ onComplete }: TourSlidesProps) {
  const t = useT();
  const [[currentSlide, direction], setSlide] = useState([0, 0]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setSlide([currentSlide + 1, 1]);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setSlide([currentSlide - 1, -1]);
    }
  };

  const goToSlide = (index: number) => {
    setSlide([index, index > currentSlide ? 1 : -1]);
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        />
      </AnimatePresence>

      {/* Decorative blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-50"
      >
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </motion.div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("skip")}
      </motion.button>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center text-center max-w-md"
          >
            {/* Emoji with bounce */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-8xl mb-8"
            >
              <motion.span
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block"
              >
                {slide.emoji}
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="font-serif text-3xl font-semibold text-foreground mb-4"
            >
              {t(slide.titleKey)}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {t(slide.descKey)}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 pb-28 px-6"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  width: index === currentSlide ? 32 : 8,
                  backgroundColor: index === currentSlide 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--muted-foreground) / 0.3)",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
          >
            {isLastSlide ? t("getStarted") : t("next")}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight size={20} />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
