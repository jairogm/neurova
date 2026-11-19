"use client";

import { useWorkspaceText } from "@/hooks/useWorkspaceText";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";

export function CookieBanner() {
  const tr = useWorkspaceText();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged cookies
    const hasAcknowledged = localStorage.getItem("cookie_consent");
    if (!hasAcknowledged) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 [color-scheme:light] bg-white text-slate-800 border-t border-gray-200 p-4 shadow-lg animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          <p>
            {tr("We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By continuing to visit this site you agree to our use of cookies.")}
            <Link href="/privacy" className="font-semibold text-[#096f89] hover:underline ml-1">
              {tr("Learn more")}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:bg-white dark:border-slate-300 dark:hover:bg-slate-100" onClick={handleAccept}>
            {tr("Decline")}
          </Button>
          <Button className="bg-[#096f89] text-white hover:bg-[#075970]" size="sm" onClick={handleAccept}>
            {tr("Accept All")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={tr("Dismiss")} className="h-8 w-8 ml-2 sm:hidden hover:bg-slate-100 hover:text-slate-900"
            onClick={handleAccept}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
