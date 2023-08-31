import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import remarkGfm from 'remark-gfm';

export async function formatHtml(html) {
  const result = await unified().use(rehypeParse).use(rehypeRemark).use(remarkGfm).use(remarkStringify).process(html);
  return String(result)
}
