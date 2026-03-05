"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, Users, TrendingUp, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { searchUsers, type SearchUser } from "@/lib/actions/users";
import { getPopularReviews, type PopularReview } from "@/lib/actions/explore";
import { getBatchLikeInfo } from "@/lib/actions/likes";
import { getBatchFollowStatus } from "@/lib/actions/follows";
import { UserListItem } from "@/components/social/UserListItem";
import { PopularReviewCard } from "@/components/explore/PopularReviewCard";

export function ExploreContent() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, { isFollowing: boolean; isPending: boolean }>>({});
  const [popularReviews, setPopularReviews] = useState<PopularReview[]>([]);
  const [likeInfo, setLikeInfo] = useState<Record<string, { count: number; hasLiked: boolean }>>({});
  const [isSearching, startSearch] = useTransition();
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setUsers([]);
      setFollowStatus({});
      return;
    }

    const timeout = setTimeout(() => {
      startSearch(async () => {
        const result = await searchUsers(query);
        setUsers(result.users);
        
        // Fetch follow status for all results
        if (result.users.length > 0) {
          const userIds = result.users.map((u) => u.id);
          const status = await getBatchFollowStatus(userIds);
          setFollowStatus(status);
        }
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Load popular reviews on mount
  useEffect(() => {
    async function loadReviews() {
      const result = await getPopularReviews(10);
      setPopularReviews(result.reviews);
      
      // Fetch like info (hasLiked) for current user
      if (result.reviews.length > 0) {
        const reviewIds = result.reviews.map((r) => r.id);
        const likes = await getBatchLikeInfo(reviewIds);
        setLikeInfo(likes);
      }
      
      setIsLoadingReviews(false);
    }
    loadReviews();
  }, []);

  const showSearchResults = query.trim().length >= 2;

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold">{t("explore")}</h1>
        <p className="text-sm text-muted-foreground">{t("exploreSubtitle")}</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchUsersPlaceholder")}
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {isSearching && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            size={18}
          />
        )}
      </div>

      {/* Search results */}
      {showSearchResults && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/30">
            <Users size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">{t("users")}</span>
          </div>
          {users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {isSearching ? t("loading") : t("noUsersFound")}
            </p>
          ) : (
            <div>
              {users.map((user) => (
                <UserListItem
                  key={user.id}
                  id={user.id}
                  username={user.username}
                  email={user.email}
                  bio={user.bio}
                  avatarUrl={user.avatar_url}
                  isPrivate={user.is_private}
                  isFollowing={followStatus[user.id]?.isFollowing ?? false}
                  isPending={followStatus[user.id]?.isPending ?? false}
                  showFollowButton
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular reviews (show when not searching) */}
      {!showSearchResults && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold">{t("trendingReviews")}</h2>
          </div>
          {isLoadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : popularReviews.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t("noReviewsYet")}
            </p>
          ) : (
            <div className="space-y-3">
              {popularReviews.map((review) => (
                <PopularReviewCard
                  key={review.id}
                  review={review}
                  hasLiked={likeInfo[review.id]?.hasLiked ?? false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
