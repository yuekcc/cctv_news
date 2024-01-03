import fs from 'node:fs/promises';

const list = await fs.readdir('./news');

if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (comparer) {
    const list = structuredClone(this);
    list.sort(comparer);

    return list;
  };
}

function printLink(name) {
  return `[${name.replaceAll(/\.md$/g, '')}](./news/${name}.md)`;
}

function chunk(myList, size) {
  const groupedList = [];
  for (let i = 0; i < myList.length; i += size) {
    groupedList.push(myList.slice(i, i + size));
  }

  return groupedList;
}

const grouped = list
  .filter((name) => name !== 'catalogue.json')
  .map((name) => name.replaceAll(/\.md$/g, ''))
  .reduce((g, it) => {
    const key = it.substring(0, 6);
    const list = g[key] || [];
    list.push(it);
    g[key] = list;

    return g;
  }, {});

let buf = '# 目录\n\n';

// biome-ignore lint/complexity/noForEach: <explanation>
Object.entries(grouped)
  .toSorted((a, b) => {
    return parseInt(b[0]) - parseInt(a[0]);
  })
  .forEach(([name, list]) => {
    buf += `## ${name}\n\n`;

    buf += '| 1 | 2 | 3 | 4 | 5 | 6 | 7 |\n';
    buf += '|---|---|---|---|---|---|---|\n';

    const list_ = list.toSorted((a, b) => parseInt(a) - parseInt(b));
    const groupedList = chunk(list_, 7).map((dates) => {
      return `| ${dates.map(printLink).join(' | ')} |`;
    });

    // biome-ignore lint/complexity/noForEach: <explanation>
    groupedList.forEach((row) => {
      buf += `${row}\n`;
    });

    buf += '\n\n';
  });

await fs.writeFile('INDEX.md', buf, 'utf-8');
console.log('updated');
