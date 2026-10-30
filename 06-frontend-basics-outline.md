# 前端基础加课大纲

面向**Java 云服务**、**C++ 客户端**同事。  
第一次课已经上完，范围就是 [05-ai-assisted-dev-outline.md](./05-ai-assisted-dev-outline.md)：能把项目跑起来，从路由找到文件，用 AI 和 DevTools 把现象缩到文件。概念卡只够把 `.less`、`craco`、antd 归类。

领导要的是把前端基础知识讲深一点。建议 **3 次，每次 90 分钟**。只有两次时，把第 1 次压成第 2 次的开头，第 3 次保持整场。

这不是 [培训.md](./培训.md) 里的五天集训。学员结业后仍不是前端开发。三次加课的目标是：打开已经定位到的文件，能说出这段代码在浏览器里怎么跑、页面为什么会变、这条数据和这次发版各归谁管。

> 备课从附录抽，不要把附录整本念：  
> - [01-day1-slides.md](./01-day1-slides.md)：运行时、TS、React、样式  
> - [02-day2-slides.md](./02-day2-slides.md)：拦截器、缓存、三端  
> - [03-demo-snippets.md](./03-demo-snippets.md)：请求后更新列表、拦截器对照  
> - [04-hotspots.md](./04-hotspots.md)：联调 / React / 缓存重灾区，课上只点对应的一条  

---

## 0. 和第一次怎么接

第一次已经会的，这三次只当已知条件，不再讲步骤：

| 第一次已经会 | 加课里怎么用 |
|--------------|----------------|
| `npm start`、目录地图、`routeConfig` → `pages` | 投屏直接打开文件，不再带领 clone |
| 概念卡：Less / CSS Modules / antd、TS 要转译、Webpack / Vite | 讲「为什么这样」，不重新做名词表 |
| 标准路径 6 步、`services` / `store` / `mgr` / `CsAppManager` 的位置 | 第 2、3 次打开这些文件讲行为 |
| DevTools：Elements、Console、Network、`code === 200` | 用来验证新概念，不重讲面板菜单 |
| 桥的消息域、`toCS:` / `fromCS:` | 第 3 次只放进时序，不重背 `MessageType` |

三次都不做：断点与 Performance、自己写一个 CRUD 页、Jest、新依赖选型、basic 仓库再讲一遍。

| 次 | 主题 | 时长 | 学完能回答 |
|----|------|------|------------|
| 1 | 浏览器在跑什么 | 90 min | 这段 JS 在哪条线程上、值为什么和 Java 不一样、类型还在不在、`await` 有没有真正等到 |
| 2 | 页面为什么会变 | 90 min | 改了数据为什么要 `setState`，状态该放组件、hox 还是 mgr |
| 3 | 请求、缓存、三端各管一段 | 90 min | 这条失败是契约、CORS，还是用户还在跑旧包 |

---

## 1. 第 1 次 · 浏览器在跑什么

**学完能做什么**：看到一段 `.ts` / `.tsx`，能说出浏览器实际跑的是擦掉类型之后的 JS；能判断卡顿是主线程被占住、一个值是 `null` 还是 `undefined`、一个长整型 id 有没有在 JSON 里丢精度、一个 `await` 有没有写上。

细表在 [01-day1-slides.md](./01-day1-slides.md) 幻灯 2–9，空值和主线程坑在 [04-hotspots.md](./04-hotspots.md)。下面按 90 分钟写开口播和例子。页面怎么重画、拦截器、CORS、HTTP 缓存留到第 2、3 次。

