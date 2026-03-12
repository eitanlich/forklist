"use client";

import { useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { checkUsernameAvailable, claimUsername } from "@/lib/actions/profile";

interface UsernameStepProps {
  onComplete: () => void;
  initialUsername?: string | null;
}

export function UsernameStep({ onComplete, initialUsername }: UsernameStepProps) {
  const t = useT();
  const [username, setUsername] = useState(initialUsername || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUsernameChange = async (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(normalized);
    setError(null);
    setIsAvailable(null);

    if (normalized.length < 3) {
      return;
    }

    setIsChecking(true);
    const result = await checkUsernameAvailable(normalized);
    setIsChecking(false);

    if (result.error) {
      setError(result.error);
      setIsAvailable(false);
    } else {
      setIsAvailable(result.available);
      if (!result.available) {
        setError(t("usernameTaken"));
      }
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
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <span className="font-serif text-xl font-medium text-foreground">ForkList</span>
      </div>

      {/* Content */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            {t("chooseUsername")}
          </h1>
          <p className="text-muted-foreground">
            {t("chooseUsernameDesc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder={t("yournamePlaceholder")}
              className="w-full rounded-2xl border border-border bg-card px-4 py-4 pl-8 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              maxLength={20}
            />
            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isChecking && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
              {!isChecking && isAvailable === true && (
                <Check className="h-5 w-5 text-green-500" />
              )}
              {!isChecking && isAvailable === false && (
                <X className="h-5 w-5 text-destructive" />
              )}
            </div>
          </div>

          {/* Error/hint */}
          <div className="h-6">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {!error && isAvailable && (
              <p className="text-sm text-green-500">{t("usernameAvailable")}</p>
            )}
            {!error && !isAvailable && username.length > 0 && username.length < 3 && (
              <p className="text-sm text-muted-foreground">{t("usernameHint")}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className="w-full rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              t("continue")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
