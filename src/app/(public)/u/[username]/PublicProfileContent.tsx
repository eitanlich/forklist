"use client";

import { useState, useEffect } from "react";
import { Grid3X3, List, Settings, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProfileHeader, PublicReviewCard, ProfileStats } from "@/components/profile";
import { OnboardingChecklist } from "@/components/home/OnboardingChecklist";
import { useT, useI18n } from "@/lib/i18n";
import { getBatchLikeInfo } from "@/lib/actions/likes";
import type { ListWithCount } from "@/lib/actions/lists";

interface ChecklistData {
  hasReviews: boolean;
  hasShared: boolean;
  lastReviewId: string | null;
  lastRestaurantName: string | null;
}



interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  follower_count: number;
  following_count: number;
  is_private: boolean;
  reviews: any[];
}

interface PublicProfileContentProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isPending: boolean;
  lists?: ListWithCount[];
  checklistData?: ChecklistData | null;
}

type ViewMode = "list" | "grid";

const CHECKLIST_DISMISSED_KEY = "forklist_checklist_dismissed";

function ProfileContent({
  profile,
  isOwnProfile,
  isFollowing,
  isPending,
  lists = [],
  checklistData,
}: PublicProfileContentProps) {
  const [showChecklistInProfile, setShowChecklistInProfile] = useState(false);

  useEffect(() => {
    // Only show in profile if it was dismissed from home
    const dismissed = localStorage.getItem(CHECKLIST_DISMISSED_KEY);
    if (dismissed === "true") {
      setShowChecklistInProfile(true);
    }
  }, []);
  const t = useT();
  const { locale } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; hasLiked: boolean }>>({});
  const [likesLoaded, setLikesLoaded] = useState(false);

  // Load likes on client - NO CACHING
  useEffect(() => {
    async function loadLikes() {
      if (profile.reviews.length > 0) {
        const reviewIds = profile.reviews.map((r) => r.id);
        const likes = await getBatchLikeInfo(reviewIds);
        setLikeInfo(likes);
      }
      setLikesLoaded(true);
    }
    loadLikes();
  }, [profile.reviews]);

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

        {/* Onboarding Checklist - only shows here after dismissed from home */}
        {isOwnProfile && checklistData && showChecklistInProfile && (
          <div className="mb-6">
            <OnboardingChecklist
              hasReviews={checklistData.hasReviews}
              hasShared={checklistData.hasShared}
              lastReviewId={checklistData.lastReviewId}
              lastRestaurantName={checklistData.lastRestaurantName}
              onDismiss={() => setShowChecklistInProfile(false)}
            />
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
          isPrivate={profile.is_private}
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
              <PublicReviewCard
                key={review.id}
                review={review as any}
                likeCount={likeInfo[review.id]?.count ?? 0}
                hasLiked={likeInfo[review.id]?.hasLiked ?? false}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {profile.reviews.map((review) => (
              <GridReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {/* Lists Section */}
        {lists.length > 0 && (
          <>
            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Lists Header */}
            <div className="my-4">
              <h2 className="font-serif text-xl font-medium text-foreground">
                {t("lists")}
              </h2>
            </div>

            {/* Lists */}
            <div className="space-y-3">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20 hover:bg-card/80"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-semibold tracking-tight">
                        {list.name}
                      </h3>
                      {!list.is_public && (
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                          <Lock size={10} />
                          {t("privateList")}
                        </span>
                      )}
                    </div>
                    {list.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {list.description}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {list.item_count} {list.item_count === 1 ? t("place") : t("placesCount")}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </>
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
