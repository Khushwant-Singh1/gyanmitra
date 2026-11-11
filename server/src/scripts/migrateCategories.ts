 import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Article } from '../models/article.models';
import { Category } from '../models/category.models';

dotenv.config();

const CATEGORY_GROUPS = [
  {
    name: 'राजस्थान',
    aliases: ['राजस्थान', 'rajasthan'],
  },
  {
    name: 'उत्तर प्रदेश',
    aliases: ['उत्तर प्रदेश', 'उत्तरप्रदेश', 'uttar pradesh', 'uttarpradesh', 'up'],
  },
  {
    name: 'उत्तराखंड',
    aliases: ['उत्तराखंड', 'उत्तराखण्ड', 'uttarakhand', 'uttaranchal'],
  },
  {
    name: 'हरियाणा',
    aliases: ['हरियाणा', 'haryana'],
  },
  {
    name: 'पंजाब',
    aliases: ['पंजाब', 'punjab'],
  },
  {
    name: 'मध्य प्रदेश',
    aliases: ['मध्य प्रदेश', 'मध्यप्रदेश', 'madhya pradesh', 'madhyapradesh'],
  },
  {
    name: 'बिहार',
    aliases: ['बिहार', 'bihar'],
  },
  {
    name: 'झारखंड',
    aliases: ['झारखंड', 'झारखण्ड', 'jharkhand'],
  },
  {
    name: 'छत्तीसगढ़',
    aliases: ['छत्तीसगढ़', 'छत्तीसगढ़', 'chhattisgarh'],
  },
  {
    name: 'धर्मकर्म',
    aliases: ['धर्मकर्म', 'धर्म कर्म', 'धर्म-कर्म', 'dharmakarm', 'dharma karma'],
  },
  {
    name: 'एंटरटेनमेंट',
    aliases: ['एंटरटेनमेंट', 'मनोरंजन', 'entertainment', 'manoranjan'],
  },
  {
    name: 'महिला हित',
    aliases: ['महिला हित', 'महिल हित', 'महिलाहित', 'women interest', 'mahila hit'],
  },
  {
    name: 'यूटिलिटी',
    aliases: ['यूटिलिटी', 'utility'],
  },
  {
    name: 'यूथ',
    aliases: ['यूथ', 'youth'],
  },
] as const;

const ARTICLE_PARENT_ALIASES = [
  'article',
  'articles',
  'आर्टिकल',
  'अर्टिकल',
  'आर्टिकल्स',
  'अर्टिकल्स',
];

const normalizeName = (name: string) =>
  name.toLocaleLowerCase().replace(/[\s_-]+/g, '');

const findMatchingCategories = (
  categories: mongoose.Document[],
  aliases: readonly string[]
) => {
  const aliasSet = new Set(aliases.map(normalizeName));
  return categories.filter((category) =>
    aliasSet.has(normalizeName(String(category.get('name'))))
  );
};

const getSingleMatch = (
  categories: mongoose.Document[],
  aliases: readonly string[],
  label: string
) => {
  const matches = findMatchingCategories(categories, aliases);
  if (matches.length > 1) {
    throw new Error(
      `Multiple categories match "${label}": ${matches
        .map((category) => category.get('name'))
        .join(', ')}`
    );
  }
  return matches[0];
};

export async function migrateCategories() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required to migrate categories.');
  }

  await mongoose.connect(uri);

  const categories = await Category.find();
  const articleParent = getSingleMatch(
    categories,
    ARTICLE_PARENT_ALIASES,
    'Article parent'
  );

  if (articleParent) {
    const articlesAssignedToParent = await Article.countDocuments({
      categoryId: articleParent._id,
    });
    if (articlesAssignedToParent > 0) {
      throw new Error(
        `Cannot remove "${articleParent.get('name')}": ${articlesAssignedToParent} articles are assigned directly to it. Reassign them first.`
      );
    }
  }

  const categoryMatches = CATEGORY_GROUPS.map((group) => ({
    group,
    category: getSingleMatch(categories, group.aliases, group.name),
  }));
  const nextRootIndex = () => {
    const rootIndexes = categories
      .filter((category) => !category.get('parentId'))
      .map((category) => Number(category.get('index')))
      .filter(Number.isFinite);
    return Math.max(0, ...rootIndexes) + 1;
  };
  let index = nextRootIndex();

  if (articleParent) {
    const children = categories.filter(
      (category) =>
        String(category.get('parentId') || '') ===
        String(articleParent._id)
    );
    for (const child of children) {
      child.set({ parentId: undefined, index: index++ });
      await child.save();
    }
    await articleParent.deleteOne();
  }

  for (const { group, category: existingCategory } of categoryMatches) {
    const category =
      existingCategory ||
      new Category({
        name: group.name,
        isActive: true,
        index: index++,
      });

    category.set({
      name: group.name,
      parentId: undefined,
      isActive: true,
      index: category.get('index') || index++,
    });

    await category.save();
  }

  console.log(
    `Category migration complete. Ensured ${CATEGORY_GROUPS.length} categories and removed the Article parent.`
  );
}

if (require.main === module) {
  void migrateCategories()
    .catch((error: unknown) => {
      console.error('Category migration failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}
