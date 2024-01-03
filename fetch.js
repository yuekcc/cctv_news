import fs from 'node:fs/promises';
import path from 'node:path';

function getFilenameFromUrl(url) {
  const filename = url.split('/').at(-1);
  return path.join(process.cwd(), 'dump_htmls', filename);
}

function dumpHtml(url, content) {
  const filename = getFilenameFromUrl(url);
  return fs.writeFile(filename, content, 'utf-8');
}

async function tryDumpedFile(url) {
  try {
    const filename = getFilenameFromUrl(url);
    await fs.access(filename);

    return fs.readFile(filename, 'utf-8');
  } catch {
    return null;
  }
}

export default async function (url) {
  // 尝试读取已经存在的文件
  const html = await tryDumpedFile(url);
  if (html) {
    return html;
  }

  const abort = new AbortController();
  const signal = abort.signal;

  const timeoutHandle = setTimeout(() => abort.abort(new Error('TIMEOUT')), 60 * 1000);

  return fetch(url, {
    signal,
    headers: {
      accept: 'text/html, */*; q=0.01',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-requested-with': 'XMLHttpRequest',
      'cookie': 'cna=eY6BGb2h7yACAbSMsOm2vFG2; sca=5a4237a6; atpsida=6e052f524a88bc925aed09c0_1664038526_68',
      'Referer': url,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body: null,
    method: 'GET',
  })
    .then((res) => {
      return res.text();
    })
    .then((content) => {
      dumpHtml(url, content);
      return content;
    })
    .finally(() => {
      clearTimeout(timeoutHandle);
    });
}
