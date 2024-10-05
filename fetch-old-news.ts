import { fetchNews } from './_fetch-news.ts';

const START_MONTH = 0;
const START_YEAR = 2022;

const today = new Date();
let date = 1;
let thatDate = new Date(START_YEAR, START_MONTH, date);

async function fetchHistory() {
  try {
    while (thatDate.getTime() < today.getTime()) {
      await fetchNews(thatDate);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      date++;
      thatDate = new Date(START_YEAR, START_MONTH, date);
    }
  } catch (err) {
    console.warn('下载失败，', (err as Error).message);
    process.exit(1);
  }
}

fetchHistory();
