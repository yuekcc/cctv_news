import { fetchNews } from "./fetch_news.js";

// 获取昨天的数据
const today = new Date()
const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12, 0, 0)
fetchNews(yesterday);
