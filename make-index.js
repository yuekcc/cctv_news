import fs from 'node:fs/promises';

const list = await fs.readdir('./news');
// console.log(list)

const result = [];
list.reverse().forEach((name) => {
  if (name === 'catalogue.json') {
    return;
  }

  result.push(`- [${name.replaceAll(/\.md$/g, '')}](./news/${name})`);
});

const content = `# 目录

<!-- INSERT -->
${result.join('\n')}
`;

await fs.writeFile('INDEX.md', content, 'utf-8');