| 段 | 时长 | 讲什么 |
|----|------|--------|
| 开场 | 8 min | 地址栏到第一行 JS；这次不找文件 |
| 主线程 | 12 min | Tab、三件事抢一条线程、什么能活过刷新 |
| 事件循环 | 15 min | 先让学员猜输出，再对上 Qt / Tomcat |
| 值和 JSON | 16 min | 两个空、真假、`??`、数字精度、引用 |
| 类型擦除 | 10 min | `tsconfig`、`as` 不检查 JSON |
| 函数 | 12 min | `this`、箭头函数、闭包钉住变量 |
| 异步 | 12 min | 三端对照、漏写 `await`、顺序和 `Promise.all` |
| 控制台 + 验收 | 5 min | 当场跑猜输出那一段，再抽问 |

### 1.1 从地址栏到第一行 JS

`npm start` 之后浏览器打开 `http://localhost:8000`。后面发生的事第一次课没讲：

```text
要 index.html
  → 解析 HTML，再要里面的 js / css
  → 在主线程上从上到下执行脚本
  → 脚本执行完，线程转去等事件：点击、定时器、请求回来
```

开发时这些文件由 CRACO 的开发服务器现给。生产环境是 `dist/` 里的静态文件，由 Nginx / CDN 给。文件会不会被浏览器留着下次用，第 3 次讲。这节只建立「JS 是下载下来、在用户机器的这个 Tab 里执行的」。

全局对象只有一个 `window`（`globalThis` 是它的别名）。Java 没有对应物：没有一个进程级的袋子可以随手挂字段。Qt 嵌入时注入的 `window.qt`、`window.CsApp` 挂在这个对象上，所以第一次课的桥只在这个页面里存在。iframe 是另一个 `window`。

`import` 不是 C++ 的 `#include`，也不是把 jar 放进 classpath。打包器把依赖收成少数 js，浏览器下载的是这个结果。`package-lock.json` 锁的是这棵树，第一次课装依赖时已经用过。

### 1.2 主线程：一条线程干三件事

| 维度 | C++ | Java | 浏览器 |
|------|-----|------|--------|
| 载体 | OS 进程 | JVM | 一个 Tab 近似一个进程 |
| 并发 | 多线程 + 消息泵 | 请求线程池 | JS 一条主线程 + 事件循环 |
| 主线程上还有 | 消息、绘制 | 无 UI 时无「帧」 | 跑 JS、算布局、画页面、接收点击，排队做 |
| 卡顿 | 锁、IO、主线程忙 | GC、线程打满 | 同步代码占住主线程，点击要等它跑完 |

网络收包可以在浏览器自己的网络栈里并行。**回到页面的回调仍排在这条主线程上。** 所以「Java 里再开一个线程处理响应」在这里不成立。重计算要么拆成小段让出线程，要么放进 Web Worker；Worker 碰不到页面 DOM。

本仓的长连接不在 Java 线程里。`src/sw/sharedworkerMgr.ts` 用 SharedWorker，多个 Tab 共用一个 Worker 里的 WebSocket。Worker 有自己的全局对象，不是页面的 `window`。文件里的注释要顺手念：监听函数如果闭包住了旧值，后来拿到的一直是注册时那份。闭包本身本节 1.6 讲，和 React 状态搅在一起的部分留到第 2 次。

刷新时要分开三样东西，不要说成「刷新一切都没了」：

| 东西 | 刷新之后 |
|------|----------|
| 变量、hox、正在填的表单 | 没了。权威数据要重新向 Java 要 |
| `localStorage` | 还在。本仓语言选择写在 `localStorage` 的 `DefaultLanguage`（`src/i18n/manager.ts`），封装在 `src/utils/storage.ts` |
| `sessionStorage` | 关 Tab 才没。只刷新还在 |
| Cookie | 还在，按域和过期时间 |
| 已下载的 html / js | 可能还在。是不是旧包，第 3 次用 Network 的 Size 看 |

没有手动 `new/delete`。对象没人引用之后由 GC 收走。闭包还指着它，就收不走。

### 1.3 事件循环：先猜再讲

C++：消息进队列，主线程取一条，更新控件。  
Java：请求进 Tomcat 线程，Controller 写完响应，线程归还。这条线程可以有很多条。  
前端：主线程先把当前这段同步代码跑完，再清空微任务，然后取一条宏任务，中间才布局和绘制。

