import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function getFilenameFromUrl(url: string): string {
  const filename = url.split('/').at(-1) ?? 'no_name';
  return path.join(process.cwd(), 'dump_htmls', filename);
}

function dumpHtml(url: string, content: string) {
  const filename = getFilenameFromUrl(url);
  return fs.writeFile(filename, content, 'utf-8');
}

async function loadDumpedFile(url: string): Promise<string | null> {
  try {
    const filename = getFilenameFromUrl(url);
    await fs.access(filename);
    return fs.readFile(filename, 'utf-8');
  } catch {
    return null;
  }
}

function mkDummyHeaders(referer: string): Record<string, string> {
  return {
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'accept': 'text/html, */*; q=0.01',
    'cache-control': 'no-cache',
    'cookie': 'cna=eY6BGb2h7yACAbSMsOm2vFG2; sca=5a4237a6; atpsida=6e052f524a88bc925aed09c0_1664038526_68',
    'pragma': 'no-cache',
    'Referer': referer,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua': '"Microsoft Edge";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-requested-with': 'XMLHttpRequest',
  };
}

export async function getWeb(url: string) {
  // 尝试读取已经存在的文件
  const html = await loadDumpedFile(url);
  if (html) {
    return html;
  }

  const abort = new AbortController();
  const signal = abort.signal;

  const timeoutHandle = setTimeout(() => abort.abort(new Error('TIMEOUT')), 60 * 1000);

  try {
    const res = await fetch(url, {
      signal,
      headers: mkDummyHeaders(url),
    });
    const content = await res.text();
    dumpHtml(url, content);

    return content;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
