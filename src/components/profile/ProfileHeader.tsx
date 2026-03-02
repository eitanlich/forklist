import { User } from "lucide-react";

interface ProfileHeaderProps {
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  reviewCount: number;
}

export function ProfileHeader({
  username,
  bio,
  avatarUrl,
  followerCount,
  followingCount,
  reviewCount,
}: ProfileHeaderProps) {
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

      {/* Stats */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{reviewCount}</p>
          <p className="text-xs text-muted-foreground">Reviews</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{followerCount}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{followingCount}</p>
          <p className="text-xs text-muted-foreground">Following</p>
        </div>
      </div>
    </div>
  );
}