让学员先写结果，再贴进已打开页面的 Console：

```js
console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')
```

结果是 `A D C B`。`setTimeout(..., 0)` 不是「立刻并行」，它只是把 `B` 放到宏任务队列。`Promise.then` 是微任务，排在当前同步代码之后、定时器之前。`async` 函数里 `await` 后面的代码，也是以微任务回来的。

接着用本仓能对上的四类事件，都是宏任务，一次只处理一条：

| 事件 | 队列里的谁 |
|------|------------|
| 点击按钮 | 这个点击的处理函数 |
| `setTimeout` / `setInterval` | 到点的回调 |
| 请求回来 | axios 的回调，里面才是你的 `await` 继续往下走 |
| 桥消息 | `window.onMessageFromQt`。它也不在另一条线程里跑页面代码 |

同步的 `throw` 会打断当前这个处理函数。`async` 函数里没人 `await`、也没人 `catch` 的拒绝，Console 报 Unhandled Rejection，**下一个点击还能用**。这不是进程崩溃，也不是 Tomcat 线程挂了。

同源只留一句：页面的源是「协议 + 主机 + 端口」。`localhost:8000` 和 Java 那台机器不是一个源，所以页面不能去读对方的 Cookie 或 DOM。代理为什么让开发环境看起来没有跨域，第 3 次讲。

### 1.4 值：和 Java / C++ 不一样的地方

读接口 JSON 和业务判断时，真正会看错的是下面这些，不是语法。

**两个空**

| | 含义 | 从哪来 |
|--|------|--------|
| `undefined` | 还没有这个值 | 没赋值、对象上没这个字段、函数没返回 |
| `null` | 有意放一个空 | JSON 里写了 `"name": null`，或代码赋了 `null` |

接口少了一个字段，前端拿到的多半是 `undefined`，不是 `null`。`user?.profile?.name` 在中间任何一截为空时停住，不再往下取（对上 Java 的一串判空，或 C++ 的空指针检查）。

**真和假。** `if (value)` 把这些当假：`false`、`0`、`''`、`null`、`undefined`、`NaN`。空对象 `{}`、空数组 `[]` 是真。所以 `if (count)` 在数量为 0 时走的是失败分支。数量、长度要用 `===` 比较，或写成 `count ?? 0`。

**`||` 和 `??` 不要混。** `name || '匿名'` 会把 `''` 和 `0` 也换成默认值。`name ?? '匿名'` 只在 `null` 和 `undefined` 时才换。展示文案时，0 次和空字符串经常是合法值。

**数字只有一种。** JS 的 number 是 64 位浮点，没有 Java 的 `int` / `long`。

- `0.1 + 0.2 === 0.3` 为 false。金额不要用它做精确相等。
- 整数安全范围到 `2^53 - 1`（`Number.MAX_SAFE_INTEGER`，本仓流程图布局里用这个常量当边界）。Java 的 Long、雪花 id 若以 JSON number 传来，低位会丢，和后端比 id 会对不上。契约上这种 id 用字符串。

**引用。** 对象和数组赋值只复制地址。`const` 锁的是这个绑定不能再指向别处，对象里面仍能改：`obj.x = 1` 合法。两个变量可以指向同一份对象，改一处另一处看得到。下一课会看到：就地 `push`、改字段，页面可能不重画。这节只要求看懂「这不是拷贝」。

字符串、number、boolean 按值比较。对象用 `===` 比的是是不是同一个引用，不是字段相不相等。

### 1.5 类型在打包后不存在

本仓 `tsconfig.json` 以现场文件为准：`strict: true`，`jsx: "react-jsx"`，`module: "esnext"`，`moduleResolution: "bundler"`，`noEmit: true`。tsc 不产出 JS，转译在 Webpack（Babel）里做。

