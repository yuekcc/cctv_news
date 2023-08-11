import { fetchNews } from './fetch_news.js';

let startDate = 26;
let startMonth = 5;
let thatDate = new Date(2022, startMonth, startDate);
let today = new Date();

async function fetchHistory() {
  while (thatDate.getTime() < today.getTime()) {
    await fetchNews(thatDate);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    startDate++;
    thatDate = new Date(2022, startMonth, startDate);
  }
}

fetchHistory();
