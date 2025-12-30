import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Neurova",
  description: "Terms of Service for Neurova therapy management platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last Updated: December 30, 2024
      </p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Neurova ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>
            Neurova is a therapy management platform that provides tools for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Patient record management</li>
            <li>Appointment scheduling via Google Calendar</li>
            <li>Session tracking and notes</li>
            <li>Payment status management</li>
            <li>Medical history documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <h3 className="text-xl font-medium mb-2">3.1 Account Creation</h3>
          <p>
            You must create an account to use the Service. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">3.2 Account Types</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Therapist Accounts:</strong> For licensed mental health professionals</li>
            <li><strong>Patient Records:</strong> Created and managed by therapists</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
          <h3 className="text-xl font-medium mb-2">4.1 For Therapists</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain valid professional licenses and credentials</li>
            <li>Comply with HIPAA and other applicable regulations</li>
            <li>Ensure accuracy of patient information</li>
            <li>Use the Service in accordance with professional standards</li>
            <li>Protect patient confidentiality</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">4.2 Prohibited Uses</h3>
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Upload malicious code or viruses</li>
            <li>Harass, abuse, or harm others</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our collection and use of data as described in the Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Google Calendar Integration</h2>
          <p>
            When you connect Google Calendar:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You authorize us to create and manage a "Neurova Appointments" calendar</li>
            <li>You grant us permission to create, read, update, and delete events in this calendar</li>
            <li>You can revoke this access at any time through your Google account settings</li>
            <li>We will only access the specific calendar we create, not your other calendars</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Neurova and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Warranties of merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Uninterrupted or error-free operation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEUROVA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Professional Responsibility</h2>
          <p>
            Neurova is a tool to assist with practice management. It does not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide medical or therapeutic advice</li>
            <li>Replace professional judgment</li>
            <li>Guarantee compliance with regulations</li>
            <li>Assume liability for clinical decisions</li>
          </ul>
          <p className="mt-4">
            Therapists remain solely responsible for their professional practice and compliance with applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account at any time, with or without notice, for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violation of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Non-payment of fees (if applicable)</li>
            <li>Any other reason at our sole discretion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <p className="mt-2">
            Email: legal@neurova.app<br />
            Website: https://neurova.app
          </p>
        </section>

        <section className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Note:</strong> These Terms of Service are provided as a template. We recommend having them reviewed by a legal professional familiar with healthcare and technology law in your jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
}
