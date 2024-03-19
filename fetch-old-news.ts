import { fetchNews } from './_fetch-news.ts';

let startDate = 1;
const startMonth = 0;
const startYear = 2022;
let thatDate = new Date(startYear, startMonth, startDate);
const today = new Date();

async function fetchHistory() {
  try {
    while (thatDate.getTime() < today.getTime()) {
      await fetchNews(thatDate);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      startDate++;
      thatDate = new Date(startYear, startMonth, startDate);
    }
  } catch (err) {
    console.warn('下载失败，', (err as Error).message);
    process.exit(1);
  }
}

fetchHistory();
