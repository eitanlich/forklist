"use client";

import { Lock } from "lucide-react";
import { I18nProvider, useT } from "@/lib/i18n";

interface PrivateProfileContentProps {
  username: string;
}

function PrivateProfileInner({ username }: PrivateProfileContentProps) {
  const t = useT();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          {/* Lock icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>

          {/* Username */}
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            @{username}
          </h1>

          {/* Private message */}
          <div className="max-w-sm space-y-2">
            <p className="text-lg font-medium text-foreground">
              {t("privateProfile")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("privateProfileDesc")}
            </p>
          </div>

          {/* Back link */}
          <a
            href="/explore"
            className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            {t("backToExplore")}
          </a>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Powered by ForkList
          </a>
        </div>
      </div>
    </div>
  );
}

export function PrivateProfileContent(props: PrivateProfileContentProps) {
  return (
    <I18nProvider>
      <PrivateProfileInner {...props} />
    </I18nProvider>
  );
}
