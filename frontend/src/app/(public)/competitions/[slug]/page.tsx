import type { Metadata } from 'next';
import CompetitionDetails from '@/views/CompetitionDetails.page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${decodeURIComponent(slug)} - Competition | Gyanmitra`,
    description: 'ज्ञानमित्र प्रतियोगिता विवरण एवं पंजीकरण।',
  };
}

export default function CompetitionDetailPage() {
  return <CompetitionDetails />;
}
