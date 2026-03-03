"use client";

import { useState } from "react";
import { Grid3X3, List, Settings } from "lucide-react";
import Link from "next/link";
import { ProfileHeader, PublicReviewCard, ProfileStats } from "@/components/profile";
import { useT, useI18n } from "@/lib/i18n";



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

type ViewMode = "list" | "grid";

function ProfileContent({
  profile,
  isOwnProfile,
  isFollowing,
  isPending,
}: PublicProfileContentProps) {
  const t = useT();
  const { locale } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <div className="bg-background">
      <div className="py-4">
        {/* Settings link for own profile */}
        {isOwnProfile && (
          <div className="mb-4 flex justify-end">
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Settings size={16} />
              {locale === "es" ? "Configuración" : "Settings"}
            </Link>
          </div>
        )}

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

        {/* Stats */}
        <div className="my-6">
          <ProfileStats userId={profile.id} />
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* View Toggle + Reviews Header */}
        <div className="my-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-foreground">
            {t("reviews")}
          </h2>
          
          {profile.reviews.length > 0 && (
            <div className="flex gap-1 rounded-lg bg-secondary/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Reviews */}
        {profile.reviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {t("noReviewsYet")}
          </p>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {profile.reviews.map((review) => (
              <PublicReviewCard key={review.id} review={review as any} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {profile.reviews.map((review) => (
              <GridReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

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

// Simple grid card for grid view
function GridReviewCard({ review }: { review: any }) {
  const photoUrl = review.restaurant?.photo_reference
    ? `/api/places/photo?ref=${encodeURIComponent(review.restaurant.photo_reference)}`
    : null;

  return (
    <Link 
      href={`/review/${review.id}`}
      className="relative aspect-square overflow-hidden bg-secondary hover:opacity-90 transition-opacity"
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={review.restaurant?.name || "Restaurant"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl">
          🍽️
        </div>
      )}
      {/* Rating overlay */}
      <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
        <span>⭐</span>
        <span>{review.rating_overall}</span>
      </div>
    </Link>
  );
}

export function PublicProfileContent(props: PublicProfileContentProps) {
  return <ProfileContent {...props} />;
}
