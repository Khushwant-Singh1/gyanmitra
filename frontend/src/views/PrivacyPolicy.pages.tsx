import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy (गोपनीयता नीति)
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed">
        <section>
          <p>
            At <strong>Gyanmitra News</strong> (accessible from{' '}
            <a href="https://gyanmitranews.com" className="text-blue-600 underline hover:text-blue-800">
              https://gyanmitranews.com
            </a>
            ), one of our main priorities is the privacy of our visitors. This Privacy Policy document
            explains the types of information that is collected and recorded by Gyanmitra News and how we use it.
          </p>
          <p className="mt-3">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate
            to contact our editorial and data protection team at{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            1. Google AdSense &amp; Third-Party Advertising Cookies (गूगल एडसेंस नीति)
          </h2>
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5 text-gray-800 space-y-3">
            <p>
              Gyanmitra News partners with third-party vendors and ad networks, including <strong>Google AdSense</strong>,
              to serve advertisements when you visit our website.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user&apos;s
                prior visits to your website or other websites across the Internet.
              </li>
              <li>
                <strong>DoubleClick Cookie:</strong> Google&apos;s use of advertising cookies (such as the DoubleClick cookie)
                enables Google and its advertising partners to serve ads to our visitors based on their visit to{' '}
                <em>gyanmitranews.com</em> and/or other websites on the Internet.
              </li>
              <li>
                <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising by
                visiting{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  Google Ads Settings (https://adssettings.google.com)
                </a>
                .
              </li>
              <li>
                Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized
                advertising by visiting{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  www.aboutads.info
                </a>{' '}
                or{' '}
                <a
                  href="https://optout.networkadvertising.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 underline hover:text-blue-900"
                >
                  Network Advertising Initiative (NAI) Opt-Out
                </a>
                .
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it,
            will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              <strong>Direct Information:</strong> If you contact us directly or register an account, we may receive
              additional information about you such as your name, email address, phone number, contents of your message,
              and attachments.
            </li>
            <li>
              <strong>Log Files:</strong> Gyanmitra News follows a standard procedure of using log files. These files log
              visitors when they visit websites. The information collected by log files includes internet protocol (IP)
              addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and
              possibly the number of clicks. These are not linked to any information that is personally identifiable.
            </li>
            <li>
              <strong>Device &amp; Analytics Data:</strong> We may collect non-personal information such as device type,
              operating system, browser type, and anonymous aggregate readership statistics to improve reader experience.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Cookies and Web Beacons</h2>
          <p>
            Like any other website, Gyanmitra News uses &apos;cookies&apos;. These cookies are used to store information
            including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited.
            The information is used to optimize the users&apos; experience by customizing our web page content based
            on visitors&apos; browser type and/or other information.
          </p>
          <p className="mt-3">
            You can choose to disable cookies through your individual browser options. To know more detailed
            information about cookie management with specific web browsers, it can be found at the browsers&apos;
            respective websites (e.g., Chrome, Safari, Firefox, Edge).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Provide, operate, maintain, and improve our news portal and digital journalism services.</li>
            <li>Understand and analyze how visitors engage with our articles, features, and educational content.</li>
            <li>Develop new editorial products, categories, features, and competitions.</li>
            <li>
              Communicate with you for editorial queries, reader comments, customer support, and system updates.
            </li>
            <li>Send you newsletters, breaking news alerts, and promotional communications (with opt-out choice).</li>
            <li>Detect and prevent fraud, spam comments, and security vulnerabilities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. CCPA &amp; GDPR / DPDP Data Protection Rights</h2>
          <p>
            We would like to make sure you are fully aware of all of your data protection rights under applicable laws
            (including GDPR and the Digital Personal Data Protection Act):
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
            <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
            <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data.</li>
          </ul>
          <p className="mt-3">
            If you make a request, we have one month to respond to you. If you would like to exercise any of these
            rights, please contact us at{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Children&apos;s Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage
            parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p className="mt-3">
            Gyanmitra News does not knowingly collect any Personal Identifiable Information from children under the
            age of 13. If you think that your child provided this kind of information on our website, we strongly
            encourage you to contact us immediately and we will do our best efforts to promptly remove such
            information from our records.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Contact Our Grievance &amp; Privacy Officer</h2>
          <p>If you have any questions or grievances regarding this Privacy Policy, please contact:</p>
          <div className="mt-3 bg-gray-50 p-4 rounded-lg text-sm space-y-1">
            <p><strong>Gyanmitra News Digital Platform</strong></p>
            <p><strong>Chief Editor:</strong> Dr. Kunwar Rana Pratap Singh Rana (LLB, MCom, MBA)</p>
            <p><strong>Head Office:</strong> Shiv Mandir Road, Vikas Nagar, Chandausi, Sambhal, Uttar Pradesh – 244412</p>
            <p><strong>Phone:</strong> +91 7500801004</p>
            <p><strong>Email:</strong> <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">gyanmitranews@gmail.com</a></p>
          </div>
        </section>
      </div>
    </article>
  );
};
