"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { checkUsernameAvailable, claimUsername } from "@/lib/actions/profile";
import { Check, X, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

interface UsernameFormProps {
  currentUsername: string | null;
  onSuccess?: () => void;
}

export function UsernameForm({ currentUsername, onSuccess }: UsernameFormProps) {
  const t = useT();
  const [username, setUsername] = useState(currentUsername ?? "");
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    error?: string;
  } | null>(null);

  // Debounced availability check
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value === currentUsername) {
      setAvailability(null);
      return;
    }

    setIsChecking(true);
    const result = await checkUsernameAvailable(value);
    setIsChecking(false);
    setAvailability(result);
  }, [currentUsername]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAvailability(username);
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || isSaving) return;

    setIsSaving(true);
    const result = await claimUsername(username);
    setIsSaving(false);

    if (result.success) {
      onSuccess?.();
    } else if (result.error) {
      setAvailability({ available: false, error: result.error });
    }
  };

  const hasChanges = username !== currentUsername && username.length >= 3;
  const canSave = hasChanges && availability?.available && !isChecking && !isSaving;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("username")}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder={t("yournamePlaceholder")}
            maxLength={20}
            className="w-full rounded-lg border border-border bg-secondary/50 py-2.5 pl-8 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!isChecking && availability?.available && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {!isChecking && availability && !availability.available && (
              <X className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
        {availability?.error && (
          <p className="text-sm text-destructive">{availability.error}</p>
        )}
        {availability?.available && (
          <p className="text-sm text-green-500">{t("usernameAvailable")}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t("usernameHint")}
        </p>
      </div>

      <Button
        type="submit"
        disabled={!canSave}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("saving")}
          </>
        ) : currentUsername ? (
          t("updateUsername")
        ) : (
          t("claimUsername")
        )}
      </Button>
    </form>
  );
}
