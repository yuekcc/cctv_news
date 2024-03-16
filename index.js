import { fetchNews } from './fetch_news.js';


const today = new Date(); // 本地时间

// UTC+8 时间
const cnToday = new Date(
  Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    today.getUTCHours(),
    today.getUTCMinutes() + 480,
    today.getUTCSeconds(),
  ),
);
const yesterday = new Date(cnToday.getFullYear(), cnToday.getMonth(), cnToday.getDate() - 1, 12, 0, 0);

// 获取昨天的数据
fetchNews(yesterday);
