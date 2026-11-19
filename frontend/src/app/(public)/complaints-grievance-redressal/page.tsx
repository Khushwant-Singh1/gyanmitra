import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints & Grievance Redressal Policy - Gyanmitra News',
  description:
    'Gyanmitra News grievance redressal policy, complaint submission guidelines, escalation mechanism, and Grievance Officer contact details.',
  alternates: {
    canonical: 'https://gyanmitranews.com/complaints-grievance-redressal',
  },
};

export default function ComplaintsGrievancePage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Complaints &amp; Grievance Redressal Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Website: <a href="https://www.gyanmitranews.com" className="text-blue-600 underline">www.Gyanmitranews.com</a>
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <section>
          <p>
            At Gyanmitra News, we value the trust of our readers and take complaints, feedback and concerns seriously.
            We are committed to maintaining high standards of journalistic integrity, accuracy, fairness and
            accountability.
          </p>
          <p className="mt-3">
            If you have a complaint, objection or concern regarding any news report, article, photograph, headline or
            other content published on our website, you may contact our Grievance Officer using the details provided below.
          </p>
          <p className="mt-3">
            <strong>Email:</strong>{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              Gyanmitranews@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">How to Submit a Complaint</h2>
          <p>To help us review your complaint effectively, please provide the following details:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Article Title or URL:</strong> The headline or direct link to the content concerned.
            </li>
            <li>
              <strong>Date of Publication:</strong> The date on which the content was published.
            </li>
            <li>
              <strong>Nature of Complaint:</strong> A clear and detailed explanation of your concern.
            </li>
            <li>
              <strong>Supporting Information:</strong> Relevant documents, facts or references, wherever applicable.
            </li>
            <li>
              <strong>Contact Details:</strong> Your name and email address so that we can communicate with you regarding the matter.
            </li>
          </ul>
          <p className="mt-3">
            Please provide accurate information and relevant supporting material to help us examine the complaint.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Complaint Review &amp; Resolution</h2>
          <p>
            Every complaint received by Gyanmitra News is examined by the designated Grievance Officer and the concerned
            editorial team, as appropriate.
          </p>
          <p className="mt-3">
            Complaints will be acknowledged within the time prescribed under applicable rules. The complaint will be
            examined and a decision communicated within the applicable statutory period.
          </p>
          <p className="mt-3">Where a factual error or other editorial issue is identified, appropriate corrective action may include:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Updating or correcting the published content.</li>
            <li>Publishing a clarification.</li>
            <li>Adding an update or correction note.</li>
            <li>Editing or removing the relevant portion of the content, wherever justified.</li>
            <li>Removing the entire content where the circumstances and verification warrant such action.</li>
          </ul>
          <p className="mt-3">
            All complaints will be considered on their merits, based on the available facts, supporting documents and
            applicable legal requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Escalation of Complaints</h2>
          <p>
            If a complainant is not satisfied with the decision of Gyanmitra News, or if a complaint remains unresolved
            within the prescribed period, the complainant may pursue the applicable escalation or appeal mechanism under
            the relevant rules.
          </p>
          <p className="mt-3">
            Where applicable, this may include approaching the recognised self-regulating body of which the publisher is
            a member and the subsequent statutory oversight mechanism.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">Our Commitment</h2>
          <p>
            At Gyanmitra News, we consider reader feedback and accountability essential to credible journalism. Every
            genuine complaint provides us with an opportunity to review our work, improve our editorial practices and
            strengthen the trust of our readers.
          </p>
          <p className="mt-3 font-semibold text-gray-900">
            Your feedback matters. Your trust is our responsibility.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-gray-900">Grievance Redressal Contact Details</h2>
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
        </section>
      </div>
    </article>
  );
}
