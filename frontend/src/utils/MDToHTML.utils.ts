import rehypeFormat from 'rehype-format';
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export const MDToHTMLConverter = async (markdown: string): Promise<string> => {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(remarkGfm)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(markdown);

    return String(file);
  } catch (error) {
    console.error('Error processing markdown to HTML:', error);
    throw error;
  }
};
