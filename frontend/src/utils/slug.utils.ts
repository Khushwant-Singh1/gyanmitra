import axios from 'axios';

export const generateSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Validates whether an article slug is of sufficient quality for SEO / Sitemaps.
 * Filters out numeric dummy slugs (e.g. '14', '67-2', '9-1876-32'),
 * keyword-stuffed spam slugs (e.g. 'viral-tags-english-...'), and thin/placeholder slugs.
 */
export const isValidArticleSlug = (slug: string | null | undefined): boolean => {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim().toLowerCase();

  // 1. Must be at least 3 characters
  if (trimmed.length < 3) return false;

  // 2. Reject pure numeric or digit-dash/underscore patterns (e.g., '14', '67-2', '9-1876-32')
  if (/^[\d_-]+$/.test(trimmed)) return false;

  // 3. Reject keyword-stuffed spam slugs (e.g., containing 'viral-tags' or 'viral-tag')
  if (/viral-tags?/i.test(trimmed)) return false;

  // 4. Reject abnormally long keyword-stuffed slugs (e.g., > 140 chars)
  if (trimmed.length > 140) return false;

  // 5. Reject generic dummy/placeholder slugs
  const dummySlugs = new Set(['test', 'demo', 'sample', 'untitled', 'dummy', 'article', 'articles']);
  if (dummySlugs.has(trimmed)) return false;

  return true;
};

/**
 * Given a base slug, finds the first available variant (appending -2, -3, ...)
 * by checking against the API. `excludeArticleId` lets an article keep its own
 * unchanged slug during an edit.
 */
export const resolveUniqueSlug = async (
  baseSlug: string,
  excludeArticleId?: string
): Promise<string> => {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const response = await axios.get(`/api/articles/exists/${candidate}`);
    const { articleExists, _id } = response.data?.data ?? {};
    if (!articleExists || _id === excludeArticleId) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};
