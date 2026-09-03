import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer (अस्वीकरण) - Gyanmitra',
  description: 'ज्ञानमित्र न्यूज़ का आधिकारिक अस्वीकरण - समाचार सटीकता, संपादकीय विचार एवं तृतीय पक्ष सामग्री संबंधी नीति।',
  alternates: {
    canonical: 'https://gyanmitranews.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Disclaimer (अस्वीकरण)
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. General Information Purpose</h2>
          <p>
            The information provided by <strong>Gyanmitra News</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on{' '}
            <a href="https://gyanmitranews.com" className="text-blue-600 underline">
              https://gyanmitranews.com
            </a>{' '}
            (the &quot;Site&quot;) is published in good faith for general informational, educational, and journalistic purposes only.
            Gyanmitra News makes no representation or warranty of any kind, express or implied, regarding the accuracy,
            adequacy, validity, reliability, availability, or completeness of any information on the Site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Editorial Opinions &amp; Authenticity (संपादकीय विचार)</h2>
          <p>
            Articles, opinion pieces, columns, and blogs published on Gyanmitra News represent the personal views and research
            of their respective authors and reporters. They do not necessarily reflect the official policy or stance of
            Gyanmitra News, its management, or its editors. While our editorial team makes every effort to verify facts
            through official press releases, news agencies, and government portals, readers are encouraged to verify
            critical information independently.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. External Links &amp; Third-Party Content</h2>
          <p>
            The Site may contain links to external websites, services, or embedded content (such as videos, social media posts,
            and advertisements) that are not owned, maintained, or controlled by Gyanmitra News. Please note that we do not
            guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.
            Inclusion of any third-party link does not imply endorsement by Gyanmitra News.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Financial, Educational &amp; Career Guidance Disclaimer</h2>
          <p>
            Any articles or updates related to government schemes, financial tips, stock markets, examinations, or employment
            opportunities are for educational awareness only. They must not be considered professional financial, legal, or
            academic advice. Readers must consult authorized consultants or official government notifications before taking
            any financial or legal action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Fair Use &amp; Copyright Notice (उचित उपयोग)</h2>
          <p>
            Gyanmitra News respects intellectual property rights. Certain media, images, or excerpts may be used under the
            &quot;Fair Use&quot; provisions of applicable copyright laws for news reporting, criticism, review, and educational commentary.
            If you are the copyright holder of any material and believe it has been used without authorization, please notify us
            immediately at <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">gyanmitranews@gmail.com</a>{' '}
            with relevant proof, and we will take prompt corrective action.
          </p>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">6. Contact for Corrections &amp; Clarifications</h2>
          <p className="text-sm text-gray-600">
            If you discover an error or wish to request a factual correction in any published report, please write to our
            editorial grievance desk at{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>{' '}
            or contact us at +91 7500801004.
          </p>
        </section>
      </div>
    </article>
  );
}
