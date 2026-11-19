import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNPA Code of Ethics - Gyanmitra News',
  description:
    'DNPA Code of Ethics for Gyanmitra News - Guidelines on accuracy, fairness, right of reply, editorial conduct, and grievance redressal.',
  alternates: {
    canonical: 'https://gyanmitranews.com/dnpa-code-of-ethics',
  },
};

export default function DnpaCodeOfEthicsPage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          DNPA Code of Ethics
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
            Gyanmitra News is committed to following the principles of responsible digital news publishing,
            journalistic ethics and professional standards.
          </p>
          <p className="mt-3">
            The purpose of this Code is to establish high standards of ethics and professional practices in digital news
            publishing while safeguarding the freedom of expression guaranteed under Article 19(1)(a) of the
            Constitution of India and other constitutionally protected freedoms.
          </p>
          <p className="mt-3">
            This Code aims to promote responsible digital publishing without interfering with the day-to-day editorial
            operations of the organisation. Gyanmitra News maintains its editorial and content independence and
            recognises the importance of protecting the independence of journalists, content creators and publishers.
          </p>
          <p className="mt-3">
            The fundamental principles of this Code are to maintain high standards of digital journalism, promote
            responsible news publishing and protect the independence of journalists, editors and publishers.
          </p>
          <p className="mt-3">
            Digital news publishing shall be carried out in accordance with the Constitution of India and all applicable
            laws relating to media and journalism, including the Information Technology Act, 2000, relevant rules and
            other applicable legislation, as amended or replaced from time to time.
          </p>
          <p className="mt-3">
            Gyanmitra News shall endeavour to adhere to accepted norms of journalistic ethics and practices and maintain
            high standards of professional conduct. Editorial processes shall emphasise accuracy, verification,
            fairness, transparency and accountability.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">1. Accuracy, Transparency &amp; Fairness</h2>
          <p>Gyanmitra News shall avoid publishing inaccurate, baseless, misleading or distorted information.</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Facts and information shall be verified before publication, as far as reasonably possible.</li>
            <li>News reports and articles shall be based on reliable information and credible sources.</li>
            <li>Defamation and publication of unsubstantiated allegations shall be avoided.</li>
            <li>Applicable laws, rules and regulations governing digital news publishing shall be followed.</li>
            <li>News content shall be presented fairly, accurately and without deliberate distortion of facts.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">2. Right of Reply</h2>
          <p>
            News reports and articles involving allegations against any person, organisation or party shall, wherever
            reasonably possible, incorporate the comments or version of the concerned person or party.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>The concerned person or party shall be given a reasonable opportunity to present their version.</li>
            <li>
              If their response is not available before publication, any response received subsequently shall be
              appropriately considered and incorporated, wherever warranted.
            </li>
            <li>
              If significant developments occur in a published news report and the concerned person or party requests an
              update, the request shall be appropriately considered.
            </li>
            <li>
              The date of a material update shall be mentioned in the concerned news item, wherever applicable.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">3. Take Down, Delete or Edit</h2>
          <p>
            If any news report or article published on Gyanmitra News is alleged to contain false or inaccurate
            information, the concerned person or party may approach the organisation with correct information,
            appropriate identification and relevant supporting documents or material.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Every such request shall be examined on the basis of the available facts and supporting material.</li>
            <li>
              Upon verification, the relevant portion of the news report or article may be edited or deleted, wherever
              necessary.
            </li>
            <li>
              If the entire news report or article is found to be materially false or otherwise unsuitable for continued
              publication, appropriate action, including removal, may be taken.
            </li>
            <li>
              Requests for correction, editing or removal shall be considered in accordance with applicable laws and
              editorial standards.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">4. Respect for Intellectual Property Rights</h2>
          <p>
            Gyanmitra News respects the intellectual property rights of individuals, organisations, publishers,
            photographers, writers and other content creators.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Copyright in text, photographs, plans, diagrams, cartoons, graphics, videos and other creative material
              shall be respected.
            </li>
            <li>
              Where permission is legally required for the use of copyrighted material, such permission shall be obtained.
            </li>
            <li>
              Publication shall acknowledge the rights of the original creator or copyright holder, wherever applicable.
            </li>
            <li>
              Where a licence or permission requires payment of a fee or royalty, the applicable amount shall be paid.
            </li>
            <li>
              Trademarks and service marks belonging to third parties shall not be used without permission, except where
              such use is legally permissible.
            </li>
            <li>
              Complaints alleging intellectual property infringement shall be examined upon receipt of relevant documents
              and supporting evidence. Appropriate action, including editing, removal or taking down the concerned
              material, shall be considered wherever necessary.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">5. Reporting of Crime and Sensational Matters</h2>
          <p>Special care shall be exercised while reporting sensational matters, criminal cases and other sensitive incidents.</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>The principle of presumption of innocence shall be respected.</li>
            <li>An accused person shall not be portrayed as guilty unless convicted by a competent court of law.</li>
            <li>
              Unnecessary comments and speculation concerning evidence, witnesses, witness conduct, accused persons,
              victims and their respective conduct shall be avoided.
            </li>
            <li>Crime reporting shall be based on verified facts and presented in an unbiased manner.</li>
            <li>
              Allegations, police statements, investigation details and judicial findings shall be clearly distinguished.
            </li>
          </ul>
          <p className="mt-3">Special care shall be taken while reporting matters relating to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Sexual harassment at the workplace.</li>
            <li>Child abuse and exploitation.</li>
            <li>Rape and other sexual offences.</li>
            <li>Cases involving minor accused persons or victims.</li>
            <li>Matrimonial disputes.</li>
            <li>Riots and communal disputes or clashes.</li>
            <li>Divorce and child custody cases.</li>
            <li>Adoption matters.</li>
            <li>Other sensitive issues involving the dignity, privacy and legal rights of individuals.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            6. Compliance with Sections 67, 67A and 67B of the Information Technology Act, 2000
          </h2>
          <p>
            Gyanmitra News shall take due care to comply with Sections 67, 67A and 67B of the Information Technology Act,
            2000, wherever applicable.
          </p>
          <p className="mt-3">
            These provisions deal with penalties relating to the publication or transmission of obscene material,
            sexually explicit material and material depicting children in sexually explicit acts in electronic form.
          </p>
          <p className="mt-3">
            Content prohibited under applicable legal provisions shall not knowingly be published or transmitted.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">7. Grievance Redressal Mechanism</h2>
          <p>
            Gyanmitra News shall maintain an appropriate grievance redressal mechanism in accordance with the applicable
            laws and rules governing digital news publishers.
          </p>
          <p className="mt-3">
            The organisation shall display the name and contact details of its designated Grievance Officer at an
            appropriate place on its website.
          </p>
          <p className="mt-3">
            Complaints relating to content published on the website shall be examined in accordance with the applicable
            grievance redressal procedure and timelines. Where the applicable rules prescribe:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Acknowledgement of a grievance within twenty-four hours of its receipt.</li>
            <li>A decision on the grievance and communication to the complainant within fifteen days of registration.</li>
            <li>Further escalation to the recognised self-regulating body and the applicable oversight mechanism.</li>
          </ul>
          <p className="mt-3">
            Gyanmitra News shall follow the relevant procedure and timelines, subject to the applicability of the rules
            and the publisher&apos;s regulatory status.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Grievance Redressal Contact Details</h3>
            <ul className="space-y-2 text-sm text-gray-700">
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
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">8. Training and Awareness Programmes</h2>
          <p>
            Gyanmitra News shall endeavour to conduct periodic training and awareness programmes for its editorial
            staff, journalists and reporters regarding applicable laws and professional standards governing journalism.
          </p>
          <p className="mt-3">Such training and awareness programmes may cover relevant subjects, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>The Constitution of India and freedom of expression.</li>
            <li>Laws relating to media and digital news publishing.</li>
            <li>The Indecent Representation of Women (Prohibition) Act.</li>
            <li>The Copyright Act.</li>
            <li>The Right to Information Act.</li>
            <li>Relevant provisions of criminal law, including applicable successor legislation.</li>
            <li>Civil and criminal defamation.</li>
            <li>Intellectual Property Rights (IPR).</li>
            <li>Juvenile Justice Act.</li>
            <li>Protection of Children from Sexual Offences (POCSO) Act.</li>
            <li>Legal provisions relating to reporting of rape and sexual offences.</li>
            <li>Sexual harassment at the workplace.</li>
            <li>Caste- and gender-related crimes.</li>
            <li>Domestic violence.</li>
            <li>Other applicable laws and regulations concerning responsible journalism.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">
            9. Protection of Identity of Victims and Juveniles
          </h2>
          <p>
            Gyanmitra News shall exercise strict caution to protect the identity and privacy of victims and juveniles.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Names of victims and details that may directly or indirectly lead to the identification of victims or
              other persons whose identities are protected under law shall not be disclosed.
            </li>
            <li>
              Special care shall be taken in cases involving juveniles and sexual offences, including sexual harassment at
              the workplace.
            </li>
            <li>
              No information shall be published that may reveal the identity of persons whose identities are legally
              protected.
            </li>
            <li>
              Photographs of victims, their residences, workplaces or other identifiable locations shall be avoided,
              particularly where such publication may reveal their identity or compromise their privacy.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">10. Reporting of Communal and Religious Matters</h2>
          <p>
            Special care and caution shall be exercised while reporting matters relating to communal or religious
            disputes and clashes.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Such news items shall be published only after proper verification of facts.</li>
            <li>Reports shall be presented with due caution, restraint and responsibility.</li>
            <li>Unverified information, rumours and provocative content shall not be published as established facts.</li>
            <li>
              News coverage shall be balanced and shall avoid unnecessary statements or presentations that may create
              communal tension.
            </li>
            <li>The dignity and sentiments of all communities shall be respected.</li>
            <li>The objective shall be to promote communal harmony, amity, mutual respect and peace through responsible journalism.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">11. Reporting on Courts and Judicial Matters</h2>
          <p>Special care shall be exercised while reporting on courts, judicial proceedings and legal matters.</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              Gyanmitra News shall endeavour to create awareness among its editorial staff regarding legislative
              privileges, court proceedings and the correct reporting of judicial matters.
            </li>
            <li>Court hearings and judicial proceedings shall be reported accurately.</li>
            <li>Court orders, observations and decisions shall be presented in their proper context.</li>
            <li>
              The versions of the concerned parties shall be covered, wherever appropriate and available, without
              prejudicial comments.
            </li>
            <li>
              Speculation and unnecessary commentary that may affect the fairness of judicial proceedings shall be
              avoided.
            </li>
            <li>
              Applicable legal provisions, court directions and restrictions concerning judicial reporting shall be
              respected.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-gray-900">12. Respect for Privacy</h2>
          <p>
            Gyanmitra News shall respect the privacy of individuals, particularly those who are not in public life.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Personal information, private details and other sensitive material shall not be published unnecessarily.</li>
            <li>
              The privacy, dignity and rights of individuals shall be respected while collecting, processing and
              publishing news and other digital content.
            </li>
            <li>
              Publication of private information shall be guided by legitimate public interest, journalistic
              responsibility and applicable legal provisions.
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
