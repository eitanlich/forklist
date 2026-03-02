import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserProfile } from "@/lib/actions/profile";
import { ProfileSettingsContent } from "./ProfileSettingsContent";

export const metadata = {
  title: "Profile Settings - ForkList",
  description: "Manage your ForkList profile",
};

export default async function ProfileSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your public profile
        </p>
      </div>

      <ProfileSettingsContent
        username={profile?.username ?? null}
        bio={profile?.bio ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        isPrivate={profile?.is_private ?? false}
      />
    </div>
  );
}
