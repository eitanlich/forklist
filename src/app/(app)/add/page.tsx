import type { Metadata } from "next";
import AddWizard from "@/components/add/AddWizard";

export const metadata: Metadata = {
  title: "Log a Visit — ForkList",
};

export default function AddPage() {
  return <AddWizard />;
}
