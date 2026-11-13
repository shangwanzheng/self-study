# 前端视角速览（90 分钟主讲 / 可压到 60 分钟）

面向 **C++ 客户端**、**Java 云服务**：用前端自己的一条链路讲完，对照只点一句。  
**做 PPT**：每个 `## 幻灯` = 一页。建议 **20 页**，不要拆回两天课。

**口播原则**

- 先讲「浏览器里实际发生了什么」
- 再补半句：C++ / Java 里类似物是什么
- 细节表留给附录 [01](./01-day1-slides.md) / [02](./02-day2-slides.md)

---

## 时间表（默认 90 min）

| 段 | 时长 | 幻灯 | 讲什么 |
|----|------|------|--------|
| A 开场 | 6 min | 1–2 | 前端是什么、本仓栈 |
| B 运行时 | 8 min | 3–4 | Tab、事件循环、刷新丢状态 |
| C 语言与 UI | 16 min | 5–8 | TS、React、状态、样式 |
| D 工程化 | 8 min | 9–10 | npm / 静态资源发布 |
| **D2 缓存** | **8 min** | **11–12** | **HTTP 缓存、hash 文件名、index.html 不长缓存** |
| E 请求与契约 | 12 min | 13–15 | 路由、axios 合同 |
| **F 重灾区** | **16 min** | **16–18** | **联调 / React / 运行时，怎么判断在哪一层** |
| G 演示 | 8 min | 19 | Network 走一条真实请求（顺带看 Size: disk cache） |
| H 收束 | 8 min | 20 | 三句话、Q&A |

**压到 60 min**：B 并一张；删样式页；缓存只讲幻灯 12；重灾区只讲 16+17；演示改口头 3 min。

---

## 幻灯 1 · 前端在整条链路上干什么（8 min 的前半）

```text
用户操作
  → 浏览器里的 JS 改「状态」
  → 页面重画（React）
  → axios 调 Java API（JSON + JWT）
  → 用返回的 data 再画
C++ 客户端：可嵌入同一套页面（WebView），或走自己的协议
```

| 端 | 一句话 |
|----|--------|
| 前端 | **交互 + 展示**，产物是静态资源，逻辑在用户浏览器里跑 |
| Java | **权威数据与权限**，产物是服务 |
| C++ | **本机能力 / 嵌入浏览器**，产物是安装包 |

**金句**：浏览器是「关掉就没了的进程」；UI 是「状态的函数」；发版是「换 HTML/JS/CSS」，不是装一个带 JVM 的包。

---

## 幻灯 2 · 本仓一张图（开场后半）

```text
src/index.tsx          入口：BrowserRouter + Ant Design + hox
src/pages/             一个路由 ≈ 一个画面
src/components/        可复用块
src/services/          调哪些 API
src/utils/request/     axios 拦截器（鉴权、code）
src/store/ + src/mgr/  页面状态 / 命令式总管
package.json           怎么启动、构建、检查
craco.config.js        怎么改打包（Less、别名、px→rem）
```

学完当场能做的三件事：打开页面结构、看懂一条请求、改文案或字段。

---

## 幻灯 3 · 运行时：谁在跑这段 JS（12 min）

**前端视角**

- 一个浏览器 Tab ≈ 一个进程；**JS 只有一条主线程**
- 这条线程同时：跑脚本、算布局、画像素
- 同步代码跑太久 → 页面卡住（不是「再开个线程池」那么随便）
- **F5 刷新 = 内存清空**，权威数据只在 Java

**对照一句**

- C++：像 UI 线程 + 消息泵；别在 UI 线程做重活
- Java：不像 Tomcat 一请求一线程；前端默认没有请求线程池

本仓长连接：`src/sw/websokcetMgr.ts` —— 是浏览器里的后台脚本，不是服务端线程。

---

## 幻灯 4 · 事件循环（只留一张）

```text
点击 / 定时器 / 网络回调   → 宏任务
Promise.then / async 后续  → 微任务（先清空）
然后浏览器才布局、绘制
```

读代码时看到 `await request.get(...)`：当前函数在这里让出主线程，等响应再继续。  
卡顿排查：Performance 看主线程有没有长任务，而不是先调 GC。

---

## 幻灯 5 · TypeScript：给打包器看的契约（C 段）

**前端视角**

- 你写的是 `.ts` / `.tsx`，浏览器跑的是 **擦掉类型的 JS**
- `strict: true` 只在编译期拦错；线上没有泛型、没有接口
- `null` 和 `undefined` 都是「空」，这是前端第一坑
- `import` 会被 Webpack **打进几个大 JS 文件**，不是 Java 的 classpath、也不是 C++ 链接 dll

