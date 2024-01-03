import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

export async function formatHtml(html) {
  const result = await unified().use(rehypeParse).use(rehypeRemark).use(remarkGfm).use(remarkStringify).process(html);
  return String(result);
}
