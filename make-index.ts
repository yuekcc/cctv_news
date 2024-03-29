import fs from 'node:fs/promises';
import prettier from 'prettier';

const mdList = await fs.readdir('./news');

function printLink(name?: string | null) {
	if (!name) {
		return '';
	}

	return `[${name.replaceAll(/\.md$/g, '')}](./news/${name}.md)`;
}

function chunk<T>(store: T[], size: number) {
	const groupedList = [];
	for (let i = 0; i < store.length; i += size) {
		groupedList.push(store.slice(i, i + size));
	}

	return groupedList;
}

const groupedByMonth = mdList
	.filter((name) => name !== 'catalogue.json')
	.map((name) => name.replaceAll(/\.md$/g, ''))
	.reduce(
		(g, it) => {
			const key = it.substring(0, 6); // 年月，如：202302
			const list = g[key] || [];
			list.push(it);
			g[key] = list;

			return g;
		},
		{} as Record<string, string[]>,
	);

let buf = '# 目录\n\n';

const mapGroupedByYearMonth = Object.entries(groupedByMonth).toSorted((a, b) => {
	return Number.parseInt(b[0]) - Number.parseInt(a[0]);
});

for (const [label, newsList] of mapGroupedByYearMonth) {
	buf += `## ${label}\n\n`;

	buf += '| 一 | 二 | 三 | 四 | 五 | 六 | 日 |\n';
	buf += '|---|---|---|---|---|---|---|\n';

	// 每月的列表
	const sortedNewsList: Array<string | null> = newsList.toSorted((a, b) => Number.parseInt(a) - Number.parseInt(b));

	// 在开关补充一些 null，对齐日期、星期
	{
		const fst = sortedNewsList[0] || '';

		const firstDay = new Date(
			Number.parseInt(fst.substring(0, 4)),
			Number.parseInt(fst.substring(4, 6)) - 1,
			Number.parseInt(fst.substring(6)),
			0,
			0,
			0,
		).getDay();

		for (let i = 0; i < firstDay - 1; i++) {
			sortedNewsList.unshift(null);
		}
	}

	buf += chunk(sortedNewsList, 7)
		.map((dates) => `| ${dates.map(printLink).join(' | ')} |`)
		.map((row) => `${row}\n`)
		.join('');

	buf += '\n\n';
}

const formatted = await prettier.format(buf, { parser: 'markdown' });
await fs.writeFile('INDEX.md', formatted, 'utf-8');
console.log('updated');
