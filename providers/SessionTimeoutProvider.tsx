"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SessionTimeoutContextType {
  resetTimer: () => void;
  extendSession: () => void;
  getRemainingTime: () => number;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | null>(null);

export const useSessionTimeout = () => {
  const context = useContext(SessionTimeoutContext);
  if (!context) {
    throw new Error("useSessionTimeout must be used within SessionTimeoutProvider");
  }
  return context;
};

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number; // Total session timeout in minutes
  warningMinutes?: number; // Show warning X minutes before timeout
}

export function SessionTimeoutProvider({
  children,
  timeoutMinutes = 25, // 25 minutes total session
  warningMinutes = 2   // 2 minute warning (must be less than timeoutMinutes)
}: SessionTimeoutProviderProps) {
  const router = useRouter();
  const { isSignedIn, signOut } = useAuth();

  // State management
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Refs for timers
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Convert minutes to milliseconds
  const TIMEOUT_MS = timeoutMinutes * 60 * 1000;
  const WARNING_MS = (timeoutMinutes - warningMinutes) * 60 * 1000;

  // Events that reset the inactivity timer
  const ACTIVITY_EVENTS = [
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  // Clear all timers
  const clearAllTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Handle logout
  const handleLogout = async () => {
    clearAllTimers();
    setShowWarning(false);

    try {
      await signOut();

      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();

      // Show logout message
      toast.info("Session expired for security. Please sign in again.", {
        duration: 5000,
        position: "top-center"
      });

      // Redirect to sign-in
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect even if logout fails
      router.push("/sign-in");
    }
  };

  // Start countdown in warning dialog
  const startCountdown = () => {
    const warningDurationMs = warningMinutes * 60 * 1000;
    let timeLeft = warningDurationMs;

    setRemainingTime(Math.floor(timeLeft / 1000));

    countdownRef.current = setInterval(() => {
      timeLeft -= 1000;
      setRemainingTime(Math.floor(timeLeft / 1000));

      if (timeLeft <= 0) {
        clearInterval(countdownRef.current!);
        handleLogout();
      }
    }, 1000);
  };

  // Reset inactivity timer
  const resetTimer = () => {
    if (!isSignedIn) return;

    lastActivityRef.current = Date.now();
    clearAllTimers();
    setShowWarning(false);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      console.log("Showing warning dialog");
      setShowWarning(true);
      startCountdown();
    }, WARNING_MS);

    // Set logout timer (backup in case warning is dismissed)
    timeoutRef.current = setTimeout(() => {
      console.log("Auto logout triggered");
      handleLogout();
    }, TIMEOUT_MS);
  };

  // Extend session (reset timer and close warning)
  const extendSession = () => {
    setShowWarning(false);
    clearAllTimers();
    resetTimer();
    toast.success("Session extended successfully", {
      duration: 2000
    });
  };

  // Get remaining time in seconds
  const getRemainingTime = () => {
    if (!isSignedIn) return 0;
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = Math.max(0, TIMEOUT_MS - elapsed);
    return Math.floor(remaining / 1000);
  };

  // Handle activity events
  const handleActivity = (event: Event) => {
    // If warning dialog is showing, ignore ALL activity
    if (showWarning) {
      return;
    }

    // Only reset timer if signed in and NOT showing warning dialog
    if (isSignedIn) {
      resetTimer();
    }
  };

  // Set up activity listeners and handle auth state
  useEffect(() => {
    if (!isSignedIn) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(eventName => {
      document.addEventListener(eventName, handleActivity, true);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach(eventName => {
        document.removeEventListener(eventName, handleActivity, true);
      });
      clearAllTimers();
    };
  }, [isSignedIn]);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const contextValue: SessionTimeoutContextType = {
    resetTimer,
    extendSession,
    getRemainingTime
  };

  return (
    <SessionTimeoutContext.Provider value={contextValue}>
      {children}

      {/* Session Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <svg
                className="h-5 w-5 text-amber-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              Session Expiring Soon
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Your session will expire in <strong className="text-amber-600 dark:text-amber-400">
                  {formatTime(remainingTime)}
                </strong> for security purposes.
              </p>
              <p className="text-sm text-muted-foreground">
                This helps protect sensitive patient information when devices are left unattended.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              Sign Out Now
            </Button>
            <Button
              onClick={extendSession}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Extend Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SessionTimeoutContext.Provider>
  );
}