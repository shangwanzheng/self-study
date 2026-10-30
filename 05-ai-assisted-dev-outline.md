# 培训大纲

面向**Java 云服务**、 **C++ 客户端** 同事。  
目标：
1. 启动项目，理解目录结构；
2. 使用 DevTools 和 AI 排查常见问题；
3. 能够使用AI完成部分简单需求的开发；


> 与现有材料关系：  
> - [00-90min-slides.md](./00-90min-slides.md)：先「读懂」前端链路（建议课前自学或开场压缩讲）  
> - [CsAppManager架构.md](./CsAppManager架构.md)：Web ↔ C++ 客户端桥的细图（本课只讲怎么定位到文件）  
> - **本文**：备课大纲（三档定位：路由找文件 / AI / DevTools）  

---

## 1. 培训目标

### 1.1 学完能做什么

| 级别 | 能力 | 示例 |
|------|------|------|
| L1 | 本地跑起来、定位到改动文件 | `npm start` → 从路由找到页面 → 知道改哪 |
| L2 | 简单定位问题 | 使用AI |
| L3 | 如何使用Chrome的Devtools定位问题 | DevTools相关的使用方法 |


---

## 2. 模块大纲

三档对应三个模块，按 L1 → L2 → L3 讲。L1 走通「地址到文件」，L2 用 AI 把说得清的现象缩到文件，L3 只简讲 DevTools 怎么给出线索。样式、构建、框架这些概念不单开模块，收在 M1：它们是读文件用的词，学员第一次看见 `.less`、`craco`、antd 时正好归类。

| 模块 | 对应 | 建议时长 | 形式 |
|------|------|----------|------|
| M1 | L1 本地跑起来、定位到改动文件（含概念卡、basic 简讲） | 70–75 min | 讲授 + 投屏找文件 |
| M2 | L2 简单定位问题（使用 AI） | 35–40 min | 讲授 + 一次提问示范 |
| M3 | L3 Chrome DevTools 定位 | 15–20 min | 简讲 + 现象对照 + 一条 Network |

---

### M1 · L1 本地跑起来，定位到改动文件

**学完能做什么**：主仓 `npm start` → 从路由找到页面 → 知道改哪。看到 `.less`、`.tsx`、`craco`、antd 能说出它属于哪一类。basic 能说出三个子工程各自干什么、进哪个目录启动、页面在 `src/views`。

**讲什么**

1. 从 clone 到打开页面（投屏按这个顺序做一遍）：

```text
git clone <仓库地址>
cd ps-cae-cloud-space-frontend
npm install     # 按 package-lock.json 装依赖
npm start       # package.json 里是 craco start
```

终端出现本地地址后，浏览器打开 `http://localhost:8000`（端口在 `craco.config.js` 的 `devServer.port`）。地址栏路径就是路由，例如 `/workbench`、`/login`。能打开登录页即算跑起来。

| 步骤 | 命令 | 讲清这一点 |
|------|------|------------|
| 拉代码 | `git clone` 后进入仓库根目录 | 后续命令都在有 `package.json` 的这一层执行 |
| 装依赖 | `npm install` | 只在第一次，或 lock 文件变了之后再装。仓库 README 写 yarn，锁文件是 `package-lock.json`，课堂用 npm |
| 起开发服 | `npm start` | 本机起服务、改代码热更新。页面请求的 `/api` 由 devServer 代理到 `craco.config.js` 里的 `target`（当前是 `https://cae-dev.poissonsoft.com`） |
| 不连真后端 | `npm run start:mock` | 同一套页面，接口走 Mock |
| 知道即可 | `npm run lint`、`npm run build` | 检查和打 `dist/`，课上不作为定位步骤 |

改了 `craco.config.js` 的代理地址后，停掉进程再执行一次 `npm start`。`npm install` 或启动报 OpenSSL 类错误时，换成团队约定的 Node 版本再装。

命令讲完，用这张表把刚才的步骤对到 C++ / Java（整页，停一下）：

