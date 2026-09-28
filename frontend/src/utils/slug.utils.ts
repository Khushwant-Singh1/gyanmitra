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
