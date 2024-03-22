import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import prettier from 'prettier';

export async function htmlToMarkdown(html: string): Promise<string> {
	const result = await unified().use(rehypeParse).use(rehypeRemark).use(remarkGfm).use(remarkStringify).process(html);
	return String(result);
}

export function formatMarkdown(content: string): Promise<string> {
	return prettier.format(content, { parser: 'markdown', printWidth: 120 });
}