| 维度 | C++ | Java | 本仓前端 |
|------|-----|------|----------|
| 工程入口 | CMake / VS | `pom.xml` | `package.json` 的 `scripts` |
| 依赖 | vcpkg / conan | Maven Central | npm + lockfile（锁整棵树） |
| 构建 | 编译 + 链接 | javac + spring-boot 打包 | Webpack via react-scripts + CRACO |
| 产物 | exe / dll | jar / war | `dist/` 下 HTML+JS+CSS（无 JVM） |
| 环境 | Debug / Release | profile | `NODE_ENV`、`.env`、devServer 代理 |
| 质量 | clang-tidy | Checkstyle | ESLint + Prettier（`lint` / `lint:prettier`） |
| 测试 | gtest | JUnit | Jest + jsdom（测函数/组件，非真机浏览器） |
| 多入口 | 多 target | 多 module | `start` / `start:mock` / `demo` / `demo:ui` |

口播：前端构建 = 转译 TS/JSX + 打包模块 + 压缩 + 文件名 hash，方便 CDN 强缓存。本仓 CRACO 把 CRA 默认的 `build/` 改成了 `dist/`。

2. 概念卡：看到这些词，它是哪一类（约 8 min）

只讲读文件时会撞上的名字。每一类点一个同类技术，避免把写在一起的东西当成同一种东西。课上不展开没在仓库里出现的库。

样式。Less 和 Sass 是一类；CSS Modules 是另一类，本仓经常和 Less 写在同一个文件里。

| 看见 | 它是 | 同类还有 | 本仓 |
|------|------|----------|------|
| 页面旁的 `.less` | 预处理器：变量、嵌套、混入，编译成普通 CSS | Sass / SCSS、Stylus | 改样式先看同名 less |
| CSS Modules | 作用域：类名只在当前组件生效，避免全局互相覆盖 | Vue 的 `scoped` | 和 Less 一起用，不是第二种预处理器 |
| antd token | 设计令牌：颜色、字号、间距，用来跟组件库主题对齐 | CSS 变量 | 和 less 一起决定「长什么样」 |
| （知道即可）PostCSS | 后处理：在已经是 CSS 的结果上加前缀、压缩 | Autoprefixer | 构建链里，不手写 |
| （知道即可） | 样式写在 JS 里，或用工具类拼界面 | styled-components、Tailwind CSS | 本仓不用 |

界面和语言。主仓和 basic 各用一套，找文件时不要混。

| 看见 | 它是 | 同类还有 | 本仓 |
|------|------|----------|------|
| `.tsx` | React 组件：TypeScript 里写 JSX（类似 HTML 的结构） | `.vue` 单文件、Angular | 主仓 `src/pages/` |
| `.vue` | Vue 组件 | — | basic 的 `src/views/` |
| antd | React 组件库（按钮、表格、表单） | Material UI、Arco | 主仓 |
| Element Plus | Vue 组件库 | — | basic |
| `.ts` / `.tsx` | TypeScript：带类型检查，编译成 JS 后浏览器才跑 | — | 全仓。浏览器不直接跑 `.ts` |
| Node.js | 本机运行环境：执行 `npm`、起开发服务器 | — | 不是页面里的语言 |

从源码到页面。接上一张 C++ / Java 对照，把「本仓前端」那一列拆开。

| 看见 | 它是 | 同类还有 | 本仓 |
|------|------|----------|------|
| `package.json`、npm | 包管理：声明、安装、用 lock 锁依赖 | Yarn、pnpm | 主仓 npm；basic 的 admin 用 pnpm |
| `craco.config.js` | 在 Create React App 默认的 Webpack 配置上打补丁（端口、代理、别名） | Vite 配置 | 主仓。改代理后要重启 `npm start` |
| Webpack（经 react-scripts） | 打包：很多文件合成少量 JS/CSS，压缩并给文件名加 hash | Vite、Rollup、Rspack | 主仓 |
| Vite | 另一套打包和开发服务器，开发时按需转译 | Webpack | basic。命令是 `npm run dev` |
| Babel | 转译：把 TS、JSX 变成浏览器能跑的 JS | SWC、tsc | 构建里，不手改 |
| `routeConfig`、React Router | 路由：地址栏路径对应哪个页面 | Vue Router | 主仓 `src/layouts/`；basic 在 `src/router/` |
| `src/utils/request/`、axios | 发 HTTP 请求 | 浏览器 fetch | 页面数据多经 `src/services/` |
| `src/store/`、hox、`src/mgr/` | 状态：多个组件共享的数据 | Redux、Zustand；Vue 侧是 Pinia | 标准路径第 4 步会问数据从哪来 |
| ESLint、Prettier | 静态检查、统一格式 | Stylelint（管 CSS/Less） | `npm run lint`，课上不作为定位步骤 |
| Jest | 单测：测函数和组件，不打开真浏览器 | Vitest；端到端另有 Playwright | 知道即可 |

