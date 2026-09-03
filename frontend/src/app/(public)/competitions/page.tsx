import type { Metadata } from 'next';
import CompetitionHub from '@/views/CompetitionHub.page';

export const metadata: Metadata = {
  title: 'Competitions & Quizzes - Gyanmitra',
  description:
    'ज्ञानमित्र प्रतियोगिता हब - निबंध, पेंटिंग, क्विज़ और विभिन्न प्रतियोगिताओं में भाग लें और पुरस्कार जीतें।',
};

export default function CompetitionsPage() {
  return <CompetitionHub />;
}
