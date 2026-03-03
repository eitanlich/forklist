"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { FollowButton } from "./FollowButton";

interface UserListItemProps {
  id: string;
  username: string | null;
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
  bio,
  avatarUrl,
  isFollowing = false,
  isPending = false,
  showFollowButton = true,
  isOwnProfile = false,
}: UserListItemProps) {
  if (!username) return null;

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-b-0">
      <Link
        href={`/u/${username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${username}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">@{username}</p>
          {bio && (
            <p className="text-sm text-muted-foreground truncate">{bio}</p>
          )}
        </div>
      </Link>
      {showFollowButton && !isOwnProfile && (
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
