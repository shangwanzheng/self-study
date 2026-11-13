# 前端知识对照培训

面向 **C++ 客户端** 与 **Java 云服务**：读懂前端、能联调、能改简单页面；进阶可上「有 AI 协助的动手课」。

## 两场课怎么选

| 目标 | 用哪份 |
|------|--------|
| 先建立共同语言、能联调分责 | **[00-90min-slides.md](./00-90min-slides.md)**（90 min） |
| 定位本仓：路由找文件 / AI / DevTools | **[05-ai-assisted-dev.html](./05-ai-assisted-dev.html)**（浏览器放映，24 页）；PPT 见 [pptx](./05-ai-assisted-dev.pptx)（封面 + 23 页），大纲见 [outline](./05-ai-assisted-dev-outline.md) |
| 第一次之后的前端基础（3×90 min） | **[06-frontend-basics-outline.md](./06-frontend-basics-outline.md)**：浏览器运行时、页面为什么会变、请求 / 缓存 / 三端 |

推荐：Week1 上 00，Week2 上 05；时间紧则课前自学 00，当天只上 05。

## 默认用这个：90 分钟前端视角

整场 **以前端自己的链路为主线**（浏览器 → React → 请求 → 静态资源发布），C++ / Java 只在每页补一句对照。  
两天细表保留作备课附录，课堂上不要整本念。

| 文件 | 用途 |
|------|------|
| **[00-90min-slides.md](./00-90min-slides.md)** | **概念课主交付**：20 页 / 90 min（含缓存 2 页、重灾区 3 页） |
| **[05-ai-assisted-dev.pptx](./05-ai-assisted-dev.pptx)** | **技能课 PPT**：封面 + 23 页，可直接投影 |
| **[05-ai-assisted-dev-outline.md](./05-ai-assisted-dev-outline.md)** | **技能课大纲 / 备课细表**：clone 到页面、概念卡、basic、定位路径、AI、DevTools、客户端桥 |
| **[06-frontend-basics-outline.md](./06-frontend-basics-outline.md)** | **加课大纲**：3 次 × 90 min。运行时、React 状态、拦截器与发版缓存。不重复第一次的找文件 |
| [01-day1-slides.md](./01-day1-slides.md) | 附录：运行时 / TS / React / 样式细表 |
| [02-day2-slides.md](./02-day2-slides.md) | 附录：工程化 / 拦截器 / 三端协作细表 |
| [03-demo-snippets.md](./03-demo-snippets.md) | 附录：对照代码；课上只用 Network 一条 |
| [04-hotspots.md](./04-hotspots.md) | 附录：重灾区细表（联调 / React / 运行时 / **缓存**） |

**做 PPT**：

- 概念课：只把 `00` 里每个 `## 幻灯` 做成一页（约 20 页）。底栏写本仓路径。
- 技能课：直接用 [05-ai-assisted-dev.pptx](./05-ai-assisted-dev.pptx)。

## 90 分钟节奏

| 段 | 时长 | 内容 |
|----|------|------|
| 开场 | 6 min | 前端在链路上干什么、本仓目录 |
| 运行时 | 8 min | Tab、单线程、刷新丢状态 |
| 语言与 UI | 16 min | TS 擦除、React=f(state)、状态放哪 |
| 工程化 | 8 min | npm / Webpack / 静态资源 |
| **浏览器缓存** | **8 min** | **状态≠HTTP 缓存；html 短缓存、hash 长缓存** |
| 请求契约 | 12 min | 路由、Bearer、code===200 |
| **重灾区** | **16 min** | **分层排查 + 联调三坑 + React/运行时三坑** |
| 演示 | 8 min | Network + Size 是否 disk cache |
| 收束 | 8 min | 三句话、能做/不做 |

压到 60 分钟：并运行时、删样式页、缓存只讲 hash 策略、重灾区只讲排查图+联调三坑、演示改口头 3 分钟。

## 本仓锚点（投影这几个文件即可）

- 入口 [`src/index.tsx`](../../src/index.tsx)
- 拦截器 [`src/utils/request/request.ts`](../../src/utils/request/request.ts)
- 脚本 [`package.json`](../../package.json)、打包改动 [`craco.config.js`](../../craco.config.js)
- 状态 `hox`：[`src/store/flow/index.ts`](../../src/store/flow/index.ts)

## 课前 10 分钟

1. `npm start` 能进一个带列表的页面  
2. 能打开该页 Network；有更好：准备一条 HTTP 200 但 `code !== 200` 的响应  
3. PPT 只带 `00` 的约 20 页，细表不要进课堂包  
