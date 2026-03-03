import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedContent } from "./FeedContent";

export const metadata = {
  title: "Feed - ForkList",
  description: "See what people you follow are eating",
};

export default async function FeedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <FeedContent />;
}
