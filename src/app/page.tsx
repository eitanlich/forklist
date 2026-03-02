import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { I18nProvider } from "@/lib/i18n/context";
import {
  Navbar,
  Hero,
  Features,
  AppPreview,
  SocialProof,
  FinalCTA,
  Footer,
} from "@/components/landing";

export default async function RootPage() {
  const { userId } = await auth();

  // If user is authenticated, redirect to the app home
  if (userId) {
    redirect("/home");
  }

  // Otherwise, show the landing page
  return (
    <I18nProvider>
      <main className="bg-background text-foreground">
        <Navbar />
        <Hero />
        <Features />
        <AppPreview />
        <SocialProof />
        <FinalCTA />
        <Footer />
      </main>
    </I18nProvider>
  );
}
