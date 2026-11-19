import type { Metadata } from 'next';
import { PrivacyPolicy as PrivacyPolicyView } from '@/views/PrivacyPolicy.pages';

export const metadata: Metadata = {
  title: 'Privacy Policy - Gyanmitra News',
  description:
    'Privacy Policy of Gyanmitra News - Information collection, data usage, cookies, user rights, and Grievance Officer contact details.',
  alternates: {
    canonical: 'https://gyanmitranews.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
