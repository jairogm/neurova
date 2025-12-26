"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Users,
  Shield,
  Heart,
  Clock,
  CheckCircle,
  Brain,
  Stethoscope,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <Image
                  src="/neurova_logo.png"
                  alt="NEUROVA"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                NEUROVA
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 via-background to-sky-50/30 dark:from-slate-900/50 dark:via-background dark:to-slate-800/30">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Mental Health Care
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The comprehensive platform designed specifically for mental
                health professionals to manage patients, appointments, and
                provide exceptional care.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                >
                  Start Your Practice
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Watch Demo
              </Button>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative mt-16">
              <div className="bg-secondary/20 rounded-3xl p-8 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 border-0 shadow-lg bg-card backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="w-8 h-8 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        Smart Scheduling
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Integrated calendar management with Google Calendar sync
                    </p>
                  </Card>
                  <Card className="p-6 border-0 shadow-lg bg-card backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-8 h-8 text-sky-600" />
                      <h3 className="font-semibold text-foreground">
                        Patient Management
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive patient profiles and medical history
                      tracking
                    </p>
                  </Card>
                  <Card className="p-6 border-0 shadow-lg bg-card backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                      <h3 className="font-semibold text-foreground">
                        Secure & Private
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Bank-level security with GDPR compliance and data
                      encryption
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built by therapists, for therapists. NEUROVA streamlines your
              practice so you can focus on what matters most - your patients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Intelligent Notes
                </h3>
                <p className="text-muted-foreground">
                  Rich text editor for session notes with smart templates and
                  search functionality.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Appointment Scheduling
                </h3>
                <p className="text-muted-foreground">
                  Seamless Google Calendar integration with automated reminders
                  and recurring sessions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Medical History
                </h3>
                <p className="text-muted-foreground">
                  Comprehensive patient profiles with detailed medical history
                  and emergency contacts.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Session Tracking
                </h3>
                <p className="text-muted-foreground">
                  Track session progress, goals, and outcomes with detailed
                  analytics and reporting.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Care Coordination
                </h3>
                <p className="text-muted-foreground">
                  Collaborate with other healthcare providers and manage patient
                  referrals effectively.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-card">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Data Security
                </h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with encrypted data storage and
                  secure authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Why Mental Health Professionals Choose NEUROVA
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join hundreds of therapists who have transformed their
                  practice with our comprehensive platform.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Save Time</h3>
                    <p className="text-muted-foreground">
                      Reduce administrative work by 60% with automated
                      scheduling and streamlined workflows.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Improve Care
                    </h3>
                    <p className="text-muted-foreground">
                      Better patient outcomes through organized records and
                      comprehensive tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Stay Organized
                    </h3>
                    <p className="text-muted-foreground">
                      Everything in one place - patient records, appointments,
                      and notes all synchronized.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Peace of Mind
                    </h3>
                    <p className="text-muted-foreground">
                      GDPR compliant with bank-level security and automatic
                      backups.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-3xl p-8 border border-border">
              <div className="bg-card rounded-2xl p-8 shadow-xl">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <blockquote className="text-lg text-muted-foreground italic">
                    &quot;NEUROVA has completely transformed how I manage my
                    practice. I can focus on my patients instead of paperwork.&quot;
                  </blockquote>
                  <div>
                    <p className="font-semibold text-foreground">
                      Dr. Sarah Johnson
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Licensed Clinical Psychologist
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Join mental health professionals who trust NEUROVA to manage their
              practice efficiently and securely.
            </p>
            <div className="flex justify-center">
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
                >
                  Start Free Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                  <Image
                    src="/neurova_logo.png"
                    alt="NEUROVA"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <span className="text-lg font-bold">NEUROVA</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Empowering mental health professionals with comprehensive
                practice management tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Updates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Training
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    GDPR Compliance
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Data Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 NEUROVA. All rights reserved. | Designed for mental health
              professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
