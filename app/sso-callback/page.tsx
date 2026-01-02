"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function SSOCallback() {
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
    {
      title: "Generate Session History",
      description: "Download detailed PDF files of your session notes and complete patient history reviews.",
      image: "/undraw_filing-system.svg"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-[1400px] h-[85vh] mx-auto shadow-2xl border-0 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Column - Loading State */}
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

          <div className="w-full max-w-sm mx-auto space-y-8 text-center flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white dark:bg-slate-950 rounded-full p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Verifying Secure Session</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Please wait while we authenticate your credentials and prepare your workspace...
              </p>
            </div>

            {/* Hidden Clerk Callback Component */}
            <div className="hidden">
              <div id="clerk-captcha" />
              <AuthenticateWithRedirectCallback redirectUrl="/dashboard" />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground pt-8">
            <p>Copyright © {new Date().getFullYear()} Neurova.</p>
            <p className="animate-pulse">Securing connection...</p>
          </div>
        </div>

        {/* Right Column - Tips & Tricks (Identical to Login) */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-primary relative overflow-hidden text-primary-foreground">
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
                  className={`h - 2 rounded - full transition - all duration - 300 ${index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"} `}
                  aria-label={`Go to slide ${index + 1} `}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

