"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { getFollowers } from "@/lib/actions/follows";
import { UserListItem } from "@/components/social/UserListItem";

interface FollowersContentProps {
  userId: string;
  username: string;
}

interface FollowerUser {
  id: string;
  username: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export function FollowersContent({ userId, username }: FollowersContentProps) {
  const t = useT();
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function loadFollowers() {
      setIsLoading(true);
      const result = await getFollowers(userId, page);
      if (page === 1) {
        setUsers(result.users as FollowerUser[]);
      } else {
        setUsers((prev) => [...prev, ...(result.users as FollowerUser[])]);
      }
      setTotal(result.total);
      setHasMore(result.users.length === 20);
      setIsLoading(false);
    }
    loadFollowers();
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
          <h1 className="font-serif text-xl font-semibold">{t("followers")}</h1>
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
            {t("noFollowersYet")}
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
                showFollowButton
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
        {total} {t("followers").toLowerCase()}
      </p>
    </div>
  );
}