口播：Less 解决「CSS 怎么写」，CSS Modules 解决「类名别串到别的组件」。Sass 和 Less 一类。构建是另一条线：TypeScript/JSX 和 Less 先转译，Webpack（主仓）或 Vite（basic）再打包成静态文件。

3. 另一个前端仓库：`ps-cae-cloud-basic-frontend`（约 5 min，点到为止）

基础云服务前端，和工作台不是同一个仓库。技术栈是 Vue 3 + Vite + Element Plus。一个 git 仓库里三个独立工程，`package.json` 在子目录，命令不要在仓库根目录执行。

```text
git clone <ps-cae-cloud-basic-frontend>
cd ps-cae-cloud-admin-frontend    # 或另外两个子目录
pnpm install                      # admin；另外两个是 npm install
npm run dev
```

| 子目录 | 页面 | 启动后看哪里 |
|--------|------|----------------|
| `ps-cae-cloud-admin-frontend` | 云端控制台（主要页面：首页、用户、租户、组织、权限、产品） | 端口在 `.env.dev` 的 `VITE_PORT`，当前 8948。路由在 `src/router/modules/`，页在 `src/views/` |
| `ps-cae-cloud-apidoc-frontend` | API 文档、代码质量、代码统计、依赖 | 默认 5173。路由在 `src/router/index.ts`（`/apidoc`、`/quality`、`/statistics`） |
| `ps-cae-cloud-license-frontend` | License 激活，只有一页 | 默认 5173。`src/App.vue` 直接挂 `src/views/home`，没有路由表 |

和主仓对照（找文件时不要混）：

| | 主仓 cloud-space | basic |
|--|------------------|-------|
| 栈 | React + CRACO | Vue 3 + Vite |
| 启动 | 仓库根目录 `npm start` | 子目录 `npm run dev` |
| 页面目录 | `src/pages/`（`.tsx`） | `src/views/`（`.vue`） |
| 接口封装 | `src/services/` | admin / apidoc：`src/api/`；license：`src/request/` |
| 和 C++ 客户端 | 有 `CsAppManager` | 没有这层桥，页面只调 Java API |

口播：控制台、文档、激活走 basic；工作台、工作流、Carsim 走主仓。basic 课堂上不展开桥和 Mock，能进对子目录、从路由或 `App.vue` 找到 `views` 即可。apidoc 和 license 默认都是 5173，不要同时起。

4. 主仓找文件用得上的地图：

```text
src/index.tsx          入口
src/layouts/           路由 routeConfig.ts、布局
src/pages/             业务页：workbench / workflow / carsim / report / account / login
src/components/        可复用组件（表格、图表、弹窗…）
src/services/          调 Java API 的封装
src/utils/request/     axios 拦截器（Bearer、code===200）
src/store/ + src/mgr/  页面状态 / 命令式总管
src/i18n/              中英文案
src/utils/csapp.ts     Web ↔ C++ 客户端桥（CsAppManager）
src/utils/csappExtend.ts  关页、登录等桥上的收尾回调
```

5. 地址和业务对照（用来对上「这是哪个页面」）：

| 路径 | 业务 |
|------|------|
| `/workbench` | 项目列表、创建/复制 |
| `/flow` | 工作流画布与节点 |
| `/carsim` | 车辆实时 |
| `/workflow/report/*` | 在线报告 |
| `/login`、`/user/*` | 登录与账号 |

6. 标准路径（背下来）。前三步定位到页面文件，后三步决定改动落在数据、文案还是样式：

```text
1. 浏览器地址 / routeConfig 路径
2. pages/xxx 入口组件
3. 往下找：同目录 components / views / dialog
4. 数据从哪来：本文件 request？services？store/mgr？还是 CsAppManager？
5. 文案：t('key') → i18n json
6. 样式：同名 less（预处理器）/ CSS Modules（类名隔离）/ antd token（主题变量），差别见概念卡
```

