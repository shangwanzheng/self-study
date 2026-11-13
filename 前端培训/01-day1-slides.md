# Day1 幻灯稿：语言、运行时、界面模型（附录 · 细表）

> **课堂默认用 [00-90min-slides.md](./00-90min-slides.md)**（15 页 / 90 分钟）。本文只给备课查对照表，不要整本投影。

---

## 幻灯 0 · 开场与目标（共用，Day1 先放）

**标题**：为什么前端值得学

**三端分工一句话**

| 端 | 职责 | 产物 |
|----|------|------|
| C++ 客户端 | 本机能力、嵌入浏览器、文件/硬件 | exe / 插件 |
| Java 云服务 | 权威数据、权限、业务规则 | jar + API |
| 前端 SPA | 交互与展示、调用 API、组装页面 | HTML/JS/CSS 静态资源 |

**学完能做什么**

- 读懂 TypeScript / React 页面结构
- 用 Chrome DevTools 判断问题在前端还是 Java
- 改文案、表单字段、请求参数；看懂 `package.json` 脚本

**一条主线（整两天反复念）**

> 浏览器是「每次导航可重建的进程」；UI 是「状态的函数」；产物是「静态资源 + API」，不是装到机器上的二进制。

---

## 幻灯 1 · 本节地图（Day1）

1. 浏览器与「前端进程模型」（40 min）
2. JavaScript / TypeScript vs C++ / Java（70 min）
3. DOM、React vs 桌面控件（70 min）
4. 样式与 Ant Design（50 min）
5. 状态从哪来（30 min）

---

## 幻灯 2 · 进程模型对照总表

| 维度 | C++ | Java | 前端（浏览器） |
|------|-----|------|----------------|
| 运行载体 | OS 进程 | JVM 进程 | **浏览器 Tab ≈ 进程** |
| 并发模型 | 多线程 + 消息泵 | 线程池 / 请求线程 | **JS 单线程 + 事件循环** |
| 主循环 | Qt event loop / Win32 | 无 UI 时无「帧」 | 事件循环 + 渲染帧 |
| 生命周期 | 可常驻数天 | 服务常驻 | **刷新 / 关 Tab 即丢内存** |
| 卡顿来源 | 锁、IO、主线程忙 | GC、线程打满 | **长任务阻塞主线程 → 掉帧** |

**讲师口播**：前端没有你们熟悉的「后台 worker 线程随便算」默认路径；重活要么拆小任务，要么 Web Worker。

---

## 幻灯 3 · 事件循环 vs Qt / Servlet

**C++**：消息进队列 → 主线程取消息 → 更新控件  
**Java**：请求进 Tomcat 线程 → Controller → 写响应 → 线程归还  
**前端**：宏任务（setTimeout、I/O 回调）→ 微任务（Promise.then）→ 布局/绘制

**必讲差异**

- 无手动 `new/delete`、几乎不调 GC；卡顿 = 主线程被同步代码占满
- 同源策略、Cookie、CORS：Java 网关同事最相关（「后端有日志、前端像没发出」）

**本仓路径**：`src/sw/websokcetMgr.ts`、`src/sw/sharedworkerMgr.ts`  
长连接不是「服务端线程」，是浏览器里的 SharedWorker + WebSocket。

---

## 幻灯 4 · 分轨提示（贴墙用）

| 角色 | Day1 多停在 | Day2 多停在 |
|------|-------------|-------------|
| C++ | 渲染循环、内存、事件、闭包捕获 | 嵌入 WebView、文件下载、证书 |
| Java | Promise、DTO、null/undefined | HTTP、JWT、错误码、CORS |

---

## 幻灯 5 · JS / TS 对照总表（整页）

| 主题 | C++ | Java | JS + TypeScript（本仓） |
|------|-----|------|-------------------------|
| 类型 | 静态、值/引用由你选 | 静态、几乎全是引用 | **运行时动态**；TS **仅编译期**，打包后擦除 |
| 内存 | RAII / 智能指针 | GC | GC；**闭包可钉住对象** |
| 空值 | `nullptr` | `null` | **`null` + `undefined`（最大坑）** |
| 异步 | future / 回调 | CompletableFuture | **Promise + async/await + 微任务** |
| 模块 | 头文件 + 链接 | Maven 坐标 | **ESM `import` + bundler 打成 bundle** |
| this | 成员函数 | 实例方法 | 普通函数看调用方；**箭头函数捕获外层** |
| 泛型 | 模板实例化 | 擦除（仍有反射痕迹） | **TS 擦除更彻底，运行时看不到 T** |

