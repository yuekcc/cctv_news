import { fetchNews } from "./fetch_news.js";

let startDate = 1;
let thatDate = new Date(2022, 0, startDate);
let today = new Date();

async function fetchHistory() {
  while (thatDate < today) {
    await fetchNews(thatDate);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    startDate++;
    thatDate = new Date(2022, 0, startDate);

    // break;
  }
}

fetchHistory()