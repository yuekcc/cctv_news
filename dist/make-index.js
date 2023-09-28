import s from"node:fs/promises";var u=await s.readdir("./news");Array.prototype.toSorted||(Array.prototype.toSorted=function(t){let r=structuredClone(this);return r.sort(t),r});function i(t){return`[${t.replaceAll(/\.md$/g,"")}](./news/${t}.md)`}function c(t,r){let e=[];for(let n=0;n<t.length;n+=r)e.push(t.slice(n,n+r));return e}var p=u.filter(t=>t!=="catalogue.json").map(t=>t.replaceAll(/\.md$/g,"")).reduce((t,r)=>{let e=r.substring(0,6),n=t[e]||[];return n.push(r),t[e]=n,t},{}),o=`# \u76EE\u5F55

`;Object.entries(p).toSorted((t,r)=>parseInt(r[0])-parseInt(t[0])).forEach(([t,r])=>{o+=`## ${t}

`,o+=`| 1 | 2 | 3 | 4 | 5 | 6 | 7 |
`,o+=`|---|---|---|---|---|---|---|
`,c(r,7).map(n=>`| ${n.map(i).join(" | ")} |`).forEach(n=>{o+=`${n}
`}),o+=`

`});await s.writeFile("INDEX.md",o,"utf-8");console.log("updated");
