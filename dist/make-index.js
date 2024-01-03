import p from"node:fs/promises";var a=await p.readdir("./news");Array.prototype.toSorted||(Array.prototype.toSorted=function(t){let r=structuredClone(this);return r.sort(t),r});function c(t){return t?`[${t.replaceAll(/\.md$/g,"")}](./news/${t}.md)`:""}function l(t,r){let n=[];for(let o=0;o<t.length;o+=r)n.push(t.slice(o,o+r));return n}var d=a.filter(t=>t!=="catalogue.json").map(t=>t.replaceAll(/\.md$/g,"")).reduce((t,r)=>{let n=r.substring(0,6),o=t[n]||[];return o.push(r),t[n]=o,t},{}),s=`# \u76EE\u5F55

`;Object.entries(d).toSorted((t,r)=>parseInt(r[0])-parseInt(t[0])).forEach(([t,r])=>{s+=`## ${t}

`,s+=`| 1 | 2 | 3 | 4 | 5 | 6 | 7 |
`,s+=`|---|---|---|---|---|---|---|
`;let n=r.toSorted((e,u)=>parseInt(e)-parseInt(u));{let e=n[0]||"",u=new Date(parseInt(e.substring(0,4)),parseInt(e.substring(4,6))-1,parseInt(e.substring(6)),0,0,0);for(let i=0;i<u.getDay()-1;i++)n.unshift(null)}l(n,7).map(e=>`| ${e.map(c).join(" | ")} |`).forEach(e=>{s+=`${e}
`}),s+=`

`});await p.writeFile("INDEX.md",s,"utf-8");console.log("updated");
