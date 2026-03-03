"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus, Clock, Loader2 } from "lucide-react";
import { followUser, unfollowUser } from "@/lib/actions/follows";
import { useT } from "@/lib/i18n";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialIsPending?: boolean;
  compact?: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialIsPending = false,
  compact = false,
}: FollowButtonProps) {
  const t = useT();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(initialIsPending);
  const [isPendingAction, startTransition] = useTransition();

  const handleClick = () => {
    // Optimistic update
    const wasFollowing = isFollowing;
    const wasPending = isPending;

    if (isFollowing || isPending) {
      setIsFollowing(false);
      setIsPending(false);
    } else {
      setIsFollowing(true);
      setIsPending(false);
    }

    startTransition(async () => {
      try {
        const result = wasFollowing || wasPending
          ? await unfollowUser(targetUserId)
          : await followUser(targetUserId);

        if ("error" in result) {
          // Revert on error
          setIsFollowing(wasFollowing);
          setIsPending(wasPending);
        }
      } catch {
        // Revert on error
        setIsFollowing(wasFollowing);
        setIsPending(wasPending);
      }
    });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPendingAction}
        className={`flex items-center justify-center rounded-lg p-2 text-sm transition-colors ${
          isFollowing
            ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive"
            : isPending
            ? "bg-secondary text-muted-foreground"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
        title={isFollowing ? t("unfollow") : isPending ? t("requested") : t("follow")}
      >
        {isPendingAction ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isFollowing ? (
          <UserMinus size={16} />
        ) : isPending ? (
          <Clock size={16} />
        ) : (
          <UserPlus size={16} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPendingAction}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        isFollowing
          ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive"
          : isPending
          ? "bg-secondary text-muted-foreground"
          : "bg-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      {isPendingAction ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFollowing ? (
        <UserMinus size={16} />
      ) : isPending ? (
        <Clock size={16} />
      ) : (
        <UserPlus size={16} />
      )}
      {isFollowing ? t("following") : isPending ? t("requested") : t("follow")}
    </button>
  );
}
