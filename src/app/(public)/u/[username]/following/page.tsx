import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/actions/profile";
import { getCurrentUserId } from "@/lib/actions/user";
import { FollowingContent } from "./FollowingContent";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (result.status !== "public") {
    return { title: "Profile Not Found - ForkList" };
  }

  return {
    title: `@${result.profile.username} is Following - ForkList`,
    description: `See who @${result.profile.username} follows on ForkList`,
  };
}

export default async function FollowingPage({ params }: Props) {
  const { username } = await params;
  const currentUserId = await getCurrentUserId();
  const result = await getPublicProfile(username, currentUserId);

  if (result.status === "not_found") {
    notFound();
  }

  // If private and NOT the owner/approved follower, redirect
  if (result.status === "private") {
    redirect(`/u/${result.username}`);
  }

  const profile = result.profile;
  const isOwnProfile = currentUserId === profile.id;
  
  return (
    <FollowingContent 
      userId={profile.id} 
      username={profile.username!}
      isOwnProfile={isOwnProfile}
    />
  );
}
