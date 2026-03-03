import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getPublicProfile } from "@/lib/actions/profile";
import { getFollowStatus } from "@/lib/actions/follows";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileHeader, PublicReviewCard } from "@/components/profile";
import { PublicProfileContent } from "./PublicProfileContent";

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

  // Check if current user is viewing their own profile
  const { userId: clerkId } = await auth();
  let isOwnProfile = false;
  let followStatus = { isFollowing: false, isPending: false };

  if (clerkId) {
    const supabase = createAdminClient();
    const { data: currentUser } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (currentUser) {
      isOwnProfile = currentUser.id === profile.id;
      if (!isOwnProfile) {
        followStatus = await getFollowStatus(profile.id);
      }
    }
  }

  return (
    <PublicProfileContent
      profile={profile}
      isOwnProfile={isOwnProfile}
      isFollowing={followStatus.isFollowing}
      isPending={followStatus.isPending}
    />
  );
}
