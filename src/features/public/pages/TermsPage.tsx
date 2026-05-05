import { PageContainer } from '@/components/layout';
import { FileText, ShieldCheck, UserX, AlertTriangle, RefreshCw, Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <PageContainer showSidebar={false}>
      {/* Hero */}
      <section className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">Terms &amp; Conditions</h1>
        <p className="text-gray-500 text-sm">Last updated: May 2026</p>
        <p className="text-xl text-gray-600 leading-relaxed mt-4">
          By using AquaTalentz you agree to these terms. Please read them carefully before
          creating an account or using any part of our platform.
        </p>
      </section>

      {/* Sections */}
      <div className="max-w-3xl mx-auto space-y-10">

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using AquaTalentz ("the Platform"), you confirm that you are at
            least 18 years old (or have parental consent) and that you accept these Terms &amp;
            Conditions in full. If you do not agree, you must not use the Platform.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900">2. User Accounts &amp; Responsibilities</h2>
          </div>
          <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
            <li>You are responsible for keeping your login credentials confidential.</li>
            <li>You must provide accurate information when registering.</li>
            <li>You must not impersonate another person or organisation.</li>
            <li>Company accounts require admin approval before posting jobs.</li>
            <li>Student accounts are subject to a free-tier application limit unless upgraded.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900">3. Prohibited Conduct</h2>
          </div>
          <ul className="text-gray-600 leading-relaxed space-y-2 list-disc list-inside">
            <li>Posting false, misleading, or fraudulent job listings.</li>
            <li>Harassing, threatening, or abusing other users.</li>
            <li>Attempting to circumvent our security measures.</li>
            <li>Using the Platform for spam or unsolicited communications.</li>
            <li>Scraping or bulk-extracting data without written consent.</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900">4. Account Suspension &amp; Deletion</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            AquaTalentz reserves the right to suspend or permanently deactivate any account that
            violates these Terms. Users may request deletion of their own account and associated
            data at any time via the Danger Zone section in their profile settings. Deletion
            requests are processed by our support team within 7 business days. Contact{' '}
            <a href="mailto:support@aquatalentz.com" className="text-blue-600 hover:underline">
              support@aquatalentz.com
            </a>{' '}
            for assistance.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900">5. Changes to These Terms</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We may update these Terms from time to time. Continued use of the Platform after
            changes are posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Questions about these terms?</h2>
          <p className="text-gray-500 mb-6">Our team is happy to help.</p>
          <a
            href="mailto:support@aquatalentz.com"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Contact support@aquatalentz.com
          </a>
        </section>

      </div>
    </PageContainer>
  );
}