本仓 [`tsconfig.json`](../../tsconfig.json)：`jsx: react-jsx`，`noEmit: true`（真正转译交给打包器）。

**对照一句**：TS ≠ 另一种 Java；更像「带静态检查的 JS + 打包合同」。

---

## 幻灯 6 · React：页面是状态的函数

**前端视角（本仓全是函数组件 + Hooks）**

```tsx
function Header({ count }: { count: number }) {  // props ≈ 入参，当不可变
  const [loading, setLoading] = useState(false); // 要变就 setState，不要 obj.x = 1
  return <button disabled={loading}>共 {count} 项</button>;
}
```

- `setLoading(true)` → **整个函数再跑一遍** → React 再 diff DOM  
- 列表 `key` 是调和算法用的身份，不是给人看的主键文案  
- `useEffect` ≈ 订阅/清理，不是 Qt 的每帧 tick

**对照一句**：Qt 是找到控件 `setText`；React 是改 state，让 UI 重新描述自己。

目录：`src/pages/` 画面，`src/components/` 积木，`src/mgr/` 接近 C++ 单例 Manager。

---

## 幻灯 7 · 状态放哪（一张表讲完）

| 层级 | 活多久 | 本仓 | 权威吗 |
|------|--------|------|--------|
| `useState` | 组件在就在 | 局部交互 | 否 |
| hox `createStore` | 刷新就没 | `src/store/`、`src/pages/carsim/store/` | 否 |
| Java API / DB | 服务端 | `src/services/` | **是** |

不要把 hox 当成 Spring 容器；它只是挂在 React 树上的共享内存。

---

## 幻灯 8 · 样式：一层就够（60 min 可删）

- 布局用 Flex/Grid，不是 Qt Layout 对象  
- 本仓：**Less + CSS Modules**（类名带 hash，避免冲突）+ Ant Design 5  
- 主题色在 [`craco.config.js`](../../craco.config.js) 的 `@primary-color`  
- `postcss-pxtorem`：写 px，打包成 rem  

改颜色先找 Ant Design / 主题变量，再手写 CSS。

---

## 幻灯 9 · 工程化：前端怎么从源码到浏览器（12 min）

```text
npm start     开发：本机起服务，改代码热更新
npm run build 发布：打出 build/ 里的 HTML + JS + CSS（带 hash 文件名）
              → 丢给 Nginx / OSS
              → 用户浏览器下载后再执行
```

| 你熟悉的 | 前端对应 |
|----------|----------|
| `pom.xml` / CMake | `package.json` |
| Maven 依赖 | npm，**lockfile 锁整棵树** |
| jar / exe | **静态文件，没有 JVM** |
| Checkstyle / clang-tidy | `npm run lint` |
| JUnit / gtest | Jest + jsdom（假 DOM，不是真 Chrome） |

CRACO = 不 eject CRA、仍能改 Webpack。对照 Java：「不 fork Spring，写个自定义 Starter」。  
本仓它改了：别名、Less、CSS Modules、px→rem、Mock。

---

## 幻灯 10 · 发版推论（给 Java / C++ 各一句）

- 前端可以单独换静态资源；**接口字段一变，旧 JS 会炸** → API 要兼容或版本化  
- Nginx 要对 SPA 做 history fallback（刷新 `/workbench` 不能 404）  
- C++ 嵌入 WebView：还是这套静态资源 + 桥接 token，不是把 Qt 控件再画一遍

---

## 幻灯 11 · 浏览器缓存：不是「内存没清」（8 min）

F5 会丢掉 **React / hox 状态**，但 **不一定重新下载 JS**。这是两套东西：

| 层 | 活多久 | 对照 |
|----|--------|------|
| 组件 state / hox | 关 Tab / 刷新就没 | 进程内存 |
| `localStorage` / token | 人工清或过期 | 本机小数据库 |
| HTTP 磁盘缓存 | 看 `Cache-Control` / 文件名 hash | 安装目录里的旧 dll |
| CDN / Nginx 缓存 | 边缘节点自己的 TTL | 多机房各一份包 |

Network 里 **Size = `(disk cache)` / `(memory cache)`**：这次没打到 Java，浏览器直接用上次的文件。  
勾选 **Disable cache** 只对开着 DevTools 的这次有效，用户电脑不会帮你勾。

