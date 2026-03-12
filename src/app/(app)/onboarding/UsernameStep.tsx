"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { checkUsernameAvailable, claimUsername } from "@/lib/actions/profile";

interface UsernameStepProps {
  onComplete: () => void;
  initialUsername?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function UsernameStep({ onComplete, initialUsername }: UsernameStepProps) {
  const t = useT();
  const [username, setUsername] = useState(initialUsername || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check initial username availability
  useEffect(() => {
    if (initialUsername && initialUsername.length >= 3) {
      handleUsernameChange(initialUsername);
    }
  }, []);

  const handleUsernameChange = async (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
    setUsername(normalized);
    // Reset both states
    setError(null);
    setIsAvailable(null);

    if (normalized.length < 3) {
      if (normalized.length > 0) {
        setError(t("usernameTooShort"));
        setIsAvailable(false);
      }
      return;
    }

    if (normalized.length > 20) {
      setError(t("usernameTooLong"));
      setIsAvailable(false);
      return;
    }

    setIsChecking(true);
    const result = await checkUsernameAvailable(normalized);
    setIsChecking(false);

    // Always set both states together to avoid inconsistency
    if (result.error) {
      setError(result.error);
      setIsAvailable(false);
    } else if (result.available) {
      setError(null);
      setIsAvailable(true);
    } else {
      setError(t("usernameTaken"));
      setIsAvailable(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isSaving) return;

    setIsSaving(true);
    const result = await claimUsername(username);
    
    if (result.success) {
      onComplete();
    } else {
      setError(result.error || t("errorSavingUsername"));
      setIsSaving(false);
    }
  };

  const isValid = username.length >= 3 && isAvailable === true;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-purple-500/10" />
      
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -right-32 top-1/4 h-64 w-64 rounded-full border border-primary/10"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="absolute -left-32 bottom-1/4 h-48 w-48 rounded-full border border-primary/10"
      />

      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 left-6 z-50"
      >
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </motion.div>

      {/* Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 items-center justify-center px-6"
      >
        <div className="w-full max-w-md">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div 
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👤
            </motion.div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              {t("chooseUsername")}
            </h1>
            <p className="text-muted-foreground">
              {t("chooseUsernameDesc")}
            </p>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            {/* Input */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                @
              </span>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="yourname"
                whileFocus={{ scale: 1.02 }}
                className={`w-full rounded-2xl border-2 bg-card px-4 py-4 pl-9 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors ${
                  error 
                    ? "border-destructive focus:border-destructive" 
                    : isAvailable 
                      ? "border-green-500 focus:border-green-500"
                      : "border-border focus:border-primary"
                }`}
                autoFocus
                maxLength={20}
              />
              {/* Status indicator */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                )}
                {!isChecking && isAvailable === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
                {!isChecking && error && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <X className="h-5 w-5 text-destructive" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Error/hint */}
            <motion.div 
              className="min-h-[24px]"
              layout
            >
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.p>
              )}
              {!error && isAvailable && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-green-500"
                >
                  <Check size={14} />
                  {t("usernameAvailable")}
                </motion.p>
              )}
              {!error && !isAvailable && username.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("usernameHint")}</p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={!isValid || isSaving}
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              className="w-full rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex justify-center"
                >
                  <Loader2 className="h-5 w-5" />
                </motion.div>
              ) : (
                t("continue")
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
