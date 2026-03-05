"use client";

import { useState, useEffect, useTransition } from "react";
import { UserPlus, UserMinus, Clock, Loader2 } from "lucide-react";
import { followUser, unfollowUser, cancelFollowRequest } from "@/lib/actions/follows";
import { useT, useI18n } from "@/lib/i18n";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername?: string;
  targetIsPrivate?: boolean;
  initialIsFollowing: boolean;
  initialIsPending?: boolean;
  onFollowChange?: (isNowFollowing: boolean) => void;
  compact?: boolean;
}

export function FollowButton({
  targetUserId,
  targetUsername,
  targetIsPrivate = false,
  initialIsFollowing,
  initialIsPending = false,
  onFollowChange,
  compact = false,
}: FollowButtonProps) {
  const t = useT();
  const { locale } = useI18n();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(initialIsPending);
  const [isPendingAction, startTransition] = useTransition();
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  // Sync with props when they change (e.g., after batch fetch)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setIsPending(initialIsPending);
  }, [initialIsFollowing, initialIsPending]);

  const executeUnfollow = () => {
    const wasFollowing = isFollowing;
    const wasPending = isPending;
    
    setIsFollowing(false);
    setIsPending(false);
    setShowUnfollowModal(false);

    startTransition(async () => {
      try {
        const result = await unfollowUser(targetUserId);
        if (!("error" in result)) {
          onFollowChange?.(false);
        } else {
          setIsFollowing(wasFollowing);
          setIsPending(wasPending);
        }
      } catch {
        setIsFollowing(wasFollowing);
        setIsPending(wasPending);
      }
    });
  };

  const handleClick = () => {
    // If unfollowing a private account, show confirmation modal
    if (isFollowing && targetIsPrivate) {
      setShowUnfollowModal(true);
      return;
    }
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

  const unfollowModal = (
    <ConfirmModal
      isOpen={showUnfollowModal}
      onClose={() => setShowUnfollowModal(false)}
      onConfirm={executeUnfollow}
      title={locale === "es" ? "Dejar de seguir" : "Unfollow"}
      message={
        locale === "es"
          ? `Si cambias de opinión, tendrás que volver a solicitar seguir a @${targetUsername || "este usuario"}.`
          : `If you change your mind, you'll have to request to follow @${targetUsername || "this user"} again.`
      }
      confirmText={locale === "es" ? "Dejar de seguir" : "Unfollow"}
      cancelText={locale === "es" ? "Cancelar" : "Cancel"}
      destructive
      isLoading={isPendingAction}
    />
  );

  if (compact) {
    return (
      <>
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
        {unfollowModal}
      </>
    );
  }

  return (
    <>
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
      {unfollowModal}
    </>
  );
}
