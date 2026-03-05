import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { getPendingRequestCount } from "@/lib/actions/follows";
import { ProfileSettingsContent } from "./ProfileSettingsContent";
import { ProfilePageHeader } from "./ProfilePageHeader";

export const metadata = {
  title: "Profile Settings - ForkList",
  description: "Manage your ForkList profile",
};

export default async function ProfileSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile, pendingRequestCount] = await Promise.all([
    getCurrentUserProfile(),
    getPendingRequestCount(),
  ]);

  return (
    <div className="space-y-8">
      <ProfilePageHeader />

      <ProfileSettingsContent
        username={profile?.username ?? null}
        bio={profile?.bio ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        isPrivate={profile?.is_private ?? false}
        pendingRequestCount={pendingRequestCount}
      />
    </div>
  );
}