| 写在 TS 里的 | 运行时 |
|--------------|--------|
| `interface`、`type`、泛型 `T` | 没有了。不能 `instanceof` 一个 interface，也不能按 `T` 分支 |
| `name?: string` | 这个字段的类型含 `undefined`，`strict` 会逼你处理 |
| `as Project` | 只让编译器闭嘴，不检查这份 JSON 里有没有这些字段 |
| `any` | 把检查关掉。`catch (e: any)` 在仓库里能看到，后面要用 `e?.msg` 这种可选链 |

口播：TS 是给 IDE 和打包器的契约。接口文档和返回 JSON 不一致时，页面会在运行时炸，编译可以通过。

### 1.6 `this`、箭头函数、闭包

普通函数的 `this` 看谁调用它，不像 C++ 成员函数、Java 实例方法那样绑死在对象上。

```js
const mgr = {
  name: 'cs',
  hi() { return this.name },
}
const fn = mgr.hi
fn()
```

`mgr.hi()` 得到 `'cs'`。把方法拿下来再调用，`this` 不再是 `mgr`。箭头函数没有自己的 `this`，用的是外层那个。读 `mgr` 里注册给定时器、WebSocket、桥的回调时，先看它是普通函数还是箭头函数。

闭包：内层函数可以读外层的变量，并且让这些变量在外层函数返回之后还活着。

```js
function makeCounter() {
  let n = 0
  return () => ++n
}
```

每次调用返回的函数，加的是它自己记住的那个 `n`。定时器和 SharedWorker 的监听也是这样：回调读到的是它捕获的那份绑定。人以为会看到「现在的最新值」，实际还是注册当时闭包里的那份。`sharedworkerMgr.ts` 的注释说的就是这件事。怎么配合 React 的依赖数组，第 2 次讲。

### 1.7 异步：三端同一件事，前端多两个坑

完整三段在 [03-demo-snippets.md](./03-demo-snippets.md) Demo A。课堂上三份都贴，各讲一句：

```ts
async function reload(setList: (v: Project[]) => void) {
  try {
    const res = await request.get('/api/projects');
    setList(res.data);
  } catch (e: any) {
    alertMessage.error({ content: e?.msg ?? '加载失败' });
  }
}
```

- C++：回调里才 `setItems`。回调外面还没有数据。
- Java：`thenAccept` / `CompletableFuture` 完成之后才更新。
- 前端：`await` 把后面的代码推迟成微任务。`setList` 为什么会让页面重画，下一课讲。这节只讲「数据还没到，就不能当它已经在手里」。

两个坑，各举一次：

1. 漏写 `await`。`const res = request.get(...)` 时，`res` 是 Promise，不是响应体。接着写 `res.data` 得到 `undefined`，很像「接口没返回字段」。
2. `try/catch` 包不住一个没人等待的 Promise。要么 `await`，要么 `.catch`。否则就是 1.3 里的 Unhandled Rejection。

两条 `await` 是先后，不是两个线程。要同时发、都完成再往下，用 `Promise.all`。它仍回到这条主线程，只是等待期间线程可以去处理点击和别的回调。

### 1.8 投屏和验收

控制台已经在 1.3 跑过 `A D C B`。剩下打开两处：

1. `tsconfig.json` 的 `noEmit`。
2. 任意一处业务里的 `await request...`，指出 interface 不会出现在运行时；若这行没有 `await`，当场说明 `res` 会是 Promise。

**验收**（口头，四问里能答上三问即可）：

1. 页面卡死、点击没反应：主线程上有一段同步代码没跑完，不是「再开个 Tomcat 线程」能解决的。
2. 刷新后表单没了，语言却还在：变量没了，`localStorage` 还在。
3. 接口少字段，和 JSON 里的 `null`：前者多半是 `undefined`。`if (count)` 在 0 时为假。
4. Java Long 用 JSON number 传来，和后端字符串对不上：超过 `2^53 - 1` 会丢精度。
5. 加分：漏写 `await` 时，拿到的是 Promise。

