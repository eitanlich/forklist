"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { FollowButton } from "@/components/social/FollowButton";
import { getFollowCounts } from "@/lib/actions/follows";
import { useT } from "@/lib/i18n";

interface ProfileHeaderProps {
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  reviewCount: number;
  userId?: string;
  isFollowing?: boolean;
  isPending?: boolean;
  isOwnProfile?: boolean;
}

export function ProfileHeader({
  username,
  bio,
  avatarUrl,
  followerCount: initialFollowerCount,
  followingCount: initialFollowingCount,
  reviewCount,
  userId,
  isFollowing = false,
  isPending = false,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  const t = useT();
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);

  // Load fresh counts on client
  useEffect(() => {
    if (userId) {
      getFollowCounts(userId).then((counts) => {
        setFollowerCount(counts.followers);
        setFollowingCount(counts.following);
      });
    }
  }, [userId]);

  return (
    <div className="flex flex-col items-center space-y-4 pb-6">
      {/* Avatar */}
      <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary ring-2 ring-primary/20">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${username}'s avatar`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Username */}
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          @{username}
        </h1>
        {bio && (
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{bio}</p>
        )}
      </div>

      {/* Follow Button */}
      {userId && !isOwnProfile && (
        <FollowButton
          targetUserId={userId}
          initialIsFollowing={isFollowing}
          initialIsPending={isPending}
        />
      )}

      {/* Stats */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{reviewCount}</p>
          <p className="text-xs text-muted-foreground">{t("reviews")}</p>
        </div>
        <Link href={`/u/${username}/followers`} className="text-center hover:opacity-70 transition-opacity">
          <p className="text-lg font-semibold text-foreground">{followerCount}</p>
          <p className="text-xs text-muted-foreground">{t("followers")}</p>
        </Link>
        <Link href={`/u/${username}/following`} className="text-center hover:opacity-70 transition-opacity">
          <p className="text-lg font-semibold text-foreground">{followingCount}</p>
          <p className="text-xs text-muted-foreground">{t("followingCount")}</p>
        </Link>
      </div>
    </div>
  );
}
