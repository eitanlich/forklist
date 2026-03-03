import type { Metadata } from "next";
import { ExploreContent } from "./ExploreContent";

export const metadata: Metadata = {
  title: "Explore - ForkList",
  description: "Discover foodies and trending reviews on ForkList",
};

export default function ExplorePage() {
  return <ExploreContent />;
}