**只有两次时**：开头留约 35 分钟，只讲主线程表、`A D C B`、两个空、`??`、Long 精度、漏写 `await`。`this`、闭包、SharedWorker、`localStorage` 改成点名，不展开。

---

## 2. 第 2 次 · 页面为什么会变

**学完能做什么**：读一个组件，能指出结构是 JSX、会变的数据在哪、改它必须走 `setState` 或 hox 的更新函数。能决定这块状态该留在组件里，还是放到 hox / `mgr`。

细表在 [01-day1-slides.md](./01-day1-slides.md) 幻灯 10–17，hox 对照在 [02-day2-slides.md](./02-day2-slides.md) 幻灯 38。

| 段 | 时长 | 讲什么 |
|----|------|--------|
| 开场 | 5 min | 变量改了，页面可以完全不动 |
| 声明式 UI | 15 min | UI ≈ f(state)，对上 Qt 控件树 |
| 三个钩子 | 25 min | props、`useState`、`useEffect`、列表 `key` |
| 状态放哪 | 20 min | 组件 / hox / mgr，各打开一处 |
| antd 与样式 | 15 min | 控件库只拆一个 Table；样式接第一次的概念卡 |
| 投屏 + 验收 | 10 min | 工作台或工作流里一列，从 JSX 指到更新函数 |

### 2.1 声明式，不是改控件

| | Qt | React 18（本仓） |
|--|-----|------------------|
| 结构 | QWidget 树，改属性 | 组件函数返回 JSX，React 再对上真实 DOM |
| 更新 | `setText` / `update()` | state 或 props 变了，函数再跑一遍 |
| 通信 | 信号槽 | props 向下，回调向上；跨组件用 hox 或 mgr |

口播：看到 `return <Table ... />` 不是「创建了一个永久控件」。它是「当前这份数据长这样」。直接改对象字段 `obj.x = 1` 不会触发重画。

### 2.2 只讲这四个名字

| 名字 | 近似 | 本仓里要记住的坑 |
|------|------|------------------|
| `props` | 构造参数 | 父组件传入。子组件不要改 props |
| `useState` | 会触发重画的成员字段 | 必须调用它的更新函数。改完数组要用新数组，不要 `push` 完以为界面会动 |
| `useEffect` | 订阅 / 析构，不是每帧 tick | 依赖数组决定何时重跑。开发模式 StrictMode 下可能跑两次，重复请求先怀疑这里 |
| 列表 `key` | 这一项的身份 | 给调和用。不要用会变的下标凑合，也不要把它理解成展示给用户的主键文案 |

不讲：`useMemo`、`useCallback`、自定义 Hook、性能优化。学员问到就说「定位阶段先看成普通函数，别先改它」。

### 2.3 状态放哪

第一次课的标准路径第 4 步问过「数据从哪来」。这里给判据：

| 放哪 | 什么时候 | 寿命 | 本仓 |
|------|----------|------|------|
| 组件 `useState` | 只有这一块 UI 在用 | 组件卸掉就没 | 输入框、弹窗开关 |
| hox `createStore` | 多个组件要同一份 UI 数据 | 仍在 React 树上，**刷新就没** | 例如 `src/store/flow/`、各页 `store.ts`。用法是 `createStore` + Provider，不是一份全局 Spring 容器 |
| `src/mgr/` | 一段命令式流程：开 3D、编排步骤 | 模块级对象，刷新一样重新来 | 对上 C++ 的 Manager。和 hox 并存：mgr 编排，hox 放 UI 状态 |
| Java | 刷新后还要在的、要鉴权的 | 服务端 | 前端只是缓存下来的一份 |

口播：不要把 hox 当成 Spring。它没有事务，也不是进程级单例。

### 2.4 antd 和样式，接上概念卡

