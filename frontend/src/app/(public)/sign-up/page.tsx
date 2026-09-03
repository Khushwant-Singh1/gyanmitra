import type { Metadata } from 'next';
import { SignUp as SignUpView } from '@/views/SignUp.pages';

export const metadata: Metadata = {
  title: 'Sign Up - Gyanmitra',
  description: 'ज्ञानमित्र में शामिल हों।',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUpView />;
}
