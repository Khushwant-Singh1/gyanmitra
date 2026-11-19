import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Team - Gyanmitra News',
  description:
    'Meet the editorial team, bureau chiefs, correspondents, and leadership behind Gyanmitra News.',
  alternates: {
    canonical: 'https://gyanmitranews.com/team',
  },
};

const TEAM_MEMBERS = [
  { name: 'Dr. Kunwar Mahendra Pratap Singh Rana', role: 'Mentor', bio: 'Senior journalist with over 15 years of experience in print and digital media (Hindustan, Amar Ujala, Dainik Jagran Network).' },
  { name: 'Kunwar Rana Pratap Singh Rana', role: 'Editor-in-Chief', bio: 'Journalist and legal consultant with over 10 years of experience leading content strategy and editorial integrity.' },
  { name: 'Radhika Saini', role: 'Senior Content Writer', bio: 'Experienced journalist covering entertainment, culture, and lifestyle.' },
  { name: 'Sarnam Singh', role: 'Sambhal Bureau / Senior Journalist', bio: '15 years of experience across print, television and digital media (Hindustan, Amar Ujala, News 24).' },
  { name: 'Avinash Kumar', role: 'Content Writer', bio: 'Digital content development, research, and factual reporting.' },
  { name: 'Aniket Gupta', role: 'Hardoi Bureau', bio: 'Ground reporting, regional coverage, and grassroots community journalism.' },
  { name: 'Deepak Kumar', role: 'State Head, Uttarakhand', bio: 'Regional bureau management, state politics, and mountain community reporting.' },
  { name: 'Sunil Kumar', role: 'State Head, Haryana', bio: 'State-wide coverage, public administration, and rural affairs.' },
  { name: 'Vikas Patel', role: 'Amroha Bureau', bio: 'District-level news reporting, investigative coverage, and local events.' },
  { name: 'Abhivyakti Sinha', role: 'Moradabad Bureau', bio: 'Regional affairs, civic reporting, and cultural events.' },
  { name: 'Jitendra Kumar', role: 'Rampur Bureau', bio: 'District news operations, breaking stories, and field reporting.' },
  { name: 'Manoj Kumar', role: 'State Head, UP (Uttar Pradesh)', bio: 'State-level political analysis, bureau coordination, and regional editions.' },
];

export default function TeamPage() {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Gyanmitra News Team
        </h1>
        <p className="mt-2 text-lg text-gray-600 font-medium">
          Meet the journalists, bureau chiefs, and editorial leadership bringing credible news to you.
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <p>
          Our team brings together journalistic experience, editorial understanding, subject expertise and a shared
          commitment to credible news. For more details about our mission and values, visit our{' '}
          <Link href="/about-us" className="text-blue-600 underline font-semibold">
            About Us
          </Link>{' '}
          page.
        </p>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Names &amp; Designations</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-200">
              {TEAM_MEMBERS.map((member, idx) => (
                <li
                  key={member.name}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 ${
                    idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{member.bio}</p>
                  </div>
                  <span className="mt-1 sm:mt-0 font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-xs shrink-0 self-start sm:self-center">
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connect With Our Editorial Team</h2>
          <p className="text-sm text-gray-600 mb-4">
            Have a story tip, press release, or feedback for any of our bureau heads or editorial leaders?
          </p>
          <p className="text-sm text-gray-800">
            <strong>Email:</strong>{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>
          </p>
          <p className="text-sm text-gray-800 mt-1">
            <strong>Helpline:</strong> +91 7500801004 (Mon - Fri, 10:00 AM - 6:00 PM)
          </p>
        </section>
      </div>
    </article>
  );
}
