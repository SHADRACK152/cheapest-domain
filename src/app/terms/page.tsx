import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'CheapestDomains Terms of Service and User Agreement',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container-wide max-w-4xl">
        <h1 className="text-4xl font-bold text-[#111111] mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-400">
            Last Updated: February 15, 2026
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using CheapestDomains (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
              If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">2. Domain Registration Services</h2>
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.1 Registration Process</h3>
            <p>
              When you register a domain through our Service, you enter into a registration agreement with the respective 
              domain registry. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update registration information</li>
              <li>Be responsible for all activities under your domain</li>
              <li>Comply with all applicable domain registry policies</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.2 Domain Ownership</h3>
            <p>
              You retain full ownership of domains registered through our Service. We act solely as a registrar service provider.
              Domain ownership is subject to registry rules and ICANN policies.
            </p>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.3 Registration Period & Renewal</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Domains are registered for periods of 1-10 years</li>
              <li>Renewal notices are sent 30 days before expiration</li>
              <li>You are responsible for renewing your domains</li>
              <li>Expired domains may be deleted and become available for public registration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">3. Pricing and Payment</h2>
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.1 Fees</h3>
            <p>
              Domain registration and renewal fees are listed on our website and are subject to change. 
              Current pricing is displayed during the purchase process. All fees are non-refundable except as required by law.
            </p>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.2 Payment Methods</h3>
            <p>We accept the following payment methods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>M-Pesa (Kenya)</li>
              <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
              <li>Bank Transfer</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.3 Refund Policy</h3>
            <p>
              Domain registrations are generally non-refundable. However, we offer a 5-day grace period for new registrations 
              if the domain has not been used or configured. Contact support@truehost.co.ke within 5 days of registration 
              to request a refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">4. Domain Transfers</h2>
            <p>
              Domain transfers are subject to the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Domains must be unlocked at the current registrar</li>
              <li>Valid authorization (EPP) code required</li>
              <li>Domain must not be within 60 days of initial registration</li>
              <li>Transfers typically complete within 5-7 days</li>
              <li>Transfer includes +1 year extension</li>
              <li>Original expiration time is preserved and extended</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">5. Acceptable Use Policy</h2>
            <p>You agree not to use domains registered through our Service for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Illegal activities or content</li>
              <li>Spam, phishing, or malware distribution</li>
              <li>Trademark or copyright infringement</li>
              <li>Fraudulent or deceptive practices</li>
              <li>Hate speech, harassment, or discriminatory content</li>
              <li>Child exploitation or illegal adult content</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate domains that violate this policy without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">6. WHOIS and Privacy Protection</h2>
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">6.1 WHOIS Data</h3>
            <p>
              Domain registration requires providing contact information that may be publicly available in WHOIS databases, 
              as required by ICANN policies and registry requirements.
            </p>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">6.2 WHOIS Privacy Protection</h3>
            <p>
              We offer optional WHOIS privacy protection ($9.99/year) that replaces your personal information with proxy details. 
              Note: Some domain extensions do not support privacy protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">7. Service Availability</h2>
            <p>
              While we strive for 99.9% uptime, we do not guarantee uninterrupted service. We are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service interruptions or downtime</li>
              <li>Registry or third-party system failures</li>
              <li>Network connectivity issues</li>
              <li>Scheduled maintenance periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, CheapestDomains and TrueHost Kenya shall not be liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages exceeding the amount paid for the specific service</li>
              <li>Issues arising from registry or third-party actions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">9. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">9.1 Domain Disputes</h3>
            <p>
              Domain name disputes are subject to ICANN&apos;s Uniform Domain Name Dispute Resolution Policy (UDRP) and applicable 
              registry dispute policies.
            </p>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">9.2 General Disputes</h3>
            <p>
              Any disputes arising from these Terms shall be governed by the laws of Kenya. For commercial disputes, 
              parties agree to first attempt resolution through good-faith negotiation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">10. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Fail to pay outstanding fees</li>
              <li>Provide false or misleading information</li>
            </ul>
            <p className="mt-4">
              Upon termination, you remain responsible for all outstanding fees. Domain registrations remain valid 
              through their registration period but may not be renewed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on this page with an 
              updated revision date. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">12. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mt-4">
              <p className="font-semibold text-[#111111]">CheapestDomains Support</p>
              <p>Email: support@truehost.co.ke</p>
              <p>Phone: +254 20 528 0000</p>
              <p>Location: Nairobi, Kenya</p>
              <p className="mt-2">Available 24/7</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">13. Acknowledgment</h2>
            <p>
              By using CheapestDomains, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and our Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
