import { I18nProvider } from "@/lib/i18n/context";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="min-h-dvh bg-background">
        {children}
      </div>
    </I18nProvider>
  );
}
