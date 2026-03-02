import type { Metadata } from "next";
import NewListForm from "./NewListForm";

export const metadata: Metadata = {
  title: "New List - ForkList",
};

export default function NewListPage() {
  return <NewListForm />;
}
