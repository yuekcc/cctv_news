# 新闻联播文字稿

取自 [cctv央视网](https://tv.cctv.com/) 的文字稿。

🚧🚧内容来自网络，仅为学习记录。请不要用于奇怪的地方，后果自负🚧🚧

## 执行

```sh
# 只下载当天
node index.js

# 获取自 2022 年 1 月 1 日的文字稿
node fetch_from_2022.js
```

也可以配置 git actions 每天定时执行。

## 其他

代码最初源自 [xin-wen-lian-bo](https://github.com/DuckBurnIncense/xin-wen-lian-bo) 项目，感谢原作者的创造。

本项目在其基础上进行改进：

- 下载时会 dump 出源文件，用于二次数据获取
- 支持 cctv 老版本 ui
- 升级依赖
- 删除文字稿正文中的 html 标签，生成的 markdown 有更好的可读性

## LICENSE
