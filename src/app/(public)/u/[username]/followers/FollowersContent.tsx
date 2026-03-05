"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { getFollowers, removeFollower, getBatchFollowStatus } from "@/lib/actions/follows";
import { UserListItem } from "@/components/social/UserListItem";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface FollowersContentProps {
  userId: string;
  username: string;
  isOwnProfile?: boolean;
}

interface FollowerUser {
  id: string;
  username: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export function FollowersContent({ userId, username, isOwnProfile = false }: FollowersContentProps) {
  const t = useT();
  const { locale } = useI18n();
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, { isFollowing: boolean; isPending: boolean }>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  
  // Modal state for remove confirmation
  const [removeModalUser, setRemoveModalUser] = useState<FollowerUser | null>(null);

  useEffect(() => {
    async function loadFollowers() {
      setIsLoading(true);
      const result = await getFollowers(userId, page);
      const newUsers = result.users as FollowerUser[];
      
      if (page === 1) {
        setUsers(newUsers);
      } else {
        setUsers((prev) => [...prev, ...newUsers]);
      }
      
      // Load follow status for current user (only if not own profile)
      if (!isOwnProfile && newUsers.length > 0) {
        const userIds = newUsers.map((u) => u.id);
        const status = await getBatchFollowStatus(userIds);
        setFollowStatus((prev) => ({ ...prev, ...status }));
      }
      
      setTotal(result.total);
      setHasMore(result.users.length === 20);
      setIsLoading(false);
    }
    loadFollowers();
  }, [userId, page, isOwnProfile]);

  const handleRemoveFollower = async (followerId: string) => {
    setRemovingIds((prev) => new Set(prev).add(followerId));
    
    const result = await removeFollower(followerId);
    
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== followerId));
      setTotal((prev) => prev - 1);
    }
    
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(followerId);
      return next;
    });
    setRemoveModalUser(null);
  };

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
                isFollowing={followStatus[user.id]?.isFollowing ?? false}
                isPending={followStatus[user.id]?.isPending ?? false}
                showFollowButton={!isOwnProfile}
                showRemoveButton={isOwnProfile}
                onRemove={() => setRemoveModalUser(user)}
                isRemoving={removingIds.has(user.id)}
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

      {/* Remove follower confirmation modal */}
      <ConfirmModal
        isOpen={!!removeModalUser}
        onClose={() => setRemoveModalUser(null)}
        onConfirm={() => removeModalUser && handleRemoveFollower(removeModalUser.id)}
        title={locale === "es" ? "Eliminar seguidor" : "Remove follower"}
        message={
          locale === "es"
            ? `@${removeModalUser?.username || "usuario"} ya no podrá ver tus publicaciones ni encontrarte en búsquedas. No se le notificará que lo eliminaste.`
            : `@${removeModalUser?.username || "user"} will no longer be able to see your posts or find you in search. They won't be notified that you removed them.`
        }
        confirmText={locale === "es" ? "Eliminar" : "Remove"}
        cancelText={locale === "es" ? "Cancelar" : "Cancel"}
        destructive
        isLoading={removeModalUser ? removingIds.has(removeModalUser.id) : false}
      />
    </div>
  );
}
