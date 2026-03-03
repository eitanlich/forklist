import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/actions/profile";
import { FollowersContent } from "./FollowersContent";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    return { title: "Profile Not Found - ForkList" };
  }

  return {
    title: `@${profile.username}'s Followers - ForkList`,
    description: `See who follows @${profile.username} on ForkList`,
  };
}

export default async function FollowersPage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  return <FollowersContent userId={profile.id} username={profile.username!} />;
}
