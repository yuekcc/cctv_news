# 新闻联播文字稿

取自 [央视网](https://tv.cctv.com/) 的文字稿。

👉👉👉 [目录](./INDEX.md) 👈👈👈

## 执行

需要 bun >= 1.1.29

```sh
bun install

# 只下载当天新闻文字稿
bun run fetch

# 重新创建 INDEX.md 索引文件
bun run make-index
```

## 构建

**bun 不需要构建**。

## 其他

代码最初源自 [xin-wen-lian-bo](https://github.com/DuckBurnIncense/xin-wen-lian-bo) 项目，感谢原作者的创造。

本项目在其基础上进行改进：

- 下载时同时保存源文件到 dump_htmls 目录，用于二次数据获取
- 支持 cctv 老版本 ui
- 升级依赖
- 删除文字稿正文中的 html 标签，生成的 markdown 有更好的可读性

## LICENSE

代码部分按 MIT License 发行。

## 重要声明

🚧🚧内容来自网络，版本归原作者，本项目仅用于研究学习。请不要用于奇怪的地方，后果自负🚧🚧
