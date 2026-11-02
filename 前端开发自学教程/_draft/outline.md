# 前端开发自学教程 · 大纲

新课。不署名。运行时全局名 `Course`。输出目录：`D:\文档\training\前端开发自学教程`。

读者：会写基本 HTML、会用 Git、知道 HTTP 状态码的程序员。目标是按《前端开发技能模型》达到中级：能独立完成页面、样式和接口联调。高级全表在第 9 章建立地图，标成「碰到再展开」，不把每一种状态库、每一种微前端框架写成操作手册。

材料：`D:\文档\training\前端开发技能模型.md`。界面示例用函数组件和 `useState` / `useEffect` 这些技能模型里的名字，钩子语义以 React 文档原文为准。

姊妹课《Java服务开发自学教程》使用同一笔教学订单。本课不讲线程池、JDK、HashMap 扩容。

## 基准算例

名称：教学订单页。只许引用 `Course.data.order` 和 `Course.orderMath`，不许改数，不许另造同名参数。

- userIdText = `10001`。它在安全整数以内，不能用来演示精度丢失。
- snowflakeText = `9007199254740993`。`orderMath.jsonNumberRoundTrip` 得到 snowflakeRoundedText = `9007199254740992`，差 1。两者都是字符串，禁止写成 JS 数字字面量。
- maxSafeText = `9007199254740991`（2^53-1 的十进制）。
- amountYuan = 199.5，amountFen = 19950。展示用 `orderMath.yuanText()`，得到 `199.50`。金额运算用整数分。199.5 单次转二进制看不出错，仍不许用它做账。
- stock = 8。演示「输入 0 被 || 换成默认值」时，0 只是控件上的输入，默认回退值才是 stock 8。不要把订单库存改成 0。
- page = 1，size = 20，listN = 10000。`orderMath.pageCount()` = 500。
- connectTimeoutMs = 500，readTimeoutMs = 2000，browserTimeoutMs = 3000。三个超时不是同一个数。
- qpsTeach = 50。数量级，不是压测结论，也不是容量承诺。
- route = `/orders`，apiPath = `/api/orders`。
- pageOrigin = `http://localhost:5173`，apiOrigin = `http://localhost:8080`。端口不同，不同源。
- businessCodeOk = 0，businessCodeFail = 40001，httpOk = 200。HTTP 200 且业务 code 非 0 仍是失败。
- frameBudgetMs = 16.7（按 60Hz 估算的一帧，不是设备保证），longTaskMs = 50。
- rowHeightPx = 48，viewportRows = 12，clsShiftPx = 48。
- `orderMath.visiblePx()` = 576，`orderMath.fullListPx()` = 480000。
- bundleMainKb = 180，bundleVendorKb = 420，bundleRouteKb = 40。`orderMath.firstScreenKb()` = 600。懒加载时订单路由块不进首屏。
- htmlMaxAgeSec = 60，assetMaxAgeSec = 31536000。入口 html 短缓存，带内容 hash 的 js/css 长缓存。
- storageKey = `order.draft`，cookieName = `sid`。
- nodeMajor = 20。命令示例按这个主版本写，项目实际版本以仓库约定和文档为准。
- semverLocked = `1.4.2`，semverUnlocked = `1.5.0`。
- secretName = `ORDER_API_SECRET`。只是名字，不是真实密钥，禁止写进前端包。

由 `Course.orderMath` 现算，不要手写另一套：`pageCount`、`visiblePx`、`fullListPx`、`firstScreenKb`、`yuanText`、`jsonNumberRoundTrip`、`isSafeId`、`compareCost`。`compareCost(n)` 返回 `{ linear, nLogN }`，nLogN = n * log2(n)，假设比较排序，是数量级不是基准测试。

## 技能模型覆盖

中级条目都要在正文里用教学订单页走一遍。高级条目集中在第 9 章，用同一笔数字说明会看到什么，不展开每种库的参数表。

| 技能模型 | 章 |
| --- | --- |
| 刷新后还在什么；两层缓存的区分；窗口全局对象 | 1 |
| 浏览器架构、事件循环、页面生命周期、网络基础、开发环境 | 2 |
| 类型与值、数字、作用域与函数、原型与对象 | 3 |
| 异步、模块、标准库；复杂度、线性结构、哈希与树 | 4 |
| TypeScript 四项 | 5 |
| DOM 与渲染、组件、状态、副作用、路由、状态放哪、组件设计 | 6 |
| CSS、工程化样式、组件库；HTTP 客户端、拦截器、跨域、缓存两层；包、构建、环境 | 7 |
| 规范、排错、持续集成、测试、工具 | 8 |
| 高级：架构、性能、运行时、数据层、安全、跨端、发布物、可观测、工程体系、发布、权限 | 9 |
| 把一页做完并排错 | 10 |

