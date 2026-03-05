import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getPublicProfile } from "@/lib/actions/profile";
import { getFollowStatus } from "@/lib/actions/follows";
import { getPublicListsForUser } from "@/lib/actions/lists";

import { createAdminClient } from "@/lib/supabase/admin";
import { PublicProfileContent } from "./PublicProfileContent";
import { PrivateProfileContent } from "./PrivateProfileContent";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (result.status === "not_found") {
    return {
      title: "Profile Not Found - ForkList",
    };
  }

  if (result.status === "private") {
    return {
      title: `@${result.username} - ForkList`,
      description: "This profile is private",
    };
  }

  const profile = result.profile;
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
  const result = await getPublicProfile(username);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "private") {
    return <PrivateProfileContent username={result.username} />;
  }

  const profile = result.profile;

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

  // Fetch lists - if own profile, include private lists
  const listsResult = await getPublicListsForUser(profile.id, isOwnProfile);
  const lists = "success" in listsResult ? listsResult.lists : [];

  return (
    <PublicProfileContent
      profile={profile}
      isOwnProfile={isOwnProfile}
      isFollowing={followStatus.isFollowing}
      isPending={followStatus.isPending}
      lists={lists}
    />
  );
}
