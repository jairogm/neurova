import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export const metadata: Metadata = {
  title: "Data Processing Agreement | Neurova",
  description: "Data Processing Agreement for Neurova therapy management platform",
};

export default function DPAPage() {
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
        <h1 className="text-4xl font-bold mb-8">Data Processing Agreement</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last Updated: January 02, 2026
        </p>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between Neurova ("Provider", "Processor") and the mental health professional or organization ("Customer", "Controller"). This DPA reflects the parties' agreement with respect to the processing of personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Controller"</strong> means the entity that determines the purposes and means of the processing of Personal Data (you, the Therapist).</li>
              <li><strong>"Processor"</strong> means the entity which processes Personal Data on behalf of the Controller (us, Neurova).</li>
              <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates (your patients).</li>
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Processing of Personal Data</h2>
            <p className="mb-2"><strong>3.1 Roles of the Parties.</strong> The parties acknowledge and agree that with regard to the Processing of Personal Data, Customer is the Controller and Neurova is the Processor.</p>
            <p className="mb-2"><strong>3.2 Customer's Responsibilities.</strong> Customer shall, in its use of the Services, Process Personal Data in accordance with the requirements of Data Protection Laws.</p>
            <p><strong>3.3 Neurova's Responsibilities.</strong> Neurova shall treat Personal Data as Confidential Information and shall only Process Personal Data on behalf of and in accordance with Customer's documented instructions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Security Measures</h2>
            <p>
              Neurova implements and maintains appropriate technical and organizational security measures to protect Personal Data from Security Incidents and to preserve the security and confidentiality of the Personal Data, in accordance with Neurova's security standards described in our Privacy Policy and security documentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subprocessors</h2>
            <p>
              Customer agrees that Neurova may engage Subprocessors to Process Personal Data on Customer's behalf. The Subprocessors currently engaged by Neurova and authorized by Customer include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Clerk</strong> (Identity and Authentication)</li>
              <li><strong>Convex</strong> (Database and Backend Infrastructure)</li>
              <li><strong>Google Cloud Platform</strong> (Infrastructure via Convex)</li>
              <li><strong>Vercel</strong> (Hosting and Deployment)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Subject Rights</h2>
            <p>
              Neurova shall, to the extent legally permitted, promptly notify Customer if Neurova receives a request from a Data Subject to exercise their rights (to access, correct, amend, or delete personal data). Neurova shall provide reasonable assistance to Customer in the fulfillment of Customer's obligation to respond to a Data Subject Request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Term and Termination</h2>
            <p>
              This DPA shall remain in effect for as long as Neurova carries out Personal Data Processing operations on behalf of Customer or until termination of the Neurova Terms of Service.
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