## 章

### ch01 技能模型与教学订单页

- 文件：`ch01_skill_map.html`
- 篇：共同语言
- 前置：无
- 小节：1.1 中级要求你独立交付哪一页；1.2 这张表对照 Java 时不搬哪些分册；1.3 教学订单页的字段与单位；1.4 页面全局对象是 window；1.5 刷新后内存、localStorage、sessionStorage、Cookie、已下载的包各留下什么；1.6 三个超时；1.7 接口数据缓存和 html/js 的 HTTP 缓存；1.8 类型打包后会被擦掉，先记住这句话；1.9 路由表不是后端 Controller；1.10 后面九章各自接这条订单页的哪一段
- 易错：用 userId 10001 演示精度丢失；把浏览器超时 3000 当成读超时 2000；刷新后以为 localStorage 草稿也没了；以为页面里有进程级全局袋子
- 避坑：雪花 id 以 JSON number 解析少 1；金额用 199.5 做加减；两条缓存写成同一条失效策略；把 ORDER_API_SECRET 打进前端包
- 演示：切换字符串 / JSON number，读出两种 id 是否保持原样；分步点亮刷新后还在的存储，读出草稿、筛选条件、Cookie 名和带 hash 的脚本各留下什么

### ch02 浏览器：一帧、事件循环与一次加载

- 文件：`ch02_browser_runtime.html`
- 篇：共同语言
- 前置：第 1 章
- 小节：2.1 浏览器进程、渲染进程、JS 主线程、合成、GPU；2.2 一帧里脚本、样式、布局、绘制排队，帧预算 16.7ms；2.3 调用栈；2.4 宏任务与微任务；2.5 Promise 回调与 setTimeout(0) 不是并行；2.6 requestAnimationFrame；2.7 解析 HTML、再要脚本和样式、脚本从上到下；2.8 DOMContentLoaded 与 load；2.9 DNS、TCP、TLS、HTTP 方法与状态码、同源（5173 与 8080）；2.10 Node 20、包管理器、环境变量，浏览器里没有 JVM
- 易错：setTimeout(0) 当成并行；微任务排到下一轮宏任务之后；load 和 DOMContentLoaded 当成同一个事件；端口不同仍当同源
- 避坑：渲染路径上同步重算 10000 行，超过 16.7ms，达到 50ms 才叫长任务；脚本挡住订单列表；TLS 失败当成业务 code；在页面里找 process
- 演示：排队读出脚本、Promise.then、setTimeout(0)、rAF 的顺序；滑块表示脚本耗时 0–80ms，读出是否超过帧预算、是否达到长任务
- 公式：\(1000/60 \approx 16.7\)，假设 60Hz

### ch03 类型、数字、作用域与对象

- 文件：`ch03_js_values.html`
- 篇：对象与结构
- 前置：第 1 章
- 小节：3.1 原始类型与对象、引用；3.2 == 与 ===、null 与 undefined、真值与假值；3.3 ?? 与 ||；3.4 安全整数、雪花 id、金额分；3.5 词法作用域与闭包；3.6 this 与箭头函数；3.7 默认参数与剩余参数；3.8 原型链与 class；3.9 浅拷贝、深拷贝、不可变更新；3.10 标准库里的日期和正则先点到为止，细节在第 4 章
- 易错：== 把 null 和 undefined 放行；|| 把输入 0 换成 stock 8；闭包记下 page=1；浅拷贝后列表和详情改同一块嵌套字段
- 避坑：雪花 id 进 Number；金额用二进制小数相加；var 循环闭包共用一个绑定；JSON 往返深拷贝丢掉 undefined
- 演示：分段比较 ===、||、??，输入件数 0 或 8，读出采用的件数；解析 userIdText 与 snowflakeText，读出是否安全整数、往返后的字符串

### ch04 异步、模块与页面上的结构

- 文件：`ch04_async_modules.html`
- 篇：对象与结构
- 前置：第 3 章
- 小节：4.1 回调；4.2 Promise 三种状态；4.3 async/await 与漏写 await；4.4 Promise.all 与拒绝要接住；4.5 import / export；4.6 ESM 与 CommonJS；4.7 循环依赖、打包前的模块边界；4.8 Array、Map、Set、JSON、URL；4.9 对象当字典的键坑，菜单和路由是树；4.10 线性与 n log n，JS 数组不是定长数组，渲染路径不要整表重算
- 易错：漏写 await 后去读 amountFen；Promise.all 一条拒绝整页空白且没人接住；循环依赖拿到空导出；对象键把 10001 收成字符串，还可能碰到原型键
- 避坑：模块顶层发请求；JSON.stringify 丢掉 Map；对 10000 条在渲染时排序；同一边界 ESM 和 CommonJS 各写一套订单事实
- 演示：分段「写了 await / 漏写 await」，读出拿到的是 19950 还是 Promise；数据量从 20 滑到 10000，用 compareCost 读出线性与 n log n
- 公式：比较排序数量级 \(n \log_2 n\)，假设随机比较，不是某次计时

