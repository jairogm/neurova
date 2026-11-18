import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Associate Agreement | Neurova",
  description: "Business Associate Agreement for Neurova therapy management platform",
};

export default function BAAPage() {
  return (
    <main className="marketing-article" lang="en">
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
      </main>
  );
}