---

## 幻灯 6 · TypeScript 不是「另一种 Java」

本仓 [`tsconfig.json`](../../tsconfig.json)：

- `strict: true` —— 类型契约尽量严
- `jsx: "react-jsx"` —— JSX 变成 `React.createElement` / jsx 运行时
- `moduleResolution: "node"` —— 按 Node/ bundler 规则找包
- `noEmit: true` —— **tsc 不产出 JS**；真正转译由 Webpack(babel) 做

**口播**：TS 是给 IDE 和打包器看的契约；线上跑的是擦除类型后的 JS。

---

## 幻灯 7 · 短对照：请求后更新列表（口头 5 行）

**C++（伪）**

```cpp
httpGet(url, [this](auto list) { model->setItems(list); });
```

**Java**

```java
client.get(url).thenCompose(list -> {
  ui.setItems(list); return null;
});
```

**本仓 TS**

```ts
const { data } = await request.get('/api/projects');
setList(data); // React state，触发重渲染
```

完整三段见 [03-demo-snippets.md](./03-demo-snippets.md) Demo A。

---

## 幻灯 8 · null / undefined / 可选链

| 语言 | 「没有」 |
|------|----------|
| C++ | `nullptr`；未初始化是 UB |
| Java | `null`；拆箱 NPE |
| JS/TS | `null`（人为空）+ `undefined`（没赋值/没字段） |

前端高频写法：`user?.profile?.name ?? '匿名'`  
对应 Java：一串 `Optional` 或判空；对应 C++：可选 / 空指针检查。

---

## 幻灯 9 · 模块与依赖树

| | C++ | Java | 前端 |
|--|-----|------|------|
| 声明依赖 | CMake / vcpkg | `pom.xml` | `package.json` |
| 锁版本 | 看工具链 | 可锁 | **`package-lock.json` 锁整棵树** |
| 运行时拿到代码 | 链接进 exe | classpath | **打包进少数 `.js` 文件** |

**口播**：前端「依赖」不是链接一个 dll，而是把成千上万个小模块打进浏览器可下载的包。

---

## 幻灯 10 · UI 模型对照：控件树 vs 声明式 UI

| | C++ Qt | Java（若碰过 UI） | React 18（本仓） |
|--|--------|-------------------|------------------|
| 结构 | QWidget 树 | Swing / 模板 HTML | **组件树 → 虚拟 DOM → 真实 DOM** |
| 更新 | 改属性 / `update()` | 改模型或重绘 | **state/props 变 → 函数再跑** |
| 通信 | 信号槽 | 监听器 | props 向下、回调向上；全局用 store |
| 思维 | 命令式改控件 | 偏命令或 SSR | **UI ≈ f(state)** |

---

## 幻灯 11 · props / state / effect 映射

| React | 近似映射 | 注意 |
|-------|----------|------|
| `props` | 构造参数 | 约定不可变；父级传新对象会触发更新 |
| `useState` | 成员字段 | **禁止** `obj.x = 1` 然后期望刷新；要 `setState` |
| `useEffect` | 构造/析构/订阅 | 依赖数组决定何时重跑；别当「每帧 tick」 |
| 列表 `key` | 身份 ID | 给调和算法用，不是展示给用户的主键文案 |

完整对照组件见 Demo B。

---

## 幻灯 12 · 重渲染心智（给 C++ 同事）

Qt：`label->setText("ok")` —— 只动一个控件。  
React：`setStatus("ok")` —— **组件函数再执行一遍**，React 再 diff，尽量少改 DOM。

**常见坑**：在 render 里创建「新对象 / 新函数」当 props → 子组件无意义重渲染。  
2 天课只点到为止，不展开 memo。

---

## 幻灯 13 · 本仓页面怎么拆

