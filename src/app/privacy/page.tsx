import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'CheapestDomains Privacy Policy - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container-wide max-w-4xl">
        <h1 className="text-4xl font-bold text-[#111111] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-400">
            Last Updated: February 15, 2026
          </p>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">1. Introduction</h2>
            <p>
              CheapestDomains, operated by TrueHost Kenya, is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our domain registration 
              and management services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.1 Personal Information</h3>
            <p>When you register an account or domain, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, physical address</li>
              <li><strong>Account Information:</strong> Username, password (encrypted), account preferences</li>
              <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through payment providers)</li>
              <li><strong>Domain Registration Data:</strong> Administrative, technical, and billing contact information required by ICANN</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, time spent</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              <li><strong>Chat Logs:</strong> Conversations with Kaya (our AI assistant) for improving service quality</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">2.3 Third-Party Information</h3>
            <p>
              We may receive information from domain registries, payment processors (M-Pesa, PayPal, card processors), 
              and fraud prevention services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.1 Service Delivery</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processing domain registrations, renewals, and transfers</li>
              <li>Managing your account and providing customer support</li>
              <li>Sending service notifications and renewal reminders</li>
              <li>Complying with ICANN and registry requirements</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.2 Communication</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Responding to inquiries and support requests</li>
              <li>Sending important updates about our services</li>
              <li>Marketing communications (with your consent - you can opt out anytime)</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">3.3 Improvement & Analytics</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyzing usage patterns to improve our platform</li>
              <li>Training and improving Kaya AI assistant</li>
              <li>Detecting and preventing fraud</li>
              <li>Ensuring security and platform integrity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">4. WHOIS Data & Public Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">4.1 WHOIS Requirements</h3>
            <p>
              ICANN requires that certain domain registration information be publicly available in WHOIS databases, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Registrant name and organization</li>
              <li>Registrant contact information</li>
              <li>Domain creation and expiration dates</li>
              <li>Nameserver information</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">4.2 WHOIS Privacy Protection</h3>
            <p>
              We offer optional WHOIS privacy protection ($9.99/year) that replaces your personal information with 
              our proxy service details while still maintaining contact capability through forwarding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">5. Information Sharing & Disclosure</h2>
            <p>We share your information with:</p>
            
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">5.1 Required Disclosures</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Domain Registries:</strong> Required registration data for domain management</li>
              <li><strong>ICANN:</strong> Compliance with domain registration policies</li>
              <li><strong>Law Enforcement:</strong> When required by law or legal process</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">5.2 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Processors:</strong> M-Pesa, PayPal, Stripe (for payment processing)</li>
              <li><strong>Cloud Services:</strong> Hosting and infrastructure providers</li>
              <li><strong>Analytics:</strong> Usage analytics and monitoring services</li>
              <li><strong>AI Services:</strong> Groq/OpenAI for Kaya chatbot functionality</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">5.3 We Never Sell Your Data</h3>
            <p>
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">6. Data Security</h2>
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> SSL/TLS encryption for all data transmission</li>
              <li><strong>Secure Storage:</strong> Encrypted databases with access controls</li>
              <li><strong>Authentication:</strong> Secure password hashing and session management</li>
              <li><strong>Payment Security:</strong> PCI DSS compliant payment processing</li>
              <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
              <li><strong>Access Controls:</strong> Limited employee access on need-to-know basis</li>
            </ul>
            <p className="mt-4">
              While we strive to use commercially acceptable means to protect your data, no method of transmission 
              over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">7. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Object to certain data processing activities</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@truehost.co.ke
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">8. Cookies & Tracking</h2>
            
            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">8.1 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for website functionality (authentication, cart)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
              <li><strong>Chat Cookies:</strong> Maintain Kaya AI conversation history</li>
            </ul>

            <h3 className="text-xl font-semibold text-[#111111] mt-6 mb-3">8.2 Managing Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that disabling certain cookies may limit 
              website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">9. Data Retention</h2>
            <p>We retain your information for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Duration of account activity plus legal retention period</li>
              <li><strong>Domain Registration Data:</strong> As required by ICANN (minimum 2 years after expiration)</li>
              <li><strong>Transaction Records:</strong> 7 years for accounting and legal compliance</li>
              <li><strong>Chat Logs:</strong> 90 days for service improvement, then anonymized</li>
              <li><strong>Marketing Data:</strong> Until you opt-out or 3 years of inactivity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">10. International Data Transfers</h2>
            <p>
              Our servers are primarily located in Kenya. If you&apos;re accessing our services from outside Kenya, 
              your information may be transferred to, stored, and processed in Kenya. We ensure appropriate 
              safeguards are in place for international data transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">11. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under 18. We do not knowingly collect personal information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">12. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices 
              of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">13. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated 
              revision date. Significant changes will be communicated via email. Continued use of our services 
              after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">14. Contact Us</h2>
            <p>
              For privacy-related questions, concerns, or to exercise your rights:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mt-4">
              <p className="font-semibold text-[#111111]">Privacy & Data Protection</p>
              <p>Email: privacy@truehost.co.ke</p>
              <p>Support: support@truehost.co.ke</p>
              <p>Phone: +254 20 528 0000</p>
              <p>Address: Nairobi, Kenya</p>
              <p className="mt-2">Available 24/7</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#111111] mt-8 mb-4">15. Your Consent</h2>
            <p>
              By using CheapestDomains, you consent to this Privacy Policy and agree to its terms. If you do not 
              agree with this policy, please discontinue use of our services.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
