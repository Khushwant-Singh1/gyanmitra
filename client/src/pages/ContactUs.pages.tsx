import { Spinner } from '@/components/Spinner.components';
import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';
import React, { useEffect, useState } from 'react';

const CONTACT_US_MARKDOWN = `
### Contact Us

📌 **Gyanmitra News - Digital Platform**
**Editor:** Dr. Kunwar Rana Pratap Singh Rana, LLB, Mcom, MBA
📞 **Phone:** 7500801004
✉ **Email:** [gyanmitranews@gmail.com](mailto:gyanmitranews@gmail.com)

#### **Head Office**

Shiv Mandir Road, Vikas Nagar, Chandausi, Near Sai Eye Hospital, Sambhal – 244412

#### **Uttar Pradesh Offices**

📍 **Lucknow:** MM 1/850, Vinay Khand 1, Gomtinagar, Lucknow – 224010
📍 **Agra:** 46/175F, Ber Ka Nagla, Jagdishpura, Agra – 282002

#### **Uttarakhand Office**

RK Tent House Road, Kusumkheda, Indira Colony Phase-2, Haldwani (Nainital) – 263139

#### **Jharkhand Office**

Makdampur (Near Ram Mandir Talab), P.S. Parsudih, P.O. Tatanagar, Jamshedpur – 831002
`;

export const ContactUs: React.FC = () => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processContent = async () => {
      try {
        const htmlContent = await MDToHTMLConverter(CONTACT_US_MARKDOWN);
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
