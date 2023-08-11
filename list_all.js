import fs from 'node:fs/promises'

const list = await fs.readdir('./news')
// console.log(list)

const result = [];
list.reverse().forEach(name => {
    result.push(`- [${name.replaceAll(/\.md$/g, '')}](./news/${name})`)
})

await fs.writeFile('list.md', result.join('\n'), 'utf-8')