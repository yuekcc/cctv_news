import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import path from 'path';
import { fileURLToPath } from 'url';

import getWeb from './fetch.js';

const readFile = (path) => fs.readFile(path, 'utf-8');
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
const getNewsList = async (date) => {
  const url = `http://tv.cctv.com/lm/xwlb/day/${date}.shtml`;
  console.log('下载新闻，url =', url);

  const HTML = await getWeb(url);
  const fullHTML = `<!DOCTYPE html><html><head></head><body>${HTML}</body></html>`;
  const dom = new JSDOM(fullHTML);
  const nodes = dom.window.document.querySelectorAll('a');
  var links = [];
  nodes.forEach((node) => {
    // 从dom节点获得href中的链接
    let link = node.href;
    // 如果已经有了就不再添加 (去重)
    if (!links.includes(link)) links.push(link);
  });
  const abstract = links.shift();
  console.log('成功获取新闻列表');
  return {
    abstract,
    news: links,
  };
};

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
 * @returns {String} 简介内容
 */
const getAbstract = async (link) => {
  const HTML = await getWeb(link);

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

  let abstract = trySelector(document, [selector1, selector2], formatter, '没有找到简介');
  console.log('成功获取新闻简介');
  return abstract;
};

/**
 * 将 HTML 的块元素格式化为 Markdown 段落
 * @param {HTMLElement} contentAreaEl
 */
const blockToMarkdownParagraphs = (contentAreaEl) => {
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
};

/**
 * 获取新闻本体
 * @param {Array} links 链接数组
 * @returns {Object} title为新闻标题, content为新闻内容
 */
const getNews = async (links) => {
  const linksLength = links.length;
  console.log('共', linksLength, '则新闻, 开始获取');
  // 所有新闻
  var news = [];
  for (let i = 0; i < linksLength; i++) {
    const url = links[i];
    const html = await getWeb(url);
    const dom = new JSDOM(html);

    const document = dom.window.document;

    const titleSelector1 = '#page_body > div.allcontent > div.video18847 > div.playingVideo > div.tit';
    const titleSelector2 = '.cnt_nav > h3:nth-child(2)';
    const formatTitle = (x) => x.replace('[视频]', '');
    const title = trySelector(document, [titleSelector1, titleSelector2], formatTitle, 'NO_TITLE');

    const contentSelector1 = '#content_area';
    const contentSelector2 = '.cnt_bd';
    const content = trySelector(document, [contentSelector1, contentSelector2], blockToMarkdownParagraphs, 'NO_CONTENT', true);

    news.push({ title, content });
    console.count('获取的新闻则数');
  }
  console.log('成功获取所有新闻');
  return news;
};

/**
 * 将数据处理为md格式
 * @param {Object} object date为获取的时间, abstract为新闻简介, news为新闻数组, links为新闻链接
 * @returns {String} 处理成功后的md文本
 */
const newsToMarkdown = ({ date, abstract, news, links }) => {
  // 将数据处理为md文档
  let mdNews = '';
  const newsLength = news.length;
  for (let i = 0; i < newsLength; i++) {
    const { title, content } = news[i];
    const link = links[i];
    mdNews += `### ${title}\n\n${content}\n\n[查看原文](${link})\n\n`;
  }
  return `# 《新闻联播》 (${date})\n\n## 新闻摘要\n\n${abstract}\n\n## 详细新闻\n\n${mdNews}\n\n---\n\n(更新时间戳: ${new Date().getTime()})\n\n`;
};

const saveTextToFile = async (savePath, text) => {
  // 输出到文件
  await writeFile(savePath, text);
};

const updateCatalogue = async ({ catalogueJsonPath, readmeMdPath, date, abstract }) => {
  // 更新 catalogue.json
  await readFile(catalogueJsonPath).then(async (data) => {
    data = data.toString();
    let catalogueJson = JSON.parse(data || '[]');
    catalogueJson.unshift({
      date,
      abstract,
    });
    let textJson = JSON.stringify(catalogueJson);
    await writeFile(catalogueJsonPath, textJson);
  });
  console.log('更新 catalogue.json 完成');
  // 更新 README.md
  await readFile(readmeMdPath).then(async (data) => {
    data = data.toString();
    let text = data.replace('<!-- INSERT -->', `<!-- INSERT -->\n- [${date}](./news/${date}.md)`);
    await writeFile(readmeMdPath, text);
  });
  console.log('更新 README.md 完成');
};

export async function fetchNews(date) {
  console.log('\n\n=========================\n\n');

  // 当前日期
  const DATE = getDate(date);
  // /news 目录
  const NEWS_PATH = path.join(__dirname, 'news');
  // /news/xxxxxxxx.md 文件
  const NEWS_MD_PATH = path.join(NEWS_PATH, DATE + '.md');
  // /README.md 文件
  const README_PATH = path.join(__dirname, 'README.md');
  // /news/catalogue.json 文件
  const CATALOGUE_JSON_PATH = path.join(NEWS_PATH, 'catalogue.json');
  // 打印调试信息
  console.log('DATE:', DATE);
  console.log('NEWS_PATH:', NEWS_PATH);
  console.log('README_PATH:', README_PATH);
  console.log('CATALOGUE_JSON_PATH:', CATALOGUE_JSON_PATH);

  const newsList = await getNewsList(DATE);
  const abstract = await getAbstract(newsList.abstract);
  const news = await getNews(newsList.news);
  const md = newsToMarkdown({
    date: DATE,
    abstract,
    news,
    links: newsList.news,
  });
  await saveTextToFile(NEWS_MD_PATH, md);
  await updateCatalogue({
    catalogueJsonPath: CATALOGUE_JSON_PATH,
    readmeMdPath: README_PATH,
    date: DATE,
    abstract: abstract,
  });
  console.log('全部成功, 程序结束');
}
