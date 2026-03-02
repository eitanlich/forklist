import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/actions/profile";
import { ProfileHeader, PublicReviewCard } from "@/components/profile";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return {
      title: "Profile Not Found - ForkList",
    };
  }

  const title = `@${profile.username} - ForkList`;
  const description = profile.bio || `Check out @${profile.username}'s restaurant reviews on ForkList`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      username: profile.username,
      images: profile.avatar_url
        ? [{ url: profile.avatar_url, width: 200, height: 200 }]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
        {/* Header */}
        <ProfileHeader
          username={profile.username}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
          followerCount={profile.follower_count}
          followingCount={profile.following_count}
          reviewCount={profile.reviews.length}
        />

        {/* Divider */}
        <div className="my-6 border-t border-border" />

        {/* Reviews */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-medium text-foreground">
            Reviews
          </h2>

          {profile.reviews.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No reviews yet
            </p>
          ) : (
            <div className="space-y-3">
              {profile.reviews.map((review) => (
                <PublicReviewCard key={review.id} review={review as any} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Powered by ForkList
          </a>
        </div>
      </div>
    </div>
  );
}
