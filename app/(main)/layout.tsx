"use client";

import Navbar from "@/components/navbar";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import "driver.js/dist/driver.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <Navbar />
      {children}
    </OnboardingProvider>
  );
}