antd 是控件库，不是另一套页面框架。只拆一个已有的 `Table`：`columns`、`dataSource`、`rowKey`、`loading` 都是 props。数据仍从 `services` 或 hox 来，表格自己不负责请求。

样式：第一次知道 Less 管怎么写、CSS Modules 管类名别串、antd token 管主题。这次只补一句因果——样式跟着 class 和 token 走，文案和数字跟着 state 走。想改一列的文字，去数据，不去 less。

**投屏**：`/workbench` 或 `/flow` 已经能定位到的入口组件。指一处 JSX，再跳到对应的 `useState` 或 `createStore`。不要现场新写组件。

**验收**：给一段「按钮点了，本地变量改了，界面没动」，学员能说出缺的是更新函数。再问一份跨组件的列表，能说出该看 hox 还是 mgr，以及刷新后它为什么没了。

---

## 3. 第 3 次 · 请求、缓存、三端各管一段

**学完能做什么**：一条失败的请求，能分成业务 `code`、HTTP/CORS、旧静态资源三层。一次发版事故，能说出是 Java 契约先变了，还是用户还拿着旧的 `index.html`。

细表在 [02-day2-slides.md](./02-day2-slides.md) 幻灯 27–29、32–37、40。缓存现象对照 [04-hotspots.md](./04-hotspots.md)。

| 段 | 时长 | 讲什么 |
|----|------|--------|
| 开场 | 5 min | 一页上的数据只有三条路：路由、HTTP、桥 |
| 路由 | 12 min | 地址变了，通常不向 Java 要整页 |
| 拦截器 | 25 min | 走读 `request.ts` |
| CORS | 10 min | Java 同事最常见的「日志有、页面像没发」 |
| 缓存与发版 | 23 min | 页面状态和 HTTP 缓存不是一层 |
| 三端时序 | 10 min | 点一下，责任落在哪一端 |
| 验收 | 5 min | 抽一条 Network |

### 3.1 路由不是 Controller

| | Java | 本仓 |
|--|------|------|
| URL 变了 | 再进一次 DispatcherServlet | JS 换组件，浏览器不整页刷新 |
| 入口 | Controller | `src/index.tsx` 挂布局，`src/layouts/routeConfig.ts` 决定哪个页面 |
| 生产环境 | 每个路径可以是不同接口 | Nginx 把页面路径退回 `index.html`，再由前端路由接手 |

口播：F5 才重新要 `index.html`。地址栏从 `/workbench` 到 `/flow`，Java 可以一条日志都没有。

### 3.2 走读拦截器

文件：`src/utils/request/createRequest.ts`、`src/utils/request/request.ts`。第一次只知道「Bearer、`code === 200`、嵌入态 `setLogOut()`」。这次按调用顺序讲：

1. 请求拦截：塞 `Authorization: Bearer …`。过期会排队再 `refreshToken`。
2. 响应拦截：`Blob` 原样返回（下载）；`code === 200` 解包业务体；其它业务 code 拒绝。登录失效：嵌入 Qt 走 `CsAppManager.setLogOut()`，纯 Web 走登录页。
3. HTTP 层：401 / 404 / 5xx / 超时 / 断网，和业务 `code` 不是同一层。

给 Java 的契约就这一张：

| 约定 | 说明 |
|------|------|
| 成功 | 响应 JSON 的 `code === 200`。HTTP 200 不够 |
| 鉴权 | `Authorization: Bearer` |
| 登录失效 | 业务 401 或 HTTP 401。嵌入态和纯 Web 分流，第一次课已对过文件 |
| 下载 | `Blob`，不要按 JSON 解 |
| 上传 | `FormData` 不要被改成 `application/json` |

### 3.3 CORS，只对现象

开发环境 `/api` 由 `craco.config.js` 代理，浏览器以为还是 localhost，所以本地常常看不到 CORS。生产或被人用文件直连、用错域名时才会出现。

