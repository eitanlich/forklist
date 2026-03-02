import type { Metadata } from "next";
import SearchContent from "./SearchContent";

export const metadata: Metadata = {
  title: "Search - ForkList",
};

export default function SearchPage() {
  return <SearchContent />;
}
