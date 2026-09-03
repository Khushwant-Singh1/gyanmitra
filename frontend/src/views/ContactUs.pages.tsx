import React from 'react';

export const ContactUs: React.FC = () => {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Contact Us (संपर्क करें)
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          ज्ञानमित्र न्यूज़ की संपादकीय, तकनीकी अथवा विज्ञापन टीम से संपर्क करें
        </p>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-gray-700">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📌 Gyanmitra News - Digital Media Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Chief Editor / मुख्य संपादक:</p>
              <p>Dr. Kunwar Rana Pratap Singh Rana (LLB, M.Com, MBA)</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Direct Phone / हेल्पलाइन:</p>
              <p><a href="tel:7500801004" className="text-blue-600 hover:underline font-medium">+91 7500801004</a></p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Editorial &amp; Support Email:</p>
              <p><a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 hover:underline">gyanmitranews@gmail.com</a></p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Official Website:</p>
              <p><a href="https://gyanmitranews.com" className="text-blue-600 hover:underline">https://gyanmitranews.com</a></p>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">हमारे कार्यालय (Regional Offices)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5">
              <h3 className="font-bold text-gray-900 mb-2">🏢 Head Office (मुख्यालय)</h3>
              <p className="text-sm text-gray-600">
                Shiv Mandir Road, Vikas Nagar, Chandausi,<br />
                Near Sai Eye Hospital, Sambhal,<br />
                Uttar Pradesh – 244412
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5">
              <h3 className="font-bold text-gray-900 mb-2">📍 Lucknow Office</h3>
              <p className="text-sm text-gray-600">
                MM 1/850, Vinay Khand 1,<br />
                Gomti Nagar, Lucknow,<br />
                Uttar Pradesh – 224010
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5">
              <h3 className="font-bold text-gray-900 mb-2">📍 Agra Office</h3>
              <p className="text-sm text-gray-600">
                46/175F, Ber Ka Nagla,<br />
                Jagdishpura, Agra,<br />
                Uttar Pradesh – 282002
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5">
              <h3 className="font-bold text-gray-900 mb-2">📍 Uttarakhand Office</h3>
              <p className="text-sm text-gray-600">
                RK Tent House Road, Kusumkheda,<br />
                Indira Colony Phase-2, Haldwani (Nainital),<br />
                Uttarakhand – 263139
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5 md:col-span-2">
              <h3 className="font-bold text-gray-900 mb-2">📍 Jharkhand Office</h3>
              <p className="text-sm text-gray-600">
                Makdampur (Near Ram Mandir Talab), P.S. Parsudih,<br />
                P.O. Tatanagar, Jamshedpur,<br />
                Jharkhand – 831002
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">प्रेस विज्ञप्ति एवं विज्ञापन पूछताछ</h2>
          <p className="text-sm text-gray-600">
            प्रेस विज्ञप्तियां, समाचार सुझाव अथवा विज्ञापनों से संबंधित पूछताछ के लिए आप हमें सीधे{' '}
            <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">
              gyanmitranews@gmail.com
            </a>{' '}
            पर ईमेल कर सकते हैं या कार्यदिवसों में +91 7500801004 पर संपर्क कर सकते हैं।
          </p>
        </section>
      </div>
    </article>
  );
};
