"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

export function ProfilePageHeader() {
  const t = useT();
  const router = useRouter();
  
  return (
    <div className="flex items-start gap-4">
      <button
        onClick={() => router.back()}
        className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
        aria-label="Go back"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          {t("profileSettings")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("customizeProfile")}
        </p>
      </div>
    </div>
  );
}
