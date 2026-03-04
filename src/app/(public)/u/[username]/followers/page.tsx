import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/actions/profile";
import { FollowersContent } from "./FollowersContent";

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
    title: `@${result.profile.username}'s Followers - ForkList`,
    description: `See who follows @${result.profile.username} on ForkList`,
  };
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "private") {
    redirect(`/u/${result.username}`);
  }

  const profile = result.profile;
  return <FollowersContent userId={profile.id} username={profile.username!} />;
}
