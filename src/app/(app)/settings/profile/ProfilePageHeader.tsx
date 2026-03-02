"use client";

import { useT } from "@/lib/i18n";

export function ProfilePageHeader() {
  const t = useT();
  
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-foreground">
        {t("profileSettings")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("customizeProfile")}
      </p>
    </div>
  );
}
