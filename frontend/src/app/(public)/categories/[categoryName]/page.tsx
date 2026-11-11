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
  'rajasthan': 'राजस्थान (Rajasthan)',
  'राजस्थान': 'राजस्थान (Rajasthan)',
  'uttarakhand': 'उत्तराखंड (Uttarakhand)',
  'उत्तराखंड': 'उत्तराखंड (Uttarakhand)',
  'haryana': 'हरियाणा (Haryana)',
  'हरियाणा': 'हरियाणा (Haryana)',
  'punjab': 'पंजाब (Punjab)',
  'पंजाब': 'पंजाब (Punjab)',
  'madhya pradesh': 'मध्य प्रदेश (Madhya Pradesh)',
  'madhya-pradesh': 'मध्य प्रदेश (Madhya Pradesh)',
  'मध्य प्रदेश': 'मध्य प्रदेश (Madhya Pradesh)',
  'bihar': 'बिहार (Bihar)',
  'बिहार': 'बिहार (Bihar)',
  'jharkhand': 'झारखंड (Jharkhand)',
  'झारखंड': 'झारखंड (Jharkhand)',
  'chhattisgarh': 'छत्तीसगढ़ (Chhattisgarh)',
  'छत्तीसगढ़': 'छत्तीसगढ़ (Chhattisgarh)',
  'dharmakarm': 'धर्मकर्म (Dharmkarm)',
  'dharm-karm': 'धर्मकर्म (Dharmkarm)',
  'धर्मकर्म': 'धर्मकर्म (Dharmkarm)',
  'धर्म-कर्म': 'धर्मकर्म (Dharmkarm)',
  'धर्म-अध्यात्म': 'धर्मकर्म (Dharmkarm)',
  'एंटरटेनमेंट': 'एंटरटेनमेंट (Entertainment)',
  'mahila hit': 'महिला हित (Women)',
  'mahila-hit': 'महिला हित (Women)',
  'महिला हित': 'महिला हित (Women)',
  'महिल हित': 'महिला हित (Women)',
  'utility': 'यूटिलिटी (Utility)',
  'यूटिलिटी': 'यूटिलिटी (Utility)',
  'youth': 'यूथ (Youth)',
  'यूथ': 'यूथ (Youth)',
};

async function getResolvedCategoryName(categoryName: string): Promise<string | null> {
  const rawApiUrl = (process.env.API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const apiBase = rawApiUrl.replace(/\/api\/?$/, '');

  try {
    const res = await fetch(
      `${apiBase}/api/categories/page/${encodeURIComponent(categoryName)}`,
      { next: { revalidate: 60 } }
    );
    if (res.ok) {
      const json = await res.json();
      return json?.data?.categoryName || null;
    }
  } catch (err) {
    console.error('Error fetching category metadata:', err);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryName } = await params;
  const rawCategory = decodeURIComponent(categoryName).toLowerCase();
  const normalizedCategory = rawCategory.replace(/[-_]+/g, ' ').trim();

  const displayName =
    CATEGORY_NAMES[normalizedCategory] ||
    CATEGORY_NAMES[rawCategory] ||
    (rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1));

  const baseURL = (process.env.WEBSITE_URL || 'https://gyanmitranews.com').replace(/\/+$/, '');

  // Always canonicalize to the category's resolved name so English/Hindi
  // aliases that map to the same category (see CATEGORY_SLUG_MAP on the
  // server) don't get indexed as separate duplicate pages.
  const resolvedName = await getResolvedCategoryName(categoryName);
  const canonicalSlug = resolvedName
    ? resolvedName.toLowerCase().replace(/\s+/g, '-')
    : categoryName;
  const canonical = `${baseURL}/categories/${encodeURIComponent(canonicalSlug)}`;

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