7. 前端和客户端怎么说话（约 10 min）。现象在 Qt 窗口上（选目录、3D、Tab 标题、关页、主题）时，先搜桥。细图见 [CsAppManager架构.md](./CsAppManager架构.md)。只对主仓；basic 没有这层。

只有嵌入 Qt WebView、`window.qt.webChannelTransport` 存在时，`isCsBrowser()` 为 true，`sendMessageToQt` 才会发出。课堂上用 Chrome 打开 `localhost:8000` 时，这些调用空过。入口在 `src/index.tsx` 的 `CsAppManager.start()`。

| 方向 | 路径 | 定位时搜什么 |
|------|------|----------------|
| Web → CS（请求-响应） | 页面 / Mgr 调静态方法 → `generate` → `window.CsApp.sendMessageToQt` → `cbMap` 等回包 | 方法名：`setToken`、`selLocalDir`、`show3DViewer`、`openProject` |
| CS → Web（推送） | `window.onMessageFromQt` → 同 type 的 `cbMap` 兑现；其余 `EventManager.emit` | `MessageType` 字符串；订阅处在页面、`D3ViewerManager`、`CsAppExtend` |

包格式是 `{ msgNo, type, data }`。控制台已有 `toCS:` / `fromCS:`，比 Network 好用：桥不走 HTTP。

消息域只记名字，协议以 `csapp.ts` 顶部 `MessageType` 为准：

| 域 | 示例 | 谁在用 |
|----|------|--------|
| 项目 | `OpenProj`、`selLocalDir`、`SaveProject`、`closeClient` | 工作台、工作流 |
| 鉴权 | `SetToken`、`GetMacAddress`、`RefreshToken` | 登录、KeepAlive |
| Tab / 配置 | `SetTabTitle`、`SetClientTheme`、`autoSaveSet` | 工作台 |
| 3D | `show3DViewer`、`cs3DVLayoutChange`、`startSimuAnalysis` | `D3ViewerManager`、Carsim |

和 Java 的分界讲一句：`RefreshToken` 由 CS 推到 Web，Web 调 `refreshToken`，再 `setToken` 写回客户端。拦截器里登录失效时，嵌入态走 `CsAppManager.setLogOut()`，纯 Web 走页面登录（`src/utils/request/request.ts`）。

**投屏**：`src/index.tsx` 的 `CsAppManager.start()`，再打开 `src/utils/csapp.ts` 指 `isCsBrowser`、`generate`、`onMessageFromQt`。

**辅助（仍属 L1）**：IDE 全局搜中文文案、接口 path、组件名、`MessageType`。本地若开了 `code-inspector`，可页面点选跳源码。

**投屏（页面）**：`src/layouts/routeConfig.ts` 里 `/carsim` 或 `/flow` 的 lazy 入口，点进 `pages` 下对应文件，说出「改这里」。

**验收**：给主仓一个已打开页面的地址，学员能说出入口文件路径。再点 basic：能说出该进哪个子目录，页面在 `src/views`。抽问：`.less` 和 CSS Modules 各解决什么；主仓打包是 Webpack，basic 是 Vite。

---

### M2 · L2 用 AI 做简单定位

**学完能做什么**：现象说得清、自己顺着路由还对不上文件时，用 AI 指出该看的文件，并打开核对。

**什么算「简单定位」**

- 某句文案、某个按钮、某一列在哪个文件  
- 控制台一段报错对应哪段代码  
- 某个字段从本文件请求、`services`，还是 `store` / `mgr` 来  
- 选目录、关页、3D 窗、Tab 标题对应 `csapp.ts` 里哪个 `type`  

先走完 M1。范围已经缩到具体文件之后，再问 AI「在这一文件里看哪一段」。

**推荐 Prompt**

```text
【现象】页面 /xxx 上，「……」不符合预期（或控制台报错贴在这里）。
【我已看到】地址是 /xxx；routeConfig 指向 src/pages/.../Xxx.tsx。
【请只做定位】指出最可能要看的文件和函数，并给出依据（文案 key、接口 path 或组件名）。
【不要】改代码，不要重构。
```

**和 Cursor 配合**

