"use client";

import { ProfileHeader, PublicReviewCard } from "@/components/profile";
import { useT } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  reviews: any[];
}

interface PublicProfileContentProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isPending: boolean;
}

function ProfileContent({
  profile,
  isOwnProfile,
  isFollowing,
  isPending,
}: PublicProfileContentProps) {
  const t = useT();

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
        {/* Header */}
        <ProfileHeader
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          followerCount={profile.follower_count}
          followingCount={profile.following_count}
          reviewCount={profile.reviews.length}
          userId={profile.id}
          isFollowing={isFollowing}
          isPending={isPending}
          isOwnProfile={isOwnProfile}
        />

        {/* Divider */}
        <div className="my-6 border-t border-border" />

        {/* Reviews */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-medium text-foreground">
            {t("reviews")}
          </h2>

          {profile.reviews.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("noReviewsYet")}
            </p>
          ) : (
            <div className="space-y-3">
              {profile.reviews.map((review) => (
                <PublicReviewCard key={review.id} review={review as any} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
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

export function PublicProfileContent(props: PublicProfileContentProps) {
  return (
    <I18nProvider>
      <ProfileContent {...props} />
    </I18nProvider>
  );
}
