import u from"node:fs/promises";var c=await u.readdir("./news");Array.prototype.toSorted||(Array.prototype.toSorted=function(t){let r=structuredClone(this);return r.sort(t),r});function p(t){return`[${t.replaceAll(/\.md$/g,"")}](./news/${t}.md)`}function a(t,r){let e=[];for(let n=0;n<t.length;n+=r)e.push(t.slice(n,n+r));return e}var l=c.filter(t=>t!=="catalogue.json").map(t=>t.replaceAll(/\.md$/g,"")).reduce((t,r)=>{let e=r.substring(0,6),n=t[e]||[];return n.push(r),t[e]=n,t},{}),o=`# \u76EE\u5F55

`;Object.entries(l).toSorted((t,r)=>parseInt(r[0])-parseInt(t[0])).forEach(([t,r])=>{o+=`## ${t}

`,o+=`| 1 | 2 | 3 | 4 | 5 | 6 | 7 |
`,o+=`|---|---|---|---|---|---|---|
`;let e=r.toSorted((s,i)=>parseInt(s)-parseInt(i));a(e,7).map(s=>`| ${s.map(p).join(" | ")} |`).forEach(s=>{o+=`${s}
`}),o+=`

`});await u.writeFile("INDEX.md",o,"utf-8");console.log("updated");