- 先 `@` 路由文件和该页目录，再提问；少用「全仓帮我找」  
- Chat 用来问「这段从哪来」；定位阶段不用 Agent 改文件  
- AI 给出的路径必须打开，用搜索确认文案或 path 真的在那个文件里  

**投屏**：选一处看得见的文案或一条短报错，用上面的 Prompt 问到文件，再打开核对。

**验收**：学员能复述「现象 + 已看到的路径 + 只要定位、不要改代码」，并核对 AI 指出的文件。

---

### M3 · L3 用 Chrome DevTools 定位（简讲）

**学完能做什么**：页面已经打开时，从 DevTools 拿出一个名字或一条请求，回到仓库对上文件。点到为止，不讲断点、性能、Application。

| 面板 | 看什么 | 怎么回到仓库 |
|------|--------|----------------|
| Elements | 页面文案、class。右键「检查」选中节点 | 全局搜文案。class 带哈希时，搜文案更稳 |
| Console | 报错里的文件名、行号；桥接日志 `toCS:` / `fromCS:` | 点 `文件名:行号`，开发模式路径里能看到 `src/`；`type` 搜 `csapp.ts` |
| Network | URL path、HTTP 状态码、响应里的 `code` | 搜 path，对上 `services`。HTTP 200 还要看 `code` |
| React DevTools（已安装时） | 组件名 | 搜组件名，对上 `pages` / `components` |

看到现象，先开哪个：

| 现象 | 先看 | 拿回去的东西 |
|------|------|----------------|
| 文案、按钮、样式不对 | Elements，右键「检查」 | 文案；class 带哈希时改搜文案 |
| 控制台红字 | Console，点 `文件名:行号` | 开发模式路径里的 `src/` |
| 列表空、保存失败 | Network，筛 Fetch/XHR | path；HTTP 200 还要看响应 `code` |
| 点了，请求没出现 | 先 Console，再看 Network 有没有这条 | 报错文件，或确认请求没发出 |
| 客户端没反应 | Console 搜 `toCS:` / `fromCS:` | `type`；桥不出现在 Network |

读一条请求（投屏就讲这四句）：

1. 筛 **Fetch/XHR**。**Preserve log**：跳转后请求还在。**Disable cache**：只对开着 DevTools 的这次有效。
2. HTTP 200 不等于业务成功，看响应里的 `code === 200`。
3. 抄 path：去掉域名和 query，到 `src/services/` 搜。
4. `(failed)` 或 CORS：先看代理和网关，别先改页面。

和前两档怎么接：

1. DevTools 拿到文案、组件名或接口 path  
2. 按 M1 的标准路径打开文件  
3. 名字对不上，再用 M2 的 Prompt 把线索交给 AI  

**投屏（一条即可）**：打开业务页 → Network 点一条请求 → 在 `src/services/` 里搜到 path。

**验收**：学员能指出这条请求对应的 `services` 文件，并说清成功看响应里的 `code === 200`。

---

## 3. 备课备注

**概念为什么放在 M1，不单开模块**

这些词不是第四档能力。学员在 M1 第一次看见 `npm`、`.less`、`.tsx`、`craco`、antd token，讲完命令和 C++ / Java 对照后用概念卡归类，后面的目录、basic、标准路径都用得上。M2、M3 是「怎么问 AI / 怎么看 DevTools」，插术语会打断定位。整卡约 8 分钟，只展开本仓和 basic 会碰到的，其余报一个同类名字。M1 因此从 60–65 min 调到 70–75 min。



**演示可以贯穿同一页**（任选一个，三档都用它）：

| 选题 | M1 指出 | M2 拿来问 AI | M3 简讲 |
|------|---------|--------------|---------|
| 工作台项目列表某一列文案 | 路由 → `pages/workbench` | 这句文案在哪个文件 | Elements 里点到该列文字 |
| 登录页错误提示 | 路由 → 登录页 | 报错文案从哪来 | Console 或 Network 一条失败请求 |
| Carsim 某参数输入框 | 路由 → 页面，再点到 `components-complex/views/...` | 这个输入框数据从哪来 | Network 对上对应 `services` |

**三档边界**

| 手头有什么 | 用 |
|------------|----|
| 知道页面地址 | M1 |
| 有现象，不知道文件 | M2 |
| 页面已开，要看 DOM、报错或接口 | M3 |
