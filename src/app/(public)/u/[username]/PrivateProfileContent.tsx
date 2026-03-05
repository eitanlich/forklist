"use client";

import { Lock } from "lucide-react";
import { I18nProvider, useT } from "@/lib/i18n";
import { FollowButton } from "@/components/social/FollowButton";

interface PrivateProfileContentProps {
  username: string;
  userId?: string | null;
  isFollowing?: boolean;
  isPending?: boolean;
  isLoggedIn?: boolean;
}

function PrivateProfileInner({ 
  username, 
  userId, 
  isFollowing = false, 
  isPending = false,
  isLoggedIn = false,
}: PrivateProfileContentProps) {
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

          {/* Follow Button - only show if logged in and have userId */}
          {isLoggedIn && userId && (
            <FollowButton
              targetUserId={userId}
              targetUsername={username}
              targetIsPrivate={true}
              initialIsFollowing={isFollowing}
              initialIsPending={isPending}
            />
          )}

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
            className="mt-4 rounded-xl bg-secondary px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:opacity-90"
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

export function PrivateProfileContent({
  username,
  userId,
  isFollowing,
  isPending,
  isLoggedIn,
}: PrivateProfileContentProps) {
  return (
    <I18nProvider>
      <PrivateProfileInner 
        username={username}
        userId={userId}
        isFollowing={isFollowing}
        isPending={isPending}
        isLoggedIn={isLoggedIn}
      />
    </I18nProvider>
  );
}
