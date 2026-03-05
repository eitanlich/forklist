"use client";

import Link from "next/link";
import { User, UserMinus, Loader2, Lock } from "lucide-react";
import { FollowButton } from "./FollowButton";
import { useT, useI18n } from "@/lib/i18n";

interface UserListItemProps {
  id: string;
  username: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isPrivate?: boolean;
  isFollowing?: boolean;
  isPending?: boolean;
  showFollowButton?: boolean;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  onFollowChange?: (isNowFollowing: boolean) => void;
  isRemoving?: boolean;
  isOwnProfile?: boolean;
}

export function UserListItem({
  id,
  username,
  email,
  bio,
  avatarUrl,
  isPrivate = false,
  isFollowing = false,
  isPending = false,
  showFollowButton = true,
  showRemoveButton = false,
  onRemove,
  onFollowChange,
  isRemoving = false,
  isOwnProfile = false,
}: UserListItemProps) {
  const t = useT();
  const { locale } = useI18n();
  
  // If no username, show email-based result but user can't be linked yet
  const displayName = username ? `@${username}` : email || t("unknownUser");
  const hasProfile = !!username;

  const content = (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${displayName}'s avatar`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-foreground truncate">{displayName}</p>
          {isPrivate && (
            <Lock size={12} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
        {bio && (
          <p className="text-sm text-muted-foreground truncate">{bio}</p>
        )}
        {!username && email && (
          <p className="text-xs text-muted-foreground">{t("noUsernameYet")}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-b-0">
      {hasProfile ? (
        <Link href={`/u/${username}`} className="flex-1 min-w-0">
          {content}
        </Link>
      ) : (
        <div className="flex-1 min-w-0 opacity-70">{content}</div>
      )}
      {showFollowButton && !isOwnProfile && hasProfile && (
        <FollowButton
          targetUserId={id}
          initialIsFollowing={isFollowing}
          initialIsPending={isPending}
          onFollowChange={onFollowChange}
          compact
        />
      )}
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 transition-colors"
          title={locale === "es" ? "Eliminar" : "Remove"}
        >
          {isRemoving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <UserMinus size={14} />
          )}
          <span className="hidden sm:inline">
            {locale === "es" ? "Eliminar" : "Remove"}
          </span>
        </button>
      )}
    </div>
  );
}