### ch05 TypeScript：类型在打包后不存在

- 文件：`ch05_typescript.html`
- 篇：对象与结构
- 前置：第 3 章
- 小节：5.1 基础类型、字面量、联合、交叉、可选、只读；5.2 订单 id 用 string，金额用整数分；5.3 typeof、in、可辨识联合（业务 code）；5.4 泛型函数与约束；5.5 tsconfig 与 strict；5.6 路径别名、.d.ts、类型随依赖来；5.7 类型在打包后不存在；5.8 as 不检查运行时数据；5.9 接口响应要有运行时校验；5.10 和「类型留在字节码里」只做一句对照，不展开 Java
- 易错：as 把任意 JSON 当成订单；可选字段在没开 strict 时被当成一定有；联合不收窄就读 list；把 .d.ts 当成校验器
- 避坑：关 strict 消掉字段报错；路径别名只改 tsconfig；相信类型写了 string 所以运行时 id 一定是字符串；把密钥类型写成 string 然后打进包
- 演示：三种 JSON（雪花字符串、雪花被解析成数字后的字符串、缺 amountFen），读出类型标注仍是 string、运行时校验过不过；业务 code 0 与 40001，读出能否取出 19950

### ch06 组件、状态、副作用与路由

- 文件：`ch06_ui_framework.html`
- 篇：方法
- 前置：第 2、3 章
- 小节：6.1 DOM、样式计算、布局、绘制、合成；6.2 回流与重绘，读布局再写样式会强制同步布局；6.3 函数组件、JSX、props、children、事件；6.4 列表 key 用雪花 id，不用下标；6.5 useState，用新对象替换，直接改字段不会重画；6.6 同一轮更新会合并；6.7 useEffect、依赖数组、清理函数；6.8 请求和订阅放副作用；6.9 路径、参数 page/size、嵌套，路由表不是 Controller；6.10 状态放哪，Context 只解决传递；6.11 组合、受控与非受控、容器与展示、自定义 Hook
- 易错：key 用下标，翻页后第一行输入串页；直接改 stock 界面仍显示 8；effect 漏掉 page，翻页仍请求 1；请求写在函数体，每次渲染都打 /api/orders
- 避坑：渲染期间读 offsetHeight；Context 塞进 10000 条；受控 value 和 onChange 各写一份；清理函数没卸，离开页面后仍改 stock
- 演示：key 用下标或订单 id，翻页后读出第一行草稿是否串了；依赖含不含 page，以及请求是否写在渲染里，读出实际请求的 page 和发出次数

### ch07 样式、请求契约与工程化

- 文件：`ch07_style_request_build.html`
- 篇：方法
- 前置：第 5、6 章
- 小节：7.1 盒模型、层叠、继承、选择器优先级；7.2 flex、grid，一页 20 行；7.3 定位；7.4 Less、CSS Modules、局部类名、变量，全局样式会互相盖；7.5 组件库的表单和表格，覆盖样式的层次，不重写基础控件；7.6 请求体、超时 3000ms、取消；7.7 先发 page=2 再发 page=1，后到的旧响应丢掉；7.8 请求头、业务 code 与 HTTP 状态码、失败提示、成功之后才更新列表；7.9 浏览器才拦截跨域，简单请求与预检，Cookie，withCredentials；7.10 dependencies、devDependencies、lock、1.4.2；7.11 入口、转译、loader、开发服务器现给文件、生产是静态产物；7.12 构建期环境变量，多环境 api 基址，密钥不能进包
- 易错：HTTP 200 且 code 40001 仍更新列表；旧响应把地址栏 page=1 的列表盖成第 2 页；全局类名盖住组件库；没交 lock 装到 1.5.0
- 避坑：超时到了却不取消，旧响应仍回来；withCredentials 开了服务端未允许凭据；ORDER_API_SECRET 写进构建变量；业务页重写一套输入框
- 演示：两次请求谁先返回，读出列表应显示的 page、被丢弃的 page；切换 lock 开或关，读出装到的版本是 1.4.2 还是 1.5.0。样式隔离用同一演示旁的分段也可以，但版本数字必须用基准算例

### ch08 排错、测试与协作

