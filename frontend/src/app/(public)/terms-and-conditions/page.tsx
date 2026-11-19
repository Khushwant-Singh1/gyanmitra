import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Gyanmitra News',
  description:
    'Terms & Conditions governing the use of Gyanmitra News website - Content usage, copyright, external links, user guidelines and contact details.',
  alternates: {
    canonical: 'https://gyanmitranews.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Website:{' '}
          <a href="https://www.gyanmitranews.com" className="text-blue-600 underline">
            www.Gyanmitranews.com
          </a>
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <section>
          <p>
            These Terms &amp; Conditions explain the rules and conditions governing the use of{' '}
            <strong>Gyanmitra News</strong> (
            <a href="https://www.gyanmitranews.com" className="text-blue-600 underline">
              www.Gyanmitranews.com
            </a>
            ), an independent digital news platform.
          </p>
          <p className="mt-3">
            By accessing, browsing or using this website, you agree to comply with these Terms &amp; Conditions. If you do
            not agree with any part of these terms, please discontinue using the website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">1. USE OF CONTENT</h2>
          <p>
            Users are permitted to read, access and share links to news articles and other content published on
            Gyanmitra News for personal and informational purposes.
          </p>
          <p className="mt-3">You must not use this website in any manner that:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Violates any applicable law or regulation.</li>
            <li>Interferes with the proper functioning, security or availability of the website.</li>
            <li>Misleads readers or involves fraudulent or deceptive activities.</li>
            <li>Harms the rights, reputation or interests of any individual or organisation.</li>
            <li>Presents content published by Gyanmitra News as your own original work.</li>
          </ul>
          <p className="mt-3">
            Users must not misuse, manipulate or reproduce website content in a manner that creates a false impression
            about its source or authorship.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">2. ACCURACY AND NO GUARANTEE</h2>
          <p>
            Gyanmitra News makes reasonable efforts to publish accurate, reliable and updated news and information.
            However, news and current affairs may change rapidly, and despite editorial care, inadvertent errors or
            omissions may occur.
          </p>
          <p className="mt-3">
            All content published on this website is intended for general information and public awareness. We do not
            guarantee that every piece of information will always be complete, accurate, current or suitable for a
            particular purpose.
          </p>
          <p className="mt-3">
            Content published on this website should not be treated as professional legal, medical, financial or other
            specialised advice. Readers are advised to seek appropriate professional guidance wherever necessary.
          </p>
          <p className="mt-3">
            Where any news article or other content is corrected, modified or updated, the latest published version
            shall be treated as the current version.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">3. EXTERNAL LINKS</h2>
          <p>
            Gyanmitra News may include links to external websites, news sources, government portals, social media
            platforms, advertisers or other third-party services for the convenience and information of readers.
          </p>
          <p className="mt-3">
            These external websites and services are not under the direct control of Gyanmitra News. We are not
            responsible for their content, accuracy, availability, privacy practices, security or terms of use.
          </p>
          <p className="mt-3">
            Accessing any external website through a link published on Gyanmitra News is at the user&apos;s own
            discretion. Users are advised to review the terms and privacy policies of such third-party websites before
            using their services.
          </p>
          <p className="mt-3">
            The inclusion of any external link does not necessarily imply endorsement or approval by Gyanmitra News.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">4. COPYRIGHT AND REUSE OF CONTENT</h2>
          <p>
            Unless otherwise stated, the text, news articles, photographs, graphics, logos, designs and other material
            published on{' '}
            <a href="https://www.gyanmitranews.com" className="text-blue-600 underline">
              www.Gyanmitranews.com
            </a>{' '}
            are owned by Gyanmitra News or are used with the permission or rights of the respective content providers.
            Such material may be protected under applicable copyright and intellectual property laws.
          </p>
          <p className="mt-3">
            No person or organisation may copy, reproduce, republish, distribute, modify, commercially exploit or use
            the whole or a substantial part of the website&apos;s content without obtaining prior written permission from
            the respective rights holder, except where such use is permitted under applicable law.
          </p>
          <p className="mt-3">
            Short quotations or limited use of content with proper attribution and a link to the original article may be
            permissible where allowed under applicable law.
          </p>
          <p className="mt-3">
            Users must not remove or alter copyright notices, image credits, watermarks, source references or other
            ownership acknowledgements appearing with the content.
          </p>
          <p className="mt-3">
            For permission to reproduce or republish content, users may contact Gyanmitra News through the contact
            details provided on the website.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">5. COMMENTS AND USER-GENERATED CONTENT</h2>
          <p>
            Where comment sections, feedback forms or other user-submission facilities are available on the website,
            users shall be responsible for the content they submit.
          </p>
          <p className="mt-3">Users must not submit or publish content that:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Is unlawful, abusive, threatening or defamatory.</li>
            <li>Contains false, misleading or deliberately deceptive information.</li>
            <li>Promotes hatred, discrimination or hostility against any individual or community.</li>
            <li>Violates another person&apos;s privacy or intellectual property rights.</li>
            <li>Contains obscene, offensive or otherwise prohibited material.</li>
            <li>Violates any applicable law or regulation.</li>
          </ul>
          <p className="mt-3">
            Gyanmitra News reserves the right to review, moderate, edit, remove or refuse to publish any user-submitted
            content that violates these terms or is otherwise considered inappropriate.
          </p>
          <p className="mt-3">
            We may also restrict or suspend access to website features where necessary to prevent misuse or protect the
            website and its users.
          </p>
          <p className="mt-3">
            Views and opinions expressed in user comments or submissions are those of the respective contributors and do
            not necessarily represent the views or editorial position of Gyanmitra News.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">6. CHANGES TO THESE TERMS</h2>
          <p>
            Gyanmitra News reserves the right to modify, revise or update these Terms &amp; Conditions from time to time
            in response to changes in website services, operational requirements or applicable legal provisions.
          </p>
          <p className="mt-3">
            Any revised Terms &amp; Conditions will be published on this page. The updated version shall apply from the
            date of its publication.
          </p>
          <p className="mt-3">
            Users are encouraged to review this page periodically to remain informed about the conditions governing the
            use of the website.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-gray-900">7. CONTACT US</h2>
          <p className="mb-3 text-sm text-gray-600">
            For questions, concerns, requests or complaints relating to these Terms &amp; Conditions, website content,
            copyright or any other matter concerning Gyanmitra News, users may contact us through the following details:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>Publisher:</strong> Gyanmitra News
            </li>
            <li>
              <strong>Website:</strong>{' '}
              <a href="https://www.gyanmitranews.com" className="text-blue-600 underline">
                www.Gyanmitranews.com
              </a>
            </li>
            <li>
              <strong>Grievance Officer:</strong> Dr. Kunwar Mahendra Pratap Singh Rana
            </li>
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
                Gyanmitranews@gmail.com
              </a>
            </li>
            <li>
              <strong>Contact Number:</strong> +91 7500801004
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-500">
            Users may also visit the{' '}
            <a href="/contact-us" className="text-blue-600 underline">
              Contact Us
            </a>{' '}
            section of our website for communication and assistance.
          </p>
        </section>
      </div>
    </article>
  );
}
