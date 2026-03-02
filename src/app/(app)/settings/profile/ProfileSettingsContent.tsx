"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UsernameForm, ProfileForm } from "@/components/profile";
import { ExternalLink } from "lucide-react";
import { useT } from "@/lib/i18n";

interface ProfileSettingsContentProps {
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
}

export function ProfileSettingsContent({
  username,
  bio,
  avatarUrl,
  isPrivate,
}: ProfileSettingsContentProps) {
  const router = useRouter();
  const t = useT();
  const [currentUsername, setCurrentUsername] = useState(username);

  const handleUsernameSuccess = () => {
    router.refresh();
    // Re-fetch to get updated username
    setCurrentUsername(currentUsername);
  };

  const handleProfileSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Username Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
          {t("username")}
        </h2>
        <UsernameForm
          currentUsername={username}
          onSuccess={handleUsernameSuccess}
        />
        {username && (
          <div className="mt-4 rounded-lg bg-secondary/50 p-3">
            <p className="text-sm text-muted-foreground">
              {t("yourPublicProfile")}:{" "}
              <a
                href={`/u/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                forklist.app/u/{username}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}
      </section>

      {/* Profile Section - only show if username is claimed */}
      {username && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
            {t("profile")}
          </h2>
          <ProfileForm
            currentBio={bio}
            currentAvatarUrl={avatarUrl}
            isPrivate={isPrivate}
            onSuccess={handleProfileSuccess}
          />
        </section>
      )}
    </div>
  );
}
