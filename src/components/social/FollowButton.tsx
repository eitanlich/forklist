"use client";

import { useState, useEffect, useTransition } from "react";
import { UserPlus, UserMinus, Clock, Loader2 } from "lucide-react";
import { followUser, unfollowUser, cancelFollowRequest } from "@/lib/actions/follows";
import { useT } from "@/lib/i18n";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialIsPending?: boolean;
  onFollowChange?: (isNowFollowing: boolean) => void;
  compact?: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialIsPending = false,
  onFollowChange,
  compact = false,
}: FollowButtonProps) {
  const t = useT();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(initialIsPending);
  const [isPendingAction, startTransition] = useTransition();

  // Sync with props when they change (e.g., after batch fetch)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setIsPending(initialIsPending);
  }, [initialIsFollowing, initialIsPending]);

  const handleClick = () => {
    // Save current state for potential revert
    const wasFollowing = isFollowing;
    const wasPending = isPending;

    // Optimistic update
    if (isFollowing) {
      // Unfollow
      setIsFollowing(false);
      setIsPending(false);
    } else if (isPending) {
      // Cancel request
      setIsFollowing(false);
      setIsPending(false);
    } else {
      // Follow - we'll know if pending after server response
      setIsFollowing(true);
      setIsPending(false);
    }

    startTransition(async () => {
      try {
        let result;
        
        if (wasFollowing) {
          result = await unfollowUser(targetUserId);
          if (!("error" in result)) {
            onFollowChange?.(false);
          }
        } else if (wasPending) {
          result = await cancelFollowRequest(targetUserId);
        } else {
          result = await followUser(targetUserId);
          // Check if follow resulted in pending request
          if ("success" in result && result.pending) {
            setIsFollowing(false);
            setIsPending(true);
            return;
          }
          if (!("error" in result)) {
            onFollowChange?.(true);
          }
        }

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
