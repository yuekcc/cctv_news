import { parseHTML } from 'linkedom';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { getWeb } from './_get-web.ts';
import { htmlToMarkdown, formatMarkdown } from './_formatter.ts';

function writeFile(path: string, data: string) {
	return fs.writeFile(path, data, 'utf-8');
}

/**
 * 得到当前日期
 * @returns 当前日期，格式如：20220929
 */
const getDateStr = (date: Date) => {
	const add0 = (num: number) => (num < 10 ? `0${num}` : num);
	return `${date.getFullYear()}${add0(date.getMonth() + 1)}${add0(date.getDate())}`;
};

/**
 * 获取新闻列表
 * @param {String|Number} date 当前日期
 * @returns {Object} abstract为简介的链接, news为新闻链接数组
 */
async function pickUrls(date: string) {
	const url = `http://tv.cctv.com/lm/xwlb/day/${date}.shtml`;
	console.log('下载数据，URL =', url);
	const html = await getWeb(url);

	const fullHtml = `<!DOCTYPE html><html><head></head><body>${html}</body></html>`;
	const document = parseHTML(fullHtml).window.document;
	const nodes = Array.from(document.querySelectorAll('a'));

	const links: string[] = [];
	for (const node of nodes) {
		if (!links.includes(node.href)) {
			links.push(node.href);
		}
	}

	const abstractUrl = links.shift() ?? '';

	return {
		abstractUrl,
		newsUrls: links,
	};
}

async function queryElement(doc: Document, selectors: string[]): Promise<Element | null> {
	for (const selector of selectors) {
		const found = doc.querySelector(selector);
		if (found) {
			return found;
		}
	}

	return null;
}

/**
 * 新闻摘要
 */
async function fetchAbstract(url: string): Promise<NewsDetail> {
	const html = await getWeb(url);

	const selectors = [
		'div.chblock:nth-child(1) > div:nth-child(1) > div:nth-child(1) > p:nth-child(3)',
		'#page_body > div.allcontent > div.video18847 > div.playingCon > div.nrjianjie_shadow > div > ul > li:nth-child(1) > p',
	];

	const formatter = (x: string) => {
		return x
			.replaceAll(/^视频简介：/g, '')
			.replaceAll('；', '；\n\n')
			.replaceAll('：', '：\n\n');
	};

	const document = parseHTML(html).window.document;
	const abstract = await queryElement(document, selectors)
		.then((el) => el?.textContent ?? 'ABSTRACT_NOT_FOUND')
		.then(formatter);

	return { url: url, title: '摘要', content: abstract };
}

/**
 * 将 HTML 的块元素格式化为 Markdown 段落
 * @param {HTMLElement} contentAreaEl
 * @returns {string}
 */
function htmlToMarkdownPar(contentAreaEl: Element) {
	const html = contentAreaEl.innerHTML;
	return htmlToMarkdown(html);
}

interface NewsDetail {
	url: string;
	title: string;
	content: string;
}

async function fetchOnePost(url: string): Promise<NewsDetail> {
	const html = await getWeb(url);

	const dom = parseHTML(html);
	const document = dom.window.document;

	const titleSelectors = [
		'#page_body > div.allcontent > div.video18847 > div.playingVideo > div.tit',
		'.cnt_nav > h3:nth-child(2)',
	];

	const formatTitle = (x: string) => Promise.resolve(x.replace('[视频]', ''));

	const title = await queryElement(document, titleSelectors)
		.then((el) => el?.textContent ?? 'TITLE_NOT_FOUND')
		.then(formatTitle);

	const content = await queryElement(document, ['#content_area', '.cnt_bd']).then((el) => {
		return el ? htmlToMarkdownPar(el) : 'CONTENT_NOT_FOUND';
	});

	return { url, title, content };
}

// 获取报导
async function fetchPosts(urls: string[]): Promise<NewsDetail[]> {
	const size = urls.length;
	console.log(`共 ${size} 则新闻`);

	// 所有新闻
	const result = [];
	for (const url of urls) {
		try {
			const news = await fetchOnePost(url);
			result.push(news);
			console.log('.');
		} catch (err) {
			console.log('X', (err as Error).message);
		}
	}

	return result;
}

/**
 * 将数据处理为 md 格式
 * @param {Object} object date 为获取的时间，abstract 为新闻简介，news 为新闻数组，links 为新闻链接
 * @returns {String} 处理成功后的 md 文本
 */
const convertToMarkdown = ({
	date,
	abstract,
	newses,
}: { date: string; abstract: NewsDetail; newses: NewsDetail[] }) => {
	let buf = `# 《新闻联播》（${date}）\n\n`;
	if (abstract) {
		buf += `## 新闻摘要\n\n${abstract.content}\n\n[查看原文](${abstract.url})\n\n`;
		buf += '## 详细新闻\n\n';
	}

	const newses_ = newses || [];
	for (const news of newses_) {
		buf += `### ${news.title}\n\n${news.content}\n\n[查看原文](${news.url})\n\n`;
	}

	const now = new Date();
	buf += `\n----\n\n更新时间：${now.toJSON()}`;

	return buf;
};

export async function fetchNews(date: Date) {
	console.log('=========================');
  
	// 当前日期
	const DATE = getDateStr(date);
	// /news 目录
	const NEWS_PATH = path.join(process.cwd(), 'news');
	// /news/xxxxxxxx.md 文件
	const NEWS_MD_PATH = path.join(NEWS_PATH, `${DATE}.md`);

	console.log('DATE:', DATE);
	console.log('NEWS_PATH:', NEWS_PATH);

	const { abstractUrl, newsUrls } = await pickUrls(DATE);
	console.log(`取得摘要 URLs = ${abstractUrl ? 1 : 0}`, `取得详细新闻 URLs = ${newsUrls.length}`);

	const abstract = await fetchAbstract(abstractUrl);
	const newsDetails = await fetchPosts(newsUrls);

	const md = convertToMarkdown({
		date: DATE,
		abstract: abstract,
		newses: newsDetails,
	});

	await writeFile(NEWS_MD_PATH, await formatMarkdown(md));
	console.log('updated\n\n');
}
