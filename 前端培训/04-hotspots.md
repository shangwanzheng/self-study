# 附录：前端问题重灾区

课堂只讲 [00 幻灯 16–18](./00-90min-slides.md) 的重灾区；缓存见 [00 幻灯 11–12](./00-90min-slides.md)。本文给备课。

排查顺序永远是：**有没有发出 → 是不是磁盘缓存 → HTTP/`code` → 有没有重渲染 → 主线程卡没卡**。

---

## 1. 联调（Java 同事最常撞）

| 坑 | 你看到的 | 实际原因 | 本仓 |
|----|----------|----------|------|
| 业务码当成功 | HTTP 200，页面 toast | 拦截器只认 `data.code === 200` | `src/utils/request/request.ts` |
| 401 分流 | 有的弹窗、有的直接跳登录 | body 401 vs HTTP 401；CS 走 `CsAppManager` | 同上 |
| CORS | Console 红字；Java 有日志 | 预检 OPTIONS 失败，浏览器拦截读响应 | 网关 CORS 头 |
| Cookie 没带上 | 像没登录 | 域 / SameSite / `withCredentials` | production 才默认带 cookie |
| 上传文件空 | 后端收不到 multipart | 被写成 `application/json`，FormData 被序列化掉 | 不要手写死 JSON Content-Type |
| 下载打不开 | 乱码或 JSON | 二进制被当 JSON 解包 | 拦截器对 `Blob` 原样返回 |
| 刷新子路由 404 | `/workbench` 再刷挂了 | Nginx 没把 SPA fallback 到 `index.html` | 部署配置 |
| 字段改了旧页面炸 | 新 Java + 旧 JS | 静态资源独立发版，或 **index.html 被缓存** | 契约 / html 短缓存 |
| 发了版用户还是旧界面 | 你清了自己的 Disable cache | 用户仍命中 disk cache / CDN | 幻灯 11–12 |

**口播**：第一现场永远是 DevTools Network 的 Status、Request Headers、Response，不是猜业务 if。

---

## 2. React 状态（C++ 同事最常撞）

| 坑 | 典型写法 | 为什么炸 | 怎么记 |
|----|----------|----------|--------|
| 原地改对象 | `list.push`、`obj.x = 1` | 引用没变，React 以为不用画 | 换新数组 / 新对象再 `setState` |
| 陈旧闭包 | 定时器、WS、SharedWorker 里读 state | 回调捕获的是注册时的值 | 依赖数组 / 函数式 `setState(s => s+1)` |
| `key` 用 index | 列表插入后乱窜 | 调和算法认错身份 | 稳定业务 id |
| effect 不清理 | 订阅了没 `return` 取消 | 离开页面还在 setState | 对标 Qt 析构里 disconnect |
| 当 C++ 对象改字段 | 成员直接赋值 | 函数组件每次是一次新调用 | UI = f(state) |

本仓原话（[`src/sw/sharedworkerMgr.ts`](../../src/sw/sharedworkerMgr.ts)）：

> 如果在 msgListener 中使用了响应式值……需要通过 deps 指定依赖。否则因为闭包，拿到的将永远是初始值。

---

## 3. 运行时与多窗口

| 坑 | 现象 | 对照 |
|----|------|------|
| 主线程长任务 | 点击无响应、掉帧 | 没有 Tomcat 线程池可开；拆任务或 Worker |
| 刷新丢状态 | 填到一半 F5 没了 | hox / useState 不是 DB |
| 多 Tab 不同步 | 一个页登出另一个还在 | SharedWorker 广播 `Web_logout` 等，不是服务端 Session |
| WebSocket 在 SW 里 | 以为是 Java 线程 | `websokcetMgr.ts` 只是浏览器后台脚本 |
| 嵌入 WebView | 文件、证书、下载和桌面程序不同 | 走 `CsAppManager` 桥接 |

---

## 4. 类型与空值（TS 给假安全感）

| 坑 | 说明 |
|----|------|
| `null` vs `undefined` | 接口缺字段常是 `undefined`；显式空才是 `null` |
| 类型被擦除 | 运行时没有泛型；`as` 强转不会检查 JSON |
| 可选链漏了 | `data.list.length` 在 `list` 为空时炸；用 `data.list?.length ?? 0` |

Java 对照：NPE。C++ 对照：空指针。前端两个「空」还不一致。

---

## 5. 样式（少讲，知道即可）

- 全局 Less 和 CSS Modules 混用 → 改了一处，别处皮肤花了  
- 优先级：行内 > Modules > 全局；Ant Design 要用主题变量，不要硬打  
- `px` 会被 pxtorem 转走，调试时看 Computed 是 rem  

---

## 6. 浏览器缓存（课堂幻灯 11–12）

| 坑 | 现象 | 正确做法 |
|----|------|----------|
| 把 F5 当成清包 | 状态没了，JS 还是旧的 | 状态 ≠ HTTP 缓存 |
| `index.html` 长缓存 | 发版后入口仍指向旧 hash | html：`no-cache`；带 hash 的 js/css：长 `max-age` |
| API 被当静态资源缓存 | GET 列表「偶发」旧数据 | `/api` 不要套静态 Cache-Control |
| 只开了 Disable cache | 自己好了，用户还是旧的 | 正规靠文件名 hash，不靠用户清缓存 |
| 304 / disk cache | Network 有记录但没打到 Java | Size 列看 `(disk cache)`，不是业务失败 |
| WebView 旧页 | 清了安装目录仍旧 | 内核 HTTP 缓存要单独处理 |

对照：C++ 换 exe；Java Redis 是接口缓存；浏览器缓存的是 **静态文件**。

---

## 课堂怎么切

**缓存 8 min**：幻灯 11 分层（3 min）+ 幻灯 12 html/hash（5 min）。

**重灾区 16 min**：

1. 幻灯 16（4 min）：排查层，让学员喊「先看哪」  
2. 幻灯 17（6 min）：code、CORS、FormData  
3. 幻灯 18（6 min）：原地修改、陈旧闭包、主线程  
