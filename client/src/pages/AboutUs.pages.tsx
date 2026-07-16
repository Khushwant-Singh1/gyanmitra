import { Spinner } from '@/components/Spinner.components';
import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';
import React, { useEffect, useState } from 'react';

const ABOUT_US_MARKDOWN = `
&#x20;**About Us**

**Gyanmitra News** is a premier Hindi news portal dedicated to delivering daily updates across a wide range of topics. Our mission is to provide valuable information to Hindi readers, empowering them to stay informed and expand their knowledge in their native language.

Our content covers diverse subjects, including current affairs, biographies, general knowledge, government schemes, poetry, stories, and financial tips. We are committed to presenting accurate, engaging, and insightful information to ensure our readers have access to high-quality content in Hindi.

At **Gyanmitra News**, we are particularly focused on education, youth empowerment, and women's empowerment. Our platform actively promotes initiatives and stories that inspire growth, equality, and progress in these areas.

Recognized among India's top Hindi news platforms, we are dedicated to motivating and guiding our readers toward success. Through our content, we share valuable insights on life and success, encouraging individuals to lead better and more fulfilling lives.

We also extend our reach across various social media platforms, including **X (formerly Twitter), YouTube, Instagram, Facebook, and Telegram**, under the same name, spreading knowledge and awareness.

Our future goal is to build a strong community, collaborate with like-minded individuals, and continue advancing in the digital world to achieve greater milestones.

Thank you for being a part of our journey. Stay informed, stay inspired!
`;

export const AboutUs: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processContent = async () => {
      try {
        const htmlContent = await MDToHTMLConverter(ABOUT_US_MARKDOWN);
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