| 现象 | 先看 |
|------|------|
| Console 红字 CORS，Network 里 `(failed)` | 响应是否带 `Access-Control-Allow-*` |
| 只有 OPTIONS，没有后面的正式请求 | 预检是否被网关丢掉 |
| Cookie 带不上 | 是否跨站、`withCredentials`、SameSite。本仓生产在 `createRequest` 里打开了 `withCredentials` |
| 路径多一段或少一段 | 网关前缀和前端 baseURL |

口播：后端日志有、前端像没发出，第一现场仍是 Network，不是先改页面。

### 3.4 两层「缓存」不要混

| | 页面状态 | HTTP 缓存 |
|--|----------|-----------|
| 是什么 | `useState`、hox、mgr 里的对象 | 浏览器保存的 html / js / css 文件 |
| 刷新 | 没了，要重新请求 Java | 文件还在，可能根本不再请求 |
| Network | 看接口的 Status 和 `code` | 看静态资源的 Size：`(disk cache)` / `(memory cache)`，或 304 |
| 谁的问题 | 前端没把新数据写进 state，或接口没返回 | 发版和 Nginx / CDN 头 |

本仓产物在 `dist/`（CRACO 改过，不是 CRA 默认的 `build/`）。构建给 js/css 加 hash：内容变，文件名变。

```text
index.html       要短缓存或协商。它负责指向最新的 hash
*.[hash].js/css  可以长缓存。换内容 = 换 URL
/api/*           不要按静态资源缓存
```

事故路径：Java 先上了新字段，Nginx 把 `index.html` 也设了很长的 `max-age`，用户一直用旧入口里的旧 JS，旧 JS 调新接口。现象像「随机」报错。Disable cache 只对开着 DevTools 的人有效；清 C++ 安装目录也不等于清 WebView 的 HTTP 缓存。

### 3.5 三端时序，收束

```text
用户点一下
  → React 改 state，页面重画          （第 2 次）
  → 要权威数据：axios → Java            （本节 3.2）
  → 要本机能力：CsAppManager → C++      （第一次已会定位到 type）
静态资源：Nginx / CDN，浏览器按缓存头决定用不用本地文件
```

C++ 嵌入时补三句，不重讲桥协议：页面不能随意读本地路径，选目录走桥；桥也是异步回调，不能写成同步阻塞；WebView 的 HTTP 缓存和安装目录是两套。

**投屏**：Network 里一条业务请求，对上 `services` 里的 path，再指出响应 `code`。再看一条 js 的 Size 列，说出它有没有打到服务器。

**验收**：

1. HTTP 200 且 `code !== 200`：业务失败，先对契约，不先改组件。
2. Console CORS、`(failed)`：先对网关响应头。
3. 页面还是旧字段、js 显示 disk cache，或 html 也被长缓存：发版和缓存，不是这次接口写错。

---

## 4. 两次怎么压

只有两个 90 分钟时，上「页面」和「请求」，运行时并进页面那次的开头：

| 次 | 90 分钟里留什么 | 砍掉 |
|----|-----------------|------|
| A | 主线程、`A D C B`、两个空、`??`、Long 精度、漏写 `await`（35 min）+ 声明式 UI、`useState`、状态放哪（55 min） | `this`、闭包、SharedWorker、`useEffect` 细节、antd Table 拆解 |
| B | 第 3 次整场 | 不砍。拦截器和缓存是 Java / 发版同事最缺的一块 |

三次都上时，不要把第 1 次再加长去讲原型链、闭包习题或泛型。那些不帮他们看本仓的页面。

---

## 5. 三次之后仍然不做

- 独立新做一个列表 + 表单 + 路由的页面。那是 [培训.md](./培训.md) 的集训，不在这 4.5 小时里。
- 引入 Vite、Redux、TanStack Query、Tailwind。主仓栈不变。
- 把 AI 改代码当成新模块。第一次的定位 Prompt 继续用；真要改时，把「请只做定位」换成一句具体改动，改完自己打开文件、看 Network。
