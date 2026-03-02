import { auth } from "@clerk/nextjs/server";
import { getLists } from "@/lib/actions/lists";
import ListsContent from "./ListsContent";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const { userId: clerkId } = await auth();
  
  if (!clerkId) {
    return <ListsContent lists={[]} />;
  }

  const result = await getLists();
  const lists = "success" in result && result.success ? result.lists : [];

  return <ListsContent lists={lists} />;
}
