import { auth } from "@clerk/nextjs/server";
import { getList } from "@/lib/actions/lists";
import { redirect } from "next/navigation";
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

  return <ListDetailContent list={result.list} />;
}
