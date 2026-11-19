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
          <p>
            At Gyanmitra News, we are committed to providing our readers with accurate, reliable and relevant
            information on a wide range of topics. Our editorial team makes reasonable efforts to verify the
            authenticity and accuracy of the content published on our platform.
          </p>
          <p className="mt-3">
            However, despite editorial care, inadvertent errors, omissions or inaccuracies may occasionally occur. We
            believe in transparency and remain committed to responsible journalistic standards.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">General Information</h2>
          <p>
            All information published on Gyanmitra News is intended for general informational and public awareness
            purposes.
          </p>
          <p className="mt-3">
            While we strive to ensure the accuracy, completeness and reliability of our reporting, we do not provide an
            absolute guarantee or warranty regarding the accuracy or completeness of every item published on our website.
          </p>
          <p className="mt-3">
            Readers are encouraged to independently verify information, particularly before making important personal,
            professional, financial or other decisions based on published content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">External Links &amp; Third-Party Content</h2>
          <p>
            Our website may contain links to external websites, resources and third-party platforms for additional
            information and reference. These websites are independently operated and are beyond our direct control.
          </p>
          <p className="mt-3">
            Gyanmitra News is not responsible for the content, accuracy, reliability, privacy practices or availability
            of information published on external websites.
          </p>
          <p className="mt-3">
            The inclusion of any external link does not necessarily imply our endorsement of the views, opinions,
            products or services presented on those platforms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Opinions, Views &amp; Endorsements</h2>
          <p>
            News reports, opinion articles, guest contributions and other published materials may reflect the views of
            their respective authors or contributors. Such views do not necessarily represent the official position of
            Gyanmitra News.
          </p>
          <p className="mt-3">
            Unless explicitly stated, the mention or publication of any product, service, individual, organisation or
            institution should not be interpreted as an endorsement or recommendation by Gyanmitra News.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">No Professional Advice</h2>
          <p>
            Information available on Gyanmitra News is intended for general awareness and informational purposes. It
            should not be considered a substitute for professional advice, including legal, financial, medical or other
            specialised advice.
          </p>
          <p className="mt-3">
            Readers are advised to consult qualified professionals before making decisions concerning specific legal,
            financial, medical or professional matters.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Limitation of Liability</h2>
          <p>
            To the extent permitted by applicable law, Gyanmitra News shall not be liable for any loss, damage or
            consequences arising from the use of, reliance upon or interpretation of information published on our website
            or accessed through external links.
          </p>
          <p className="mt-3">
            Nothing in this Disclaimer is intended to exclude or limit any liability that cannot lawfully be excluded
            or limited under applicable law.
          </p>
          <p className="mt-3">
            Readers are encouraged to exercise their own judgment and independently assess information before taking any
            action based on the content available on our platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Updates &amp; Changes</h2>
          <p>
            Gyanmitra News reserves the right to update, modify or revise this Disclaimer whenever necessary to reflect
            changes in our editorial practices, website policies or applicable requirements.
          </p>
          <p className="mt-3">Any revisions will be published on this page.</p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Our Commitment to Readers</h2>
          <p>
            At Gyanmitra News, we believe credible journalism is built on accuracy, transparency, fairness and
            accountability. We continuously strive to improve the quality of our reporting and provide meaningful
            information that helps readers stay informed.
          </p>
          <p className="mt-3">
            Our commitment remains to responsible journalism, independent reporting and the public interest.
          </p>
        </section>
      </div>
    </article>
  );
}
