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
  if (!name) {
    return '';
  }

  return `[${name.replaceAll(/\.md$/g, '')}](./news/${name}.md)`;
}

function chunk(myList, size) {
  const groupedList = [];
  for (let i = 0; i < myList.length; i += size) {
    groupedList.push(myList.slice(i, i + size));
  }

  return groupedList;
}

const groupedByMonth = list
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
Object.entries(groupedByMonth)
  .toSorted((a, b) => {
    return parseInt(b[0]) - parseInt(a[0]);
  })
  .forEach(([name, list]) => {
    buf += `## ${name}\n\n`;

    buf += '| 1 | 2 | 3 | 4 | 5 | 6 | 7 |\n';
    buf += '|---|---|---|---|---|---|---|\n';

    // list_ 是年月日字符串的数组
    const list_ = list.toSorted((a, b) => parseInt(a) - parseInt(b));

    // 在开关补充一些 null，对齐日期、星期
    {
      const fst = list_[0] || '';

      const d = new Date(
        parseInt(fst.substring(0, 4)),
        parseInt(fst.substring(4, 6)) - 1,
        parseInt(fst.substring(6)),
        0,
        0,
        0,
      );

      for (let i = 0; i < d.getDay() - 1; i++) {
        list_.unshift(null);
      }
    }

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
