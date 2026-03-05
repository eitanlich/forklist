"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { FollowButton } from "./FollowButton";
import { useT } from "@/lib/i18n";

interface UserListItemProps {
  id: string;
  username: string | null;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isFollowing?: boolean;
  isPending?: boolean;
  showFollowButton?: boolean;
  isOwnProfile?: boolean;
}

export function UserListItem({
  id,
  username,
  email,
  bio,
  avatarUrl,
  isFollowing = false,
  isPending = false,
  showFollowButton = true,
  isOwnProfile = false,
}: UserListItemProps) {
  const t = useT();
  
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
        <p className="font-medium text-foreground truncate">{displayName}</p>
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
          compact
        />
      )}
    </div>
  );
}
