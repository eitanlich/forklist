import { notFound } from "next/navigation";
import { getRestaurantById } from "@/lib/actions/restaurants";
import RestaurantPageContent from "./RestaurantPageContent";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantPageContent restaurant={restaurant} />;
}
