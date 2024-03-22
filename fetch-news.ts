import { fetchNews } from './_fetch-news.ts';

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
const yesterday = new Date(
	Date.UTC(cnToday.getUTCFullYear(), cnToday.getUTCMonth(), cnToday.getUTCDate() - 1, 0, 0, 0),
);

// 获取昨天的数据
fetchNews(yesterday);
