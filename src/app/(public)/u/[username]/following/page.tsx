import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfile } from "@/lib/actions/profile";
import { FollowingContent } from "./FollowingContent";

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
    title: `@${profile.username} is Following - ForkList`,
    description: `See who @${profile.username} follows on ForkList`,
  };
}

export default async function FollowingPage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  return <FollowingContent userId={profile.id} username={profile.username!} />;
}