| 目录 | 含义 | 对照 |
|------|------|------|
| `src/pages/` | 路由级页面 | 一个「窗口/场景」 |
| `src/components/` | 可复用 UI | 自定义控件 |
| `src/mgr/` | 命令式 Manager | **C++ 单例 Manager** |
| `src/services/` | API 封装 | Java Feign / Retrofit 客户端 |
| `src/store/` | hox 全局/页面状态 | 有限生命周期的「会话内存」 |

Carsim / workflow 复杂业务：`components` + `mgr` 并存 —— UI 声明式，编排可命令式。

---

## 幻灯 14 · 样式对照总表

| | C++ | Java 后端 | 本仓前端 |
|--|-----|-----------|----------|
| 写法 | QSS / 资源 | 几乎无；管理台或 SSR | **CSS + Less** |
| 作用域 | 控件 objectName | — | **CSS Modules**（类名带 hash） |
| 主题 | 换 skin 文件 | — | Less `modifyVars`（如 `@primary-color`） |
| 布局 | QLayout 对象 | — | **Flex / Grid** |
| 单位 | px 为主 | — | px + **postcss-pxtorem**（本仓 rootValue=100） |

**本仓路径**：[`craco.config.js`](../../craco.config.js)（Less、Modules、`localIdentName`、pxtorem）

---

## 幻灯 15 · Ant Design = 公司级控件库

对照 Qt Designer 控件箱 / Java Swing 组件：

- Button、Form、Table、Modal —— 开箱即用
- 本仓：`antd@5` + 内部包 `@pscae/ps-cae-cloud-ui`（见 `src/index.tsx` 的 `ConfigProvider`）
- 主题色：`@primary-color: #2878ff`（CRACO modifyVars）

**口播**：先搜 Ant Design 文档有没有现成组件，再手写 CSS。

---

## 幻灯 16 · CSS Modules 一句话

```tsx
import styles from './index.module.less';
<div className={styles.panel} />
```

打包后 `panel` → 类似 `panel_a3f2c`，避免全局类名冲突。  
对照：C++ 里给每个控件唯一 `objectName`；Java 无直接对应物。

---

## 幻灯 17 · 状态存放处三列对照（Day1 收束）

| | C++ | Java | 前端 |
|--|-----|------|------|
| 瞬时 UI | 对象成员 | 请求 Scope / ThreadLocal（少） | **组件 `useState`** |
| 页面/会话 | 单例 / 共享内存 | Session / Redis | **hox store（刷新丢失）** |
| 权威数据 | 本地文件 / 服务 | **DB** | **只能来自 API** |

**金句**：浏览器内存不是数据库；刷新后一切以服务端为准。

**本仓**：`createStore` from `hox` —— 例 [`src/store/flow/index.ts`](../../src/store/flow/index.ts)、[`src/pages/carsim/store/index.ts`](../../src/pages/carsim/store/index.ts)

---

## 幻灯 18 · Day1 小结 + 课后作业

**记住三句**

1. 单线程事件循环 —— 别堵主线程  
2. TS 类型会擦除 —— 线上仍是 JS  
3. UI = f(state) —— 用 setState，别当 Qt 改字段  

**可选作业（10 min）**

1. `npm start` 打开任意业务页  
2. F12 → Network，点一条 API  
3. 对照页面上哪块 UI 吃了这条响应的 `data`

录屏操作细节见 [03-demo-snippets.md](./03-demo-snippets.md)。

---

## 幻灯 19～22 · Day1 附录页（可选用）

### 19 名词速查

| 词 | 一句话 |
|----|--------|
| SPA | 单页应用：换路由不整页刷新 |
| Bundle | 打包后的 JS/CSS 文件 |
| Hook | 函数组件里用的状态/副作用 API |
| VDOM | 虚拟 DOM，diff 用 |
| CORS | 浏览器跨域限制，由服务端响应头放行 |

### 20 DevTools 三面板

- Elements：看 DOM/样式（≈ 看控件树）  
- Console：日志与临时表达式  
- Network：联调第一现场（Status / Headers / Response）

### 21 本仓目录地图（简）

```
src/
  pages/      业务页
  components/ 通用组件
  services/   接口
  utils/request/  axios
  mgr/        命令式管理器
  store/      hox
  sw/         SharedWorker / WS
```

### 22 Q&A 预留
