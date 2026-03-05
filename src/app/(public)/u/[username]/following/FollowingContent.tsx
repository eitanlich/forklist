"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getFollowing, getBatchFollowStatus } from "@/lib/actions/follows";
import { UserListItem } from "@/components/social/UserListItem";

interface FollowingContentProps {
  userId: string;
  username: string;
  isOwnProfile?: boolean;
  currentUserId?: string;
}

interface FollowingUser {
  id: string;
  username: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export function FollowingContent({ userId, username, isOwnProfile = false, currentUserId }: FollowingContentProps) {
  const t = useT();
  const [users, setUsers] = useState<FollowingUser[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, { isFollowing: boolean; isPending: boolean }>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  // When user unfollows from own list, remove from UI
  const handleUnfollow = (unfollowedUserId: string) => {
    if (isOwnProfile) {
      setUsers((prev) => prev.filter((u) => u.id !== unfollowedUserId));
      setTotal((prev) => prev - 1);
    }
  };

  useEffect(() => {
    async function loadFollowing() {
      setIsLoading(true);
      const result = await getFollowing(userId, page);
      const newUsers = result.users as FollowingUser[];
      
      if (page === 1) {
        setUsers(newUsers);
      } else {
        setUsers((prev) => [...prev, ...newUsers]);
      }
      
      // Load follow status for current user
      // If own profile, all users are already followed (they're in YOUR following list)
      if (newUsers.length > 0) {
        if (isOwnProfile) {
          // Mark all as following since they're in your following list
          const status: Record<string, { isFollowing: boolean; isPending: boolean }> = {};
          newUsers.forEach((u) => {
            status[u.id] = { isFollowing: true, isPending: false };
          });
          setFollowStatus((prev) => ({ ...prev, ...status }));
        } else {
          const userIds = newUsers.map((u) => u.id);
          const status = await getBatchFollowStatus(userIds);
          setFollowStatus((prev) => ({ ...prev, ...status }));
        }
      }
      
      setTotal(result.total);
      setHasMore(result.users.length === 20);
      setIsLoading(false);
    }
    loadFollowing();
  }, [userId, page]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${username}`}
          className="rounded-lg p-2 hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-xl font-semibold">{t("followingCount")}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>

      {/* User list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t("notFollowingAnyone")}
          </p>
        ) : (
          <>
            {users.map((user) => (
              <UserListItem
                key={user.id}
                id={user.id}
                username={user.username}
                bio={user.bio}
                avatarUrl={user.avatar_url}
                isFollowing={followStatus[user.id]?.isFollowing ?? false}
                isPending={followStatus[user.id]?.isPending ?? false}
                currentUserId={currentUserId}
                showFollowButton
                onFollowChange={(isNowFollowing) => {
                  if (!isNowFollowing && isOwnProfile) {
                    handleUnfollow(user.id);
                  }
                }}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                className="w-full py-3 text-sm text-primary hover:bg-secondary/50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mx-auto" size={18} />
                ) : (
                  t("loadMore")
                )}
              </button>
            )}
          </>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {total} {t("followingCount").toLowerCase()}
      </p>
    </div>
  );
}
