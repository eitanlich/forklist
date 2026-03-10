import type { Metadata } from "next";
import SearchPageContent from "./SearchPageContent";

export const metadata: Metadata = {
  title: "Search — ForkList",
};

export default function SearchPage() {
  return <SearchPageContent />;
}
