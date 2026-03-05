import { auth } from "@clerk/nextjs/server";
import { getList } from "@/lib/actions/lists";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ListDetailContent from "./ListDetailContent";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: PageProps) {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const result = await getList(id);

  if ("error" in result) {
    redirect("/lists");
  }

  // Check if current user is the owner
  const supabase = createAdminClient();
  const { data: currentUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  const isOwner = currentUser?.id === result.list.user_id;

  return <ListDetailContent list={result.list} isOwner={isOwner} />;
}