**对照一句**：C++ 发版是换 exe；前端若 `index.html` 仍指向旧 hash，用户就一直跑旧包。Java 接口缓存（Redis）和浏览器静态缓存不是一回事。

---

## 幻灯 12 · 正确姿势：HTML 短缓存，带 hash 的 JS/CSS 长缓存

`npm run build` 会打出类似 `main.a1b2c3.js`——**内容变则文件名变**，所以可以让浏览器把 JS **缓存很久**。

```text
index.html     Cache-Control: no-cache（或 max-age 很小）
               → 每次回来问服务器「最新入口是谁」
*.[hash].js    Cache-Control: max-age=31536000, immutable
*.[hash].css   同上
/api/*         不要当静态资源缓存；走 axios，带鉴权
```

**发版事故典型路径**：Java 先上了新字段，Nginx 把 `index.html` 也缓存了 7 天 → 用户还在跑旧 JS → 页面「随机」报错。先看 Network 里 html/js 是 200 还是 disk cache，再怪业务代码。

强刷：Ctrl+F5 会绕过部分缓存；给用户的正规手段是 **html 不长缓存 + hash 换名**，不要靠口头「清缓存」。

WebView / CS 客户端：内核自己的 HTTP 缓存，清桌面「程序缓存」未必等于清页面缓存。

---

## 幻灯 13 · 路由：URL 变了，没有整页重载

[`src/index.tsx`](../../src/index.tsx)：`BrowserRouter` 包住 `Layouts`。

- 地址栏变 → **JS 换组件**  
- 不是 Spring `@GetMapping` 再渲染一张 HTML  
- 生产仍由 Nginx 把所有路径指回 `index.html`

C++ 对照：更像「页面栈切页」，不是新拉一个 exe。

---

## 幻灯 14 · 请求：本仓真正的联调合同

文件：[`src/utils/request/request.ts`](../../src/utils/request/request.ts)

前端默认做的三件事：

1. 请求头塞 `Authorization: Bearer ${token}`；过期会排队刷新  
2. 响应 `code === 200` 才把 `data` 交给页面；其它 code → `reject`  
3. `401` → 清 token、弹窗去登录（CS 嵌入走 `CsAppManager`）

**联调纪律**：HTTP 200 ≠ 业务成功。第一现场是 DevTools **Network**（Status / Headers / Response）。

FormData / 文件：**不要**强行 `Content-Type: application/json`。  
生产会 `withCredentials`；CORS 失败时 Java 日志可能有请求，前端却像「没发出」。

---

## 幻灯 15 · 三端怎么协作（一张图）

```text
React SPA  --HTTPS JSON+JWT-->  Java 服务（权威）
C++ 客户端 --同契约或自有协议--> Java
C++ 可选嵌入 WebView 跑同一套 SPA，用桥接同步 token / 登出
```

最容易各写各的：错误码、文件上传下载、分页、WebSocket 心跳。  
建议会后产出一页 **code 对照表**（200 / 401 / 业务失败）。

逻辑可以下沉成 SDK（同一套 TS 编排给脚本调），不必永远「人肉点页面」——知道有这条路即可。

---

## 幻灯 16 · 重灾区：先判断「死在哪一层」（16 min 开场）

联调时不要从业务代码猜。按这一层往下拆：

```text
1. Network 有没有发出？          → 地址、代理、CORS、预检
2. 是 200 还是 disk cache？      → 旧 JS 也会「看起来成功」
3. HTTP 状态 vs body.code        → 本仓成功条件是 code===200
4. 页面有没有 setState / 重渲染   → 数据到了但 UI 没动
5. 主线程是否卡住                 → 长任务、大 JSON、同步循环
```

| 现象 | 先看 | 多半不是 |
|------|------|----------|
| 前端「没请求」、Java 有日志 | CORS / OPTIONS | 业务 if 写错 |
| 发了版还是旧页面 | html/js 是否 `(disk cache)` | 用户没清「内存」 |
| 列表空白但接口 200 | body.`code`、字段名 | 服务挂了 |
| 点了没反应、风扇响 | Performance 长任务 | 再加个线程 |
| 改了对象界面不变 | 有没有 `setState` | 绘图 API |
| 多 Tab 状态乱 | SharedWorker / 本地 token | 数据库 |

细表与本仓文件：[04-hotspots.md](./04-hotspots.md)

---

## 幻灯 17 · 重灾区：联调三坑（Java 多停）

**1. HTTP 200 ≠ 业务成功**  
本仓拦截器只认 `data.code === 200`。HTTP 200 + `{ code: 50001 }` → 页面进 `catch` / toast，Java 同事会觉得「接口明明成功了」。

