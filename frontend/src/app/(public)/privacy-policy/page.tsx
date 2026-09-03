import type { Metadata } from 'next';
import { PrivacyPolicy as PrivacyPolicyView } from '@/views/PrivacyPolicy.pages';

export const metadata: Metadata = {
  title: 'Privacy Policy - Gyanmitra',
  description: 'ज्ञानमित्र न्यूज़ की गोपनीयता नीति और डेटा सुरक्षा संबंधी जानकारी।',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
