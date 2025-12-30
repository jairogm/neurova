import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Neurova",
  description: "Privacy Policy for Neurova therapy management platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last Updated: December 30, 2024
      </p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Neurova ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our therapy management platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Professional credentials (for therapists)</li>
            <li>Date of birth and gender</li>
            <li>Emergency contact information</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">2.2 Health Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Medical history notes</li>
            <li>Therapy session records</li>
            <li>Appointment scheduling information</li>
          </ul>

          <h3 className="text-xl font-medium mb-2 mt-4">2.3 Technical Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our therapy management services</li>
            <li>To schedule and manage therapy appointments</li>
            <li>To facilitate communication between therapists and patients</li>
            <li>To send appointment reminders and notifications</li>
            <li>To improve our services and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
          <p>
            We use industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Data is encrypted in transit using SSL/TLS</li>
            <li>Data is stored securely using Convex and Clerk</li>
            <li>Access to data is restricted to authorized personnel only</li>
            <li>Regular security audits and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Clerk:</strong> Authentication and user management</li>
            <li><strong>Convex:</strong> Database and backend services</li>
            <li><strong>Google Calendar:</strong> Appointment scheduling and management</li>
            <li><strong>Sentry:</strong> Error tracking and monitoring</li>
          </ul>
          <p className="mt-4">
            These services have their own privacy policies and we encourage you to review them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Google Calendar Integration</h2>
          <p>
            When you connect your Google Calendar, we:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create a dedicated "Neurova Appointments" calendar</li>
            <li>Only access events within this specific calendar</li>
            <li>Do not access your other calendars or Google services</li>
            <li>Use OAuth tokens securely managed by Clerk</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Export your data</li>
            <li>Opt-out of communications</li>
            <li>Disconnect third-party services (like Google Calendar)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. You may request deletion of your account and data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. HIPAA Compliance</h2>
          <p>
            While we implement security measures to protect health information, therapists using Neurova are responsible for ensuring their own HIPAA compliance. We recommend:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Using secure, encrypted connections</li>
            <li>Not storing highly sensitive PHI in session notes</li>
            <li>Following your organization's HIPAA policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mt-2">
            Email: privacy@neurova.app<br />
            Website: https://neurova.app
          </p>
        </section>
      </div>
    </div>
  );
}