**2. CORS：后端有日志，浏览器当没发出**  
跨域先 OPTIONS 预检。缺响应头时 Console 红字 CORS，Network 里是 `(failed)`。查网关 `Access-Control-Allow-*`，别先改页面逻辑。

**3. 文件 / FormData 被当成 JSON**  
拦截器默认 `Content-Type: application/json`。上传文件必须让浏览器自己带 `multipart` 边界，**不要**再写死 JSON。下载走 `Blob`，拦截器里已单独放行。

附赠：刷新非首页 404 → Nginx 没做 SPA fallback；接口字段改了旧 JS 还在 CDN → 发版兼容。

---

## 幻灯 18 · 重灾区：React 与运行时三坑（C++ 多停）

**1. 直接改对象，界面不动**  
`list.push(x)` / `obj.name = 'a'` 对 React 经常等于没变。要新数组、新对象，再 `setState`。对照 Qt：`setText` 立刻改控件；这里必须换引用。

**2. 闭包拿到过期 state（陈旧闭包）**  
`setTimeout` / 事件监听 / SharedWorker 回调里读的 `count` 可能是注册那一刻的值。本仓 [`sharedworkerMgr.ts`](../../src/sw/sharedworkerMgr.ts) 已写明：listener 里用到的 state 必须放进 `deps`，否则永远是初始值。

**3. 主线程既算又画**  
大 JSON `JSON.parse`、同步 for、复杂计算都会掉帧。没有「再开个 Tomcat 线程」。重活拆小或 Web Worker。`useEffect` 忘记 `return` 取消订阅 → 离开页面后回调还在跑（泄漏 / 套在已卸载组件上）。

多 Tab：token、登出、主题走 SharedWorker 广播（`Web_logout` 等），不是服务端 Session 同步。

---

## 幻灯 19 · 现场 8 分钟：看一条请求（不要三条录屏）

1. `npm start`，进任意列表页，F12 → Network，勾选 Preserve log  
2. 刷新列表，点开一条 XHR：  
   - Request 有没有 `Bearer`  
   - Body 是不是 `{ code, data }`  
3. 口头对照：`code === 200` 才进 `setState`；否则走 toast / 登录  
4. 看静态资源那一行 **Size**：是体积数字还是 `(disk cache)` —— 对照幻灯 11  

课前若能备 **一条业务失败**（HTTP 200 但 `code !== 200`），播 30 秒即可，不必单独录 401。  
完整逐步脚本仍在 [03-demo-snippets.md](./03-demo-snippets.md)，本场只用 Demo A 的 TS 段 + 这一条 Network。  
演示时对照幻灯 16：先看有没有发出、是不是缓存，再看 `code`，最后才怀疑 UI。

---

## 幻灯 20 · 记住三句 + 边界

**三句**

1. 主线程既跑逻辑又画画，别堵；刷新内存就没了  
2. UI = f(state)；TS 类型打包后不存在  
3. 产物是静态资源，合同在 API：`Bearer` + `code === 200`；**html 短缓存、hash 文件长缓存**

**出了问题先问**：Network 有没有、是不是 disk cache、`code` 是不是 200、有没有 `setState`、主线程卡没卡。

**能做**：读页面、改文案/字段、用 Network 判断前端还是 Java、看懂 `package.json` / CRACO。  
**先别做**：Webpack 深改、性能剖析、Canvas/三维、微前端、SSR。

**建议下一步（课后）**：跟一个真需求提 PR。C++ 看嵌入与 token；Java 补错误码表和 CORS。

---

## 讲师提词（可当讲稿顺序）

1. 用幻灯 1 的箭头把三端画在白板上，停 20 秒  
2. 打开 `src/index.tsx` 让学员看见 Router / ConfigProvider / HoxRoot  
3. 幻灯 6 对着真组件讲，不要再开 Qt 长对比  
4. 幻灯 14 直接投影 `request.ts` 拦截器 130–144 行  
5. 幻灯 11–12 只讲「状态 ≠ HTTP 缓存」和 html/hash 分工，不要展开 ETag 算法  
6. 幻灯 16–18 用「现象 → 先看哪」讲，不要逐条念完 04 附录  
7. 幻灯 19 必须投屏 Network，并指一下 Size 列  

C++ 多停：主线程、setState vs 改控件、陈旧闭包、WebView。  
Java 多停：TS 擦除、code vs HTTP、CORS、FormData、发版兼容。
