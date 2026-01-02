import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Business Associate Agreement | Neurova",
  description: "Business Associate Agreement for Neurova therapy management platform",
};

export default function BAAPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
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
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8">Business Associate Agreement</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: January 02, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              This Business Associate Agreement ("BAA") is entered into between you ("Covered Entity") and Neurova ("Business Associate"). This agreement is required by the Health Insurance Portability and Accountability Act of 1996 ("HIPAA") and its implementing regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <p>
              Terms used, but not otherwise defined, in this Agreement shall have the same meaning as those terms in the HIPAA Rules.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Business Associate</strong>: Neurova.</li>
              <li><strong>Covered Entity</strong>: You, the healthcare provider or organization.</li>
              <li><strong>Protected Health Information (PHI)</strong>: Individually identifiable health information created, received, maintained, or transmitted by Business Associate on behalf of Covered Entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Obligations of Business Associate</h2>
            <p>Neurova agrees to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Not use or disclose PHI other than as permitted or required by the Agreement or as required by law.</li>
              <li>Use appropriate safeguards to prevent use or disclosure of PHI other than as provided for by this Agreement.</li>
              <li>Report to Covered Entity any use or disclosure of PHI not provided for by this Agreement of which it becomes aware, including breaches of unsecured PHI.</li>
              <li>Ensure that any subcontractors that create, receive, maintain, or transmit PHI on behalf of the Business Associate agree to the same restrictions and conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Permitted Uses and Disclosures</h2>
            <p>
              Neurova may use or disclose PHI as necessary to perform the services set forth in the Service Agreement (Terms of Service), provided that such use or disclosure would not violate HIPAA if done by the Covered Entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Term and Termination</h2>
            <p>
              This Agreement shall terminate when all PHI provided by Covered Entity to Business Associate is destroyed or returned to Covered Entity, or, if it is infeasible to return or destroy PHI, protections are extended to such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptance</h2>
            <p>
              By using the Neurova platform and agreeing to our Terms of Service, you acknowledge and agree to the terms of this Business Associate Agreement.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12 mt-20">
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
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/patients" className="hover:text-white">
                    Patients
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="mailto:support@neurova.app" className="hover:text-white">
                    support@neurova.app
                  </a>
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
                  <Link href="/dpa" className="hover:text-white">
                    Data Processing Agreement
                  </Link>
                </li>
                <li>
                  <Link href="/baa" className="hover:text-white">
                    BAA
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} NEUROVA. All rights reserved. | Designed for mental health
              professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
