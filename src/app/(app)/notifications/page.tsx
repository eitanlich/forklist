import type { Metadata } from "next";
import { getCurrentUserId, getCurrentUser } from "@/lib/actions/user";
import { getPendingRequestCount } from "@/lib/actions/follows";
import { NotificationsContent } from "./NotificationsContent";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Notifications - ForkList",
  description: "Your notifications and follow requests",
};

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getCurrentUser();
  const isPrivate = user?.is_private ?? false;
  
  const requestsCount = isPrivate ? await getPendingRequestCount() : 0;

  return <NotificationsContent isPrivate={isPrivate} initialRequestsCount={requestsCount} />;
}
