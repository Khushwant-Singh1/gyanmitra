import type { Metadata } from 'next';
import { SignIn as SignInView } from '@/views/SignIn.pages';

export const metadata: Metadata = {
  title: 'Sign In - Gyanmitra',
  description: 'ज्ञानमित्र खाते में साइन इन करें।',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInView />;
}
