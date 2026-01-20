"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type TourPage = "dashboard" | "patients" | "trash" | "records" | "pre-records" | null;

interface OnboardingContextType {
  tutorialCompleted: boolean;
  isLoading: boolean;
  completeTutorial: () => Promise<void>;
  resetTutorial: () => Promise<void>;
  currentTourPage: TourPage;
  setCurrentTourPage: (page: TourPage) => void;
  shouldShowTutorial: boolean;
  dismissTutorialForSession: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const tutorialStatus = useQuery(api.onboarding.getTutorialStatus);
  const completeTutorialMutation = useMutation(api.onboarding.completeTutorial);
  const resetTutorialMutation = useMutation(api.onboarding.resetTutorial);

  const [currentTourPage, setCurrentTourPage] = useState<TourPage>(null);
  const [dismissedForSession, setDismissedForSession] = useState(false);

  const isLoading = tutorialStatus === undefined;
  const tutorialCompleted = tutorialStatus?.completed ?? false;

  // Show tutorial if not completed and not dismissed for this session
  const shouldShowTutorial = !isLoading && !tutorialCompleted && !dismissedForSession;

  const completeTutorial = useCallback(async () => {
    await completeTutorialMutation();
    setCurrentTourPage(null);
  }, [completeTutorialMutation]);

  const resetTutorial = useCallback(async () => {
    await resetTutorialMutation();
    setDismissedForSession(false);
  }, [resetTutorialMutation]);

  const dismissTutorialForSession = useCallback(() => {
    setDismissedForSession(true);
    setCurrentTourPage(null);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        tutorialCompleted,
        isLoading,
        completeTutorial,
        resetTutorial,
        currentTourPage,
        setCurrentTourPage,
        shouldShowTutorial,
        dismissTutorialForSession,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