- 文件：`ch08_quality.html`
- 篇：现象与判断
- 前置：第 6、7 章
- 小节：8.1 目录职责、命名、组件拆分；8.2 ESLint 与格式化；8.3 Console、断点点到为止；8.4 Elements 看盒模型和被盖住的样式；8.5 Network：状态码、业务 code、内存缓存还是重新下载；8.6 先把现象缩到文件；8.7 安装、类型检查、lint、构建、产物可复现；8.8 测用户看得见的行为、用例、缺陷记录；8.9 组件测试看渲染、点击和输入，请求用假实现，不测框架内部；8.10 编辑器、Chrome DevTools、React DevTools、Git、Wiki、评审、接口文档
- 易错：用 199.5 的偶然相等代替金额分断言；组件测试打到真实 8080；Network 200 就当业务成功；断点步进框架源码，还没缩到订单组件
- 避坑：CI 不锁版本装出 1.5.0；缺陷只写失败，不写 page 和订单 id；把 qpsTeach 写成性能结论；测试互相污染 order.draft
- 演示：切换「断言看得见的 199.50 / 连真实接口」，读出这条测试看的是金额还是 8080；切换 HTTP 200+code 0、HTTP 200+code 40001、HTTP 500，读出下一步该看拦截器、校验还是服务端

### ch09 架构、性能、安全与发布

- 文件：`ch09_architecture.html`
- 篇：现象与判断
- 前置：第 2、6、7 章
- 小节：9.1 多页、单页、服务端渲染、静态生成：首屏、SEO、数据在哪一次请求、部署不同；9.2 微前端是发布和团队边界，分层是页面、组件、请求、状态、桥，聚合放 BFF 时规则仍只有一处；9.3 懒加载与包体积，首屏 600KB，路由块 40KB；9.4 长任务、强制同步布局、10000 行只画 12 行、memo 只在测量后用；9.5 LCP、INP、CLS，实验室一次和用户侧分布不是同一个数，缺高度会移 48px；9.6 Worker 碰不到 DOM，SharedWorker，结构化克隆；闭包、监听、脱离文档的 DOM，堆快照对两次；9.7 并发渲染、transition、Suspense、错误边界，改变的是优先级和失败边界；9.8 两层缓存分开失效，重复点击合并，旧响应丢掉，乐观更新 8 改 7 失败要回到 8，列表和详情不要各写一套 stock；9.9 XSS、CSP、开放重定向，token 放 Cookie 还是内存，HttpOnly、CSRF，包和仓库里没有秘密，lock 与供应链；9.10 WebView 与独立浏览器的存储和刷新不同，Bridge 的消息域、回调配对、超时、版本分开兼容，多 Tab 的登录态和 storage 事件；9.11 入口 html 缓存 60 秒，hash 资源长缓存，回滚改入口，TLS 失败时业务日志还没有这条请求；静态站点、流水线制品、灰度与开关不能代替鉴权；9.12 错误监控和 source map、埋点对齐版本、端到端只覆盖关键路径、写明浏览器；多包、设计系统、文案与布局分开、语义与键盘。其余高级参数表碰到再展开
- 易错：没测量就 memo，首屏仍是 600KB；乐观失败后界面停在 7；html 也缓存一年，回滚后还是旧包；菜单隐藏按钮就当没有权限
- 避坑：订单备注当 HTML 插入；source map 公网可下；灰度开关代替服务端鉴权；多 Tab 把旧 token 写回去
- 演示：行数滑到 10000，读出虚拟列表 DOM 行数是 12、整表高度用 fullListPx；乐观更新成功或失败，读出界面 stock 与服务端 stock。缓存与回滚可做第三个分段：html 短缓存或长缓存，读出回滚后用户拿到的是新入口还是旧脚本

### ch10 把教学订单页做完并排错

- 文件：`ch10_practice.html`
- 篇：实战
- 前置：第 6、7、8、9 章
- 小节：10.1 路由、请求、状态、样式、构建的最小闭环；10.2 核对 id 字符串、金额分、page、size；10.3 刷新后草稿还在，筛选条件不在；10.4 一次排错看 Console、Elements、Network 和哪一层超时；10.5 旧响应与重复点击；10.6 入口 html 与带 hash 的 js；10.7 对照基准算例的检查表；10.8 全课避坑清单怎么用；10.9 高级条目什么时候才展开；10.10 本章不引入新的示例数字
- 易错：开发服务器能开就认为生产能打开 /orders；只看 199.50 不核对请求里的 19950；同时改样式、请求和构建；把 50、16.7ms、180KB 写成容量承诺
- 避坑：生产包打进密钥；回滚只删 hash 文件不换入口；列表和详情各存一份 stock；测试绿了但没看用户看得见的金额
- 演示：现象切换（金额变成一长串小数、翻页仍是第一页、刷新草稿丢失、回滚后还是旧按钮），读出下一步该看的面板；检查表勾选 id、金额、超时、缓存、key，读出还缺哪一条
