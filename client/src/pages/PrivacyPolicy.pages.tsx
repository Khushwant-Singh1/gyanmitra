import { Spinner } from '@/components/Spinner.components';
import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';
import React, { useEffect, useState } from 'react';

const PRIVACY_POLICY_MARKDOWN = `
**PRIVACY POLICY**

At Gyanmitra News, we prioritize the privacy of everyone visiting our website. We are dedicated to protecting your personal information and ensuring transparency about the data we collect, how it is used, and who it is shared with.

This Privacy Policy applies to all interactions with our website, mobile applications, or other online services (collectively referred to as "Services") that are linked to this policy. It does not apply to information collected through other channels by Gyanmitra News or its affiliated entities. By using our Services, you consent to the terms outlined in this Privacy Policy.

We reserve the right to update or modify this Privacy Policy at any time.

**INFORMATION WE COLLECT**

We gather information directly from users, and third parties, and automatically through our websites and mobile applications.

To access certain Services, users may need to provide personal details such as name, age, gender, contact number, email address, and demographic information (e.g., area, location, IP address). For added convenience, users can register on any of our sites and use the same login credentials to access other sites (Single Sign-On feature). You may also choose to register or link your account via third-party accounts, such as Facebook or Google.

We collect basic information about your internet connection, including your IP address, when you visit our website. While your IP address does not identify you personally, we also collect and may store data provided by your computer or mobile device, such as browser type, device type, browser language, IP address, mobile carrier, unique device identifier, location, and URLs of pages visited or referred to.

Additionally, we collect information when you engage with our content or interact with our website/apps, even if you do not have an account. This data is used to deliver web pages, tailor the site to user interests, and measure traffic. Advertisers and third-party companies may also use this information to personalize content and advertisements.

**HOW WE COLLECT INFORMATION**

a) We collect information directly from you when you register with us.

b) We collect information (whether you are registered or not registered with us) when you browse our sites/apps, open or respond to an email from us (promotional or informational),

c) When you post a comment on our website or raise a query/question to us through phone or email.

d) We collect information from you when you register with us by linking your social media or third-party accounts. By doing this, you are authorizing them to share with us certain information from such accounts, and authorizing us to collect, store, and use this by this Privacy Policy.

e) We collect information from you using third-party tools, browser cookies, and web beacons to improve user experience.

f) Device Information We may collect non-personal information about the computer, mobile device, or other device you use to access the service, such as IP address, geolocation information, unique device identifiers, browser type, browser language, and other information to provide customized information on the browser.

g) Location Information Our mobile applications and websites may capture your current location if you choose to enable the GPS feature in the app or browser.

**COOKIE POLICY, PIXELS AND TRACKING**

Cookies are small text files that contain a small amount of information that is downloaded to your computer or mobile device when you visit a website. When you visit the website again or visit a partner website that recognizes that cookie, your device can communicate with our website and the website can read the information held in that cookie.

We use cookies to help you efficiently browse our websites and to save you time by not having to re-enter your details/preferences each time you visit. Cookies allow us to provide you with information and show you content relevant to you. We also use Cookies to analyze how our customers interact with our websites so we can improve the customer journey.

You can choose to accept or decline cookies in your browser settings. Most web browsers automatically accept cookies, but you can usually modify your browser settings to reject cookies if you prefer. You may find more help about managing cookies in your browser: Chrome, Internet Explorer, Mozilla Firefox & Safari. This may prevent you from having a complete website experience by affecting access to some of the links, services, or features. Information collected by cookies and web beacons is not personally identifiable.

**HOW WE USE THE INFORMATION**

a) **To Provide and Manage the Services You Request**: This includes tasks such as processing your subscription, sending electronic newsletters, and enabling access to features offered by our Services. It also involves providing personalized content and recommendations tailored to your interests and needs, including via email.

b) **To Reach You**: We may periodically contact you with updates and information about our Services and those of our affiliates, including information related to your accounts, surveys, legal notices, new features, and other important matters. You can opt out of receiving marketing emails by following the instructions in the emails you receive.

c) **To Customize Advertising**: We may use your information to deliver targeted ads, promotions, and offers, both on and off our Services, for our purposes and on behalf of advertisers.

d) **To Understand Our Readers and Users**: We conduct research based on the information we collect about our users' demographics, interests, and behaviors. This helps us better understand and serve our audience, as well as improve our products and services.

e) **To Protect the Rights of the Services and Others**: We may use your information as necessary to protect, enforce, or defend the legal rights, privacy, safety, or property of the Services, its employees, agents, or other users, or to comply with applicable law.

f) **With Your Consent**: We may use your information with your consent or as directed by you.

**HOW WE SHARE YOUR INFORMATION**

a) **Logging In Through Social Media Services**: If you log into the Services using a social media account or connect a social media account with the Services, we may share your information with that social media service. The use of shared information by the social media service will be governed by its privacy policy and your account settings. If you do not wish for your information to be shared this way, avoid connecting your social media account with our Services.

b) **Business Partners**: We may share your information with business partners to provide the services you have requested.

c) **Service Providers**: We may share information with vendors providing services like hosting, advertising, and payment processing.

d) **Other Parties When Required by Law or to Protect Our Users and Services**: We may share your personal information as necessary to protect the legal rights, privacy, safety, or property of the Services, employees, agents, or users, or to comply with legal processes or requests from government authorities.

e) **Affiliates**: We may share information within our family of affiliated companies and business partners.

f) **Third Parties Providing Content, Advertising, or Functionality**: Third parties may collect information about you and your usage of the Services using cookies and similar technologies. This information may be used to provide or measure content, advertising, or functionality, and may be combined with data collected across different sites or devices.

g) **Corporate Transactions**: In the event of a sale, merger, or transfer of business or assets, we may transfer your information as part of the transaction.

h) **With Your Consent or Direction**: We may share your information with third parties when you give us consent to do so.

i) **Aggregated Data**: We may share non-identifiable aggregated data about user activities with third parties for research or analysis purposes.

j) **Links to Third-Party Sites**: Our Services may contain links to external websites. We are not responsible for the privacy practices of these websites, and you should review their privacy policies.

**ACCESS TO PERSONAL INFORMATION**
You may access or modify your personal information by logging into the website. While we do not alter the information you provide, you should update it as necessary. Upon request, we will close your account and remove your personal information from view, except where retention is required by law or for specific purposes like investigating potential violations, complying with legal obligations, or addressing security issues.

**OPTING OUT**
If we have your contact information, we may send you updates about our products, services, and events via email. Would you prefer not to receive marketing communications? In that case, you can unsubscribe using the link in the email, or contact us directly via the email provided in the "Contact Us" section of our website. Just to let you know, opting out may limit our ability to provide certain services. We will update your preferences as soon as reasonably possible, but your information may remain in the databases of affiliates, partners, or business associates with whom we have already shared it.
`;

export const PrivacyPolicy: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processContent = async () => {
      try {
        const htmlContent = await MDToHTMLConverter(PRIVACY_POLICY_MARKDOWN);
        setContent(htmlContent);
      } catch (error) {
        console.error('Markdown processing error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    processContent();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className="prose my-10 min-w-full"
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
};
