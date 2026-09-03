import type { Metadata } from 'next';
import { Category as CategoryView } from '@/views/Category.pages';

interface Props {
  params: Promise<{ categoryName: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  'top news': 'टॉप न्यूज़ (Top News)',
  'top-news': 'टॉप न्यूज़ (Top News)',
  'topnews': 'टॉप न्यूज़ (Top News)',
  'sambhal': 'संभल (Sambhal)',
  'moradabad': 'मुरादाबाद (Moradabad)',
  'amroha': 'अमरोहा (Amroha)',
  'rampur': 'रामपुर (Rampur)',
  'pradesh': 'उत्तर प्रदेश (Pradesh)',
  'uttar pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
  'uttar-pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
  'desh': 'देश (National News)',
  'national': 'देश (National News)',
  'duniya': 'दुनिया (International News)',
  'videsh': 'विदेश (International News)',
  'international': 'अंतर्राष्ट्रीय (International)',
  'khel': 'खेल (Sports)',
  'sports': 'खेल (Sports)',
  'manoranjan': 'मनोरंजन (Entertainment)',
  'entertainment': 'मनोरंजन (Entertainment)',
  'education': 'शिक्षा एवं करियर (Education)',
  'shiksha': 'शिक्षा एवं करियर (Education)',
  'business': 'व्यापार और बाज़ार (Business)',
  'vyapar': 'व्यापार (Business)',
  'tech': 'तकनीक एवं टेक (Technology)',
  'technology': 'तकनीक (Technology)',
  'lifestyle': 'जीवनशैली और स्वास्थ्य (Lifestyle)',
  'health': 'स्वास्थ्य (Health)',
  'crime': 'अपराध (Crime)',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryName } = await params;
  const rawCategory = decodeURIComponent(categoryName).toLowerCase();
  const normalizedCategory = rawCategory.replace(/[-_]+/g, ' ').trim();

  const displayName =
    CATEGORY_NAMES[normalizedCategory] ||
    CATEGORY_NAMES[rawCategory] ||
    (rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1));

  const baseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');
  const canonical = `${baseURL}/categories/${encodeURIComponent(categoryName)}`;

  return {
    title: `${displayName} - ताज़ा हिंदी समाचार | Gyanmitra`,
    description: `पढ़ें ${displayName} की ताज़ा और मुख्य खबरें, ब्रेकिंग न्यूज़ और विशेष कवरेज ज्ञानमित्र न्यूज़ पर।`,
    alternates: { canonical },
    openGraph: {
      title: `${displayName} - ताज़ा हिंदी समाचार | Gyanmitra`,
      description: `पढ़ें ${displayName} की ताज़ा और मुख्य खबरें, ब्रेकिंग न्यूज़ और विशेष कवरेज ज्ञानमित्र न्यूज़ पर।`,
      url: canonical,
      type: 'website',
    },
  };
}

export default function CategoryPage() {
  return <CategoryView />;
}
