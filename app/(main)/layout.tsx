"use client";

import Navbar from "@/components/navbar";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useTranslations } from "next-intl";
import "driver.js/dist/driver.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");

  return (
    <OnboardingProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sky-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
      >
        {t("skipToContent")}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </OnboardingProvider>
  );
}
