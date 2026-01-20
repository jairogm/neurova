"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter } from "next/navigation";
import { 
  dashboardTourSteps, 
  patientsTourSteps, 
  trashTourSteps,
  recordsTourSteps,
  driverConfig 
} from "@/lib/tutorial-config";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export function useTutorial() {
  const router = useRouter();
  const driverRef = useRef<Driver | null>(null);
  const {
    tutorialCompleted,
    isLoading,
    completeTutorial,
    resetTutorial,
    currentTourPage,
    setCurrentTourPage,
    shouldShowTutorial,
    dismissTutorialForSession,
  } = useOnboarding();

  // Cleanup driver on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  const startDashboardTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    setCurrentTourPage("dashboard");

    const driverObj = driver({
      ...driverConfig,
      steps: dashboardTourSteps,
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          if (confirm("Are you sure you want to skip the tutorial?")) {
            dismissTutorialForSession();
            driverObj.destroy();
          }
        } else {
          driverObj.destroy();
        }
      },
      onNextClick: (element, step, opts) => {
        if (opts.state.activeIndex === dashboardTourSteps.length - 1) {
          driverObj.destroy();
          router.push("/patients");
        } else {
          driverObj.moveNext();
        }
      },
    });

    driverRef.current = driverObj;
    setTimeout(() => driverObj.drive(), 500);
  }, [router, setCurrentTourPage, dismissTutorialForSession]);

  const startPatientsTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    setCurrentTourPage("patients");

    const driverObj = driver({
      ...driverConfig,
      steps: patientsTourSteps,
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          if (confirm("Are you sure you want to skip the tutorial?")) {
            dismissTutorialForSession();
            driverObj.destroy();
          }
        } else {
          driverObj.destroy();
        }
      },
      onNextClick: (element, step, opts) => {
        // Last step points to trash
        if (opts.state.activeIndex === patientsTourSteps.length - 1) {
          driverObj.destroy();
          router.push("/trash");
        } else {
          driverObj.moveNext();
        }
      },
    });

    driverRef.current = driverObj;
    setTimeout(() => driverObj.drive(), 500);
  }, [router, setCurrentTourPage, dismissTutorialForSession]);

  const startTrashTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    setCurrentTourPage("trash");

    const driverObj = driver({
      ...driverConfig,
      steps: trashTourSteps,
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          if (confirm("Are you sure you want to skip the tutorial?")) {
            dismissTutorialForSession();
            driverObj.destroy();
          }
        } else {
          driverObj.destroy();
        }
      },
      onNextClick: (element, step, opts) => {
        // Last step navigates to a sample records page
        if (opts.state.activeIndex === trashTourSteps.length - 1) {
          driverObj.destroy();
          // Navigate to patients, where we'll instruct user to click on records
          router.push("/patients");
          // Set a flag to indicate we need to show records tour
          setCurrentTourPage("pre-records");
        } else {
          driverObj.moveNext();
        }
      },
    });

    driverRef.current = driverObj;
    setTimeout(() => driverObj.drive(), 500);
  }, [router, setCurrentTourPage, dismissTutorialForSession]);

  const startRecordsTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    setCurrentTourPage("records");

    const driverObj = driver({
      ...driverConfig,
      steps: recordsTourSteps,
      onDestroyStarted: () => {
        if (driverObj.hasNextStep()) {
          if (confirm("Are you sure you want to skip the tutorial?")) {
            dismissTutorialForSession();
            driverObj.destroy();
          }
        } else {
          // Tour completed!
          completeTutorial();
          driverObj.destroy();
        }
      },
    });

    driverRef.current = driverObj;
    setTimeout(() => driverObj.drive(), 500);
  }, [setCurrentTourPage, dismissTutorialForSession, completeTutorial]);

  const skipTutorial = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
    dismissTutorialForSession();
  }, [dismissTutorialForSession]);

  const replayTutorial = useCallback(async () => {
    await resetTutorial();
    router.push("/dashboard");
  }, [resetTutorial, router]);

  return {
    startDashboardTour,
    startPatientsTour,
    startTrashTour,
    startRecordsTour,
    skipTutorial,
    replayTutorial,
    tutorialCompleted,
    isLoading,
    shouldShowTutorial,
    currentTourPage,
  };
}
