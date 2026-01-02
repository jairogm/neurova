"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Info } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export function CustomSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems = [
    {
      title: "Manage your time effortlessly",
      description: "Sync your calendar and never miss an appointment with our smart scheduling tools.",
      image: "/undraw_time-management.svg"
    },

    {
      title: "Track Session Notes & History",
      description: "Effortlessly document session notes and access comprehensive patient medical history.",
      image: "/undraw_personal-information.svg"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  if (!isLoaded) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Error signing in with Google", err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[1400px] h-[85vh] mx-auto shadow-2xl border-0 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden grid md:grid-cols-2">

      {/* Left Column - Login Form */}
      <div className="p-8 md:p-12 flex flex-col justify-between relative z-10 h-full">
        <div className="flex justify-start items-center gap-3">
          <Image
            src="/neurova_logo.png"
            alt="Neurova Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="text-2xl text-sky-600 font-bold tracking-tight">NEUROVA</span>
        </div>

        {/* Main Content - Form */}
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your details to access your account.
            </p>
          </div>

          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full h-12 relative overflow-hidden transition-all hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-base"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 relative overflow-hidden transition-all border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed group text-base"
              disabled
            >
              <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="microsoft" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="currentColor" d="M0 32h214.6v214.6H0V32zm233.4 0H448v214.6H233.4V32zM0 265.4h214.6V480H0V265.4zm233.4 0H448V480H233.4V265.4z"></path>
              </svg>
              Continue with Outlook
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] font-medium pointer-events-none">
                Coming Soon
              </Badge>
            </Button>

            <div className="pt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1.5 h-auto py-2">
                    <Info className="h-3.5 w-3.5" />
                    Why do we use Google?
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 text-sm bg-white/95 backdrop-blur-md dark:bg-slate-950/95" side="bottom">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Google Integration</h4>
                    <p className="text-muted-foreground">
                      We use your Google account to securely connect with Google Calendar, allowing you to manage appointments and events directly within Neurova.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-8">
          <p>Copyright © 2025 Neurova.</p>
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
        </div>
      </div>

      {/* Right Column - Tips & Tricks */}
      <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary relative overflow-hidden text-primary-foreground">
        {/* Background Gradients/Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-500 dark:from-primary dark:to-blue-900" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

        <div className="relative z-10 w-full max-w-md space-y-8 flex flex-col items-center text-center">

          <div className="relative w-64 h-64 md:w-80 md:h-80 animate-in fade-in zoom-in duration-700">
            <Image
              src={carouselItems[activeIndex].image}
              alt={carouselItems[activeIndex].title}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              key={activeIndex}
            />
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <h3 className="text-2xl font-bold leading-tight transition-all duration-500 ease-in-out text-white">
              {carouselItems[activeIndex].title}
            </h3>
            <p className="text-blue-100 text-lg transition-all duration-500 ease-in-out">
              {carouselItems[activeIndex].description}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
