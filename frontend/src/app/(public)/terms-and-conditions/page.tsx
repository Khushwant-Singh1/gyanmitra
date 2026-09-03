import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions (नियम एवं शर्तें) - Gyanmitra',
  description: 'ज्ञानमित्र न्यूज़ की सेवा की शर्तें और नियम - उपयोगकर्ता दिशानिर्देश, बौद्धिक संपदा अधिकार एवं कानूनी दायित्व।',
  alternates: {
    canonical: 'https://gyanmitranews.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Terms &amp; Conditions (नियम एवं शर्तें)
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
          <p>
            These Terms &amp; Conditions constitute a legally binding agreement made between you (&quot;user&quot;, &quot;you&quot;)
            and <strong>Gyanmitra News</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and
            use of the website located at{' '}
            <a href="https://gyanmitranews.com" className="text-blue-600 underline">
              https://gyanmitranews.com
            </a>{' '}
            as well as any related media channels or mobile applications. By accessing the Site, you agree that you have read,
            understood, and agree to be bound by all of these Terms &amp; Conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Intellectual Property Rights (बौद्धिक संपदा)</h2>
          <p>
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality,
            software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;)
            and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us
            or licensed to us, and are protected by copyright and trademark laws.
          </p>
          <p className="mt-2">
            No part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded,
            posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited
            for any commercial purpose whatsoever, without our express prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. User Conduct &amp; Community Comments</h2>
          <p>
            When interacting with the Site, posting comments on articles, or participating in Gyanmitra competitions, you agree
            not to post or transmit any material that:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Is unlawful, defamatory, libelous, obscene, pornographic, harassing, threatening, or abusive.</li>
            <li>Promotes hatred, violence, discrimination, or communal disharmony.</li>
            <li>Infringes on any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
            <li>Contains viruses, corrupted data, spam, chain letters, or commercial solicitations.</li>
          </ul>
          <p className="mt-2">
            Gyanmitra News reserves the unconditional right to review, edit, or remove any comment or user-generated content
            that violates these guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Competitions &amp; Student Submissions</h2>
          <p>
            Gyanmitra News organizes educational contests, essay competitions, and youth initiatives. By submitting an entry
            to any Gyanmitra competition:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>You affirm that your submission is your own original work and does not plagiarize any third-party source.</li>
            <li>You grant Gyanmitra News a non-exclusive license to publish, showcase, and archive your entry with proper attribution.</li>
            <li>Decisions of the editorial jury and organizers regarding awards and certificates shall be final and binding.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Limitation of Liability</h2>
          <p>
            In no event will Gyanmitra News or our directors, employees, or agents be liable to you or any third party for any
            direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue,
            or loss of data arising from your use of the Site, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms &amp; Conditions and your use of the Site are governed by and construed in accordance with the laws of
            India. Any legal action or proceeding related to this Site shall be brought exclusively in the courts of Sambhal /
            Chandausi, Uttar Pradesh, India.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">7. Contact Information</h2>
          <p className="text-sm text-gray-600">
            For questions or concerns regarding these Terms &amp; Conditions, please contact us at{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>{' '}
            or write to: Chief Editor, Gyanmitra News, Shiv Mandir Road, Vikas Nagar, Chandausi, Sambhal, UP – 244412.
          </p>
        </section>
      </div>
    </article>
  );
}
