import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import path from 'path';
import { fileURLToPath } from 'url';

import fetchweb from './fetch.js';

const writeFile = (path, data) => fs.writeFile(path, data, 'utf-8');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 得到当前日期
 * @returns 当前日期, 格式如: 20220929
 */
const getDate = (date) => {
  const add0 = (num) => (num < 10 ? '0' + num : num);
  return '' + date.getFullYear() + add0(date.getMonth() + 1) + add0(date.getDate());
};

/**
 * 获取新闻列表
 * @param {String|Number} date 当前日期
 * @returns {Object} abstract为简介的链接, news为新闻链接数组
 */
async function fetchLinks(date) {
  const url = `http://tv.cctv.com/lm/xwlb/day/${date}.shtml`;
  console.log('下载数据，URL =', url);

  const html = await fetchweb(url);
  const fullHTML = `<!DOCTYPE html><html><head></head><body>${html}</body></html>`;
  const dom = new JSDOM(fullHTML);
  const nodes = dom.window.document.querySelectorAll('a');

  var links = [];
  nodes.forEach((node) => {
    // 从dom节点获得href中的链接
    let link = node.href;
    // 如果已经有了就不再添加 (去重)
    if (!links.includes(link)) links.push(link);
  });

  const abstractUrl = links.shift();

  return {
    abstractUrl,
    newsUrls: links,
  };
}

function trySelector(el, selectors, formatter, defaultValue, useEl) {
  for (let selector of selectors) {
    const selected = el.querySelector(selector);
    if (selected) {
      if (useEl) {
        return formatter(selected);
      } else {
        return formatter(selected.textContent);
      }
    }
  }

  return defaultValue;
}

/**
 * 获取新闻摘要 (简介)
 * @param {String} link 简介的链接
 * @returns {{url: string; content: string}} 简介内容
 */
async function fetchAbstract(link) {
  const HTML = await fetchweb(link);

  const selector1 = `div.chblock:nth-child(1) > div:nth-child(1) > div:nth-child(1) > p:nth-child(3)`;
  const selector2 = `#page_body > div.allcontent > div.video18847 > div.playingCon > div.nrjianjie_shadow > div > ul > li:nth-child(1) > p`;
  const formatter = (x) => {
    return x
      .replaceAll(/^视频简介：/g, '')
      .replaceAll('；', '；\n\n')
      .replaceAll('：', '：\n\n');
  };

  const dom = new JSDOM(HTML);
  const document = dom.window.document;

  let abstract = trySelector(document, [selector1, selector2], formatter, 'ABSTRACT NOT FOUND');
  return { url: link, content: abstract };
}

/**
 * 将 HTML 的块元素格式化为 Markdown 段落
 * @param {HTMLElement} contentAreaEl
 * @returns {string}
 */
function htmlToMarkdownPar(contentAreaEl) {
  let result = [];
  let el = contentAreaEl?.firstChild;
  while (el) {
    // nodeType === 8 是注释
    if (el.nodeType !== 8) {
      result.push(el.textContent);
    }
    el = el.nextSibling;
  }

  return result.join('\n\n');
}

/**
 * 获取新闻本体
 * @param {Array<string>} links 链接数组
 * @returns {Array<{url: string; title: string; content: string}>}
 */
async function fetchNewsDetails(links) {
  const size = links.length;
  console.log(`共 ${size} 则新闻`);

  // 所有新闻
  const result = [];
  for (let i = 0; i < size; i++) {
    try {
      const url = links[i];
      const html = await fetchweb(url);

      const dom = new JSDOM(html);
      const document = dom.window.document;

      const titleSelector1 = '#page_body > div.allcontent > div.video18847 > div.playingVideo > div.tit';
      const titleSelector2 = '.cnt_nav > h3:nth-child(2)';
      const formatTitle = (x) => x.replace('[视频]', '');
      const title = trySelector(document, [titleSelector1, titleSelector2], formatTitle, 'TITLE NOTFOUND');

      const contentSelector1 = '#content_area';
      const contentSelector2 = '.cnt_bd';
      const content = trySelector(document, [contentSelector1, contentSelector2], htmlToMarkdownPar, 'CONTENT NOTFOUND', true);

      result.push({ url, title, content });
      console.log('.');
    } catch (err) {
      console.log('X', err.message);
    }
  }

  return result;
}

/**
 * 将数据处理为md格式
 * @param {Object} object date为获取的时间, abstract为新闻简介, news为新闻数组, links为新闻链接
 * @returns {String} 处理成功后的md文本
 */
const toMarkdownPost = ({ date, abstract, newses }) => {
  let buf = `# 《新闻联播》（${date}）\n\n`;
  if (abstract) {
    buf += `## 新闻摘要\n\n${abstract.content}\n\n[查看原文](${abstract.url})\n\n`;
    buf += `## 详细新闻\n\n`;
  }

  const newses_ = newses || [];
  for (const news of newses_) {
    buf += `### ${news.title}\n\n${news.content}\n\n[查看原文](${news.url})\n\n`;
  }

  const now = new Date();
  buf += `\n----\n\n更新时间：${now.toJSON()}`;

  return buf;
};

export async function fetchNews(date) {
  console.log('=========================');

  // 当前日期
  const DATE = getDate(date);
  // /news 目录
  const NEWS_PATH = path.join(__dirname, 'news');
  // /news/xxxxxxxx.md 文件
  const NEWS_MD_PATH = path.join(NEWS_PATH, DATE + '.md');

  // 打印调试信息
  console.log('DATE:', DATE);
  console.log('NEWS_PATH:', NEWS_PATH);

  const { abstractUrl, newsUrls } = await fetchLinks(DATE);
  console.log('取得摘要 URL =', abstractUrl ? 1 : 0, '取得详细新闻 URL =', newsUrls.length);

  const abstract = await fetchAbstract(abstractUrl);
  const newses = await fetchNewsDetails(newsUrls);

  const md = toMarkdownPost({
    date: DATE,
    abstract: abstract,
    newses,
  });

  await writeFile(NEWS_MD_PATH, md);
  console.log('updated\n\n');
}
