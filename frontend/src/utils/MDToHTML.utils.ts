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
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(markdown);

    let html = String(file);
    // Wrap <table> tags in a responsive scroll container to prevent horizontal blowout on mobile
    html = html.replace(
      /<table(?:\s+[^>]*)?>[\s\S]*?<\/table>/gi,
      (match) => `<div class="overflow-x-auto my-4 max-w-full">${match}</div>`
    );

    return html;
  } catch (error) {
    console.error('Error processing markdown to HTML:', error);
    throw error;
  }
};
