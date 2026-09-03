import React from 'react';

export const AboutUs: React.FC = () => {
  return (
    <article className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 text-gray-800">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          About Us (हमारे बारे में)
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित विश्वसनीय हिंदी समाचार एवं ज्ञान मंच
        </p>
      </header>

      <div className="space-y-6 text-base leading-relaxed text-gray-700">
        <p>
          <strong>Gyanmitra News (ज्ञानमित्र न्यूज़)</strong> भारत का एक अग्रणी और विश्वसनीय डिजिटल हिंदी समाचार पोर्टल
          है, जो अपने पाठकों तक दिन-प्रतिदिन के ताज़ा घटनाक्रम, विश्लेषण और उपयोगी ज्ञान पहुँचाने के लिए समर्पित है।
          हमारा मुख्य उद्देश्य हिंदी पाठकों को गुणवत्तापूर्ण जानकारी से सशक्त बनाना है ताकि वे अपनी मातृभाषा में देश
          और दुनिया से जुड़े रहें।
        </p>

        <h2 className="text-2xl font-bold text-gray-900 pt-4">हमारी कवरेज के प्रमुख विषय</h2>
        <p>
          ज्ञानमित्र न्यूज़ पर हम केवल ब्रेकिंग न्यूज़ तक सीमित नहीं हैं, बल्कि ज्ञानवर्धक और समाजोपयोगी विषयों पर भी
          गहन सामग्री प्रदान करते हैं:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>समसामयिक घटनाक्रम (Current Affairs):</strong> स्थानीय, राज्य स्तरीय, राष्ट्रीय एवं अंतर्राष्ट्रीय मुख्य समाचार।</li>
          <li><strong>शिक्षा एवं प्रतियोगिताएं:</strong> युवाओं के लिए निबंध, भाषण, सामान्य ज्ञान प्रतियोगिताएं और करियर मार्गदर्शन।</li>
          <li><strong>सरकारी योजनाएं एवं जनहित:</strong> केंद्र एवं राज्य सरकारों की कल्याणकारी योजनाओं की सटीक जानकारी।</li>
          <li><strong>संस्कृति, अध्यात्म और जीवन मूल्य:</strong> भारतीय विरासत, महापुरुषों की जीवनियां, प्रेरक प्रसंग एवं धार्मिक उत्सव।</li>
          <li><strong>व्यापार एवं आर्थिक सुझाव:</strong> आम नागरिकों के लिए वित्तीय जागरूकता और बाज़ार के रुझान।</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 pt-4">युवा एवं महिला सशक्तिकरण</h2>
        <p>
          ज्ञानमित्र न्यूज़ की एक विशेष पहचान शिक्षा, युवा विकास और महिला सशक्तिकरण के प्रति हमारी प्रतिबद्धता है।
          हम उन सकारात्मक पहलों और प्रेरक कहानियों को मंच प्रदान करते हैं जो समाज में सकारात्मक बदलाव लाती हैं।
        </p>

        <h2 className="text-2xl font-bold text-gray-900 pt-4">संपादकीय निष्पक्षता एवं मूल्य</h2>
        <p>
          हम पत्रकारिता के उच्चतम नैतिक मानकों, तथ्यात्मक पुष्टि और निष्पक्षता का पालन करते हैं। किसी भी समाचार को
          प्रसारित करने से पूर्व प्राथमिक स्रोतों और आधिकारिक बयानों से उसकी प्रामाणिकता जांची जाती है।
        </p>

        <div className="mt-8 rounded-lg bg-gray-50 p-6 border border-gray-200 text-sm space-y-2">
          <h3 className="text-base font-bold text-gray-900">संपादक एवं प्रबंधन</h3>
          <p><strong>मुख्य संपादक:</strong> डॉ. कुंवर राणा प्रताप सिंह राणा (LLB, M.Com, MBA)</p>
          <p><strong>मुख्यालय:</strong> शिव मंदिर रोड, विकास नगर, चंदौसी, संभल, उत्तर प्रदेश – 244412</p>
          <p><strong>संपर्क ईमेल:</strong> <a href="mailto:gyanmitranews@gmail.com" className="text-blue-600 underline">gyanmitranews@gmail.com</a></p>
        </div>
      </div>
    </article>
  );
};
