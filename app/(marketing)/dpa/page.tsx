import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement | Neurova",
  description: "Data Processing Agreement for Neurova therapy management platform",
};

export default function DPAPage() {
  return (
    <main className="marketing-article" lang="en">
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
      </main>
  );
}
