TOTAL = 21
page = 0


def new():
    global page
    page += 1
    return prs.slides.add_slide(BLANK), page


# ---------- 1 封面 ----------
s, n = new()
rect(s, 0, 0, W, H, NAVY)
rect(s, 0, 0, Inches(0.18), H, CYAN)
textbox(s, Inches(0.75), Inches(1.55), Inches(11), Inches(0.34),
        "前端培训", 16, CYAN, True)
textbox(s, Inches(0.75), Inches(2.05), Inches(12), Inches(0.9),
        "前端概念初识", 54, WHITE, True)
textbox(s, Inches(0.75), Inches(3.15), Inches(11.5), Inches(0.9),
        "90 分钟。用员工页看清：脚本跑在哪，构建交出什么，\n类型、样式和组件怎么读。",
        20, FOOT)
labels = [
    ("例子", "前端概念初识-demo\n页面 src/pages/employee"),
    ("今天要会", "指出进程和线程、构建四步\n类型、类名、状态放哪"),
    ("今天不讲", "事件循环、loader 配置\n装饰器、mixin、memo"),
]
for i, (a, b) in enumerate(labels):
    x = Inches(0.75 + i * 4.05)
    rrect(s, x, Inches(4.45), Inches(3.85), Inches(1.55), RGBColor(0x14, 0x32, 0x4C))
    textbox(s, x + Inches(0.22), Inches(4.6), Inches(3.4), Inches(0.32), a, 14, CYAN, True)
    textbox(s, x + Inches(0.22), Inches(5.0), Inches(3.4), Inches(0.8), b, 16, WHITE)
notes(s, "开场一句：今天不新建项目，投屏员工页。结束时能顺着一条线说完：主线程、构建产物、类型和类名、组件函数。\n"
         "不讲：事件循环、微任务、帧预算、Worker、loader 配置、source map、分包、"
         "装饰器、条件类型、手写声明文件、mixin、全局样式方案、memo、依赖数组细节、forwardRef、双向绑定库。")

# ---------- 2 时间表 ----------
s, n = new()
chrome(s, "开场", "90 分钟怎么走", n, TOTAL)
steps = [
    ("15′", "浏览器", "先分进程，再看渲染进程里的线程。"),
    ("15′", "构建过程", "转译、打包、压缩、文件名 contenthash。"),
    ("20′", "TypeScript", "类型在构建时检查。浏览器里仍是 JavaScript。"),
    ("10′", "Less 与 CSS Modules", "变量、嵌套、类名不撞、px 换成 rem。"),
    ("20′", "React", "组件、Props、useState、useEffect，状态放哪。"),
    ("10′", "对着员工页串一遍", "从主线程走到产物，再走到这个函数。"),
]
for i, (tm, title, desc) in enumerate(steps):
    y = Inches(1.2 + i * 0.9)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(0.8), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.16), Inches(0.9), Inches(0.48), tm, 18, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(1.8), y + Inches(0.16), Inches(3.6), Inches(0.48), title, 20, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(5.55), y + Inches(0.16), Inches(6.9), Inches(0.48), desc, 18, INK, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "时间紧时：浏览器留「主线程在渲染进程里」；构建留四步和 contenthash；"
         "TS 留类型擦除、联合类型、空值、request 的泛型；Less 留 CSS Modules 和 100px → 1rem；"
         "React 留三个词的对照、useState、状态放哪。收尾必须回到员工页。")

# ---------- 3 三个进程 ----------
s, n = new()
chrome(s, "浏览器  ·  15 分钟", "先分清进程，线程在进程里面", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.15), Inches(12.25), Inches(0.4),
        "进程是操作系统隔开的一块。页面代码碰不到进程表，也没有 JVM。", 18, INK)
procs = [
    ("浏览器进程", "地址栏、书签、前进与后退。"),
    ("渲染进程", "这个标签页里的文档。不同站点可以再拆进程。"),
    ("GPU 进程", "把画好的结果送上屏幕。"),
]
for i, (title, desc) in enumerate(procs):
    x = Inches(0.55 + i * 4.15)
    rrect(s, x, Inches(1.7), Inches(3.98), Inches(2.35), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(1.9), Inches(3.55), Inches(0.5), title, 22, NAVY, True)
    textbox(s, x + Inches(0.22), Inches(2.55), Inches(3.55), Inches(1.2), desc, 16, INK)
callout(s, Inches(0.55), Inches(4.25), Inches(12.25), Inches(1.2),
        "不要记成「整个浏览器只有一个渲染进程」，也不要记成「每个标签一定单独一个进程」。", 18)
amber_bar(s, Inches(0.55), Inches(5.65), Inches(12.25), Inches(1.2),
          "主线程和合成器线程画在渲染进程里面，不和这三个进程并列。下一页看它们各做什么。", 18)
notes(s, "先在白板上画三个框，线程先不画。学员若说「JS 跑在浏览器进程里」，先记下，下一页纠正。\n"
         "不讲网络服务是否单独进程、站点隔离的注册域算法、事件循环。")

# ---------- 4 两条线程 ----------
s, n = new()
chrome(s, "浏览器", "主线程一次只做一件事", n, TOTAL)
threads = [
    ("主线程  ·  在渲染进程里",
     "JavaScript、HTML/CSS 解析、样式计算、布局都在这条线程上。\n\n"
     "它一次只做一件事。当前函数没返回，点击和定时器插不进来。"),
    ("合成器线程  ·  也在渲染进程里",
     "不在 GPU 进程里。\n\n"
     "一部分滚动可以不回主线程重做布局。画面仍由 GPU 进程送上屏幕。"),
]
for i, (title, desc) in enumerate(threads):
    x = Inches(0.55 + i * 6.4)
    rrect(s, x, Inches(1.25), Inches(6.15), Inches(3.7), CARD, LINE)
    textbox(s, x + Inches(0.28), Inches(1.48), Inches(5.6), Inches(0.7), title, 20, CYAN, True)
    textbox(s, x + Inches(0.28), Inches(2.3), Inches(5.6), Inches(2.3), desc, 18, INK)
callout(s, Inches(0.55), Inches(5.2), Inches(12.25), Inches(1.6),
        "页面能碰到的是这份文档上的脚本。这里没有一份可以在脚本里枚举的进程表。", 18)
notes(s, "口播：点按钮不会把正在跑的函数从中间劈开。函数先返回，点击才有机会开始。这句够用，不要展开调用栈和微任务。\n"
         "合成器线程反复强调「在渲染进程里」。有人把它画进 GPU 进程，就停下来改图。")

# ---------- 5 卡顿 ----------
s, n = new()
chrome(s, "浏览器", "页面卡住时，看渲染进程的主线程", n, TOTAL)
pairs = [
    ("容易记错", "地址栏所在的浏览器进程在算布局。\n主线程、合成器线程和三个进程并列。"),
    ("这样记", "这份文档所在渲染进程的主线程被占住。\n两条线程画在渲染进程里面。合成器不在 GPU 进程里。"),
]
for i, (title, desc) in enumerate(pairs):
    x = Inches(0.55 + i * 6.4)
    rrect(s, x, Inches(1.35), Inches(6.15), Inches(3.9), AMBER_BG if i == 0 else SOFT, AMBER_LINE if i == 0 else SOFT_LINE)
    textbox(s, x + Inches(0.28), Inches(1.6), Inches(5.6), Inches(0.5), title, 20, AMBER if i == 0 else CYAN_DEEP, True)
    textbox(s, x + Inches(0.28), Inches(2.35), Inches(5.6), Inches(2.5), desc, 20, INK)
notes(s, "这页停 1 分钟。让学员用自己的话复述右边。\n"
         "不讲：事件循环、微任务、帧预算、Worker。有人问「16 毫秒」就记到今天不展开。")

# ---------- 6 源码与产物 ----------
s, n = new()
chrome(s, "构建过程  ·  15 分钟", "浏览器不执行 .tsx 和 .less", n, TOTAL)
modes = [
    ("npm start", "开发", "开发服务器在内存里现给转换后的文件。用来改页面、看效果。"),
    ("npm run build", "生产", "从入口 src/index.tsx 交出 dist 里的静态文件。看文件名 hash，看这份 dist。"),
]
for i, (cmd, kind, desc) in enumerate(modes):
    x = Inches(0.55 + i * 6.4)
    rrect(s, x, Inches(1.3), Inches(6.15), Inches(3.35), CARD, LINE)
    textbox(s, x + Inches(0.28), Inches(1.52), Inches(5.6), Inches(0.35), kind, 14, CYAN, True)
    textbox(s, x + Inches(0.28), Inches(2.0), Inches(5.6), Inches(0.55), cmd, 28, NAVY, True)
    textbox(s, x + Inches(0.28), Inches(2.75), Inches(5.6), Inches(1.5), desc, 18, INK)
callout(s, Inches(0.55), Inches(4.9), Inches(12.25), Inches(1.85),
        "浏览器跑的是转换之后的 JavaScript 和 CSS。\n它不按源码目录去拉几十个 .ts，也不认识 Less。", 18)
notes(s, "投屏时可以先打开 src/index.tsx，说明这是入口；再生产构建看 dist。开发服务器的地址栏里看不到 contenthash 文件名。\n"
         "不讲 loader 链的每一项。")

# ---------- 7 四步 ----------
s, n = new()
chrome(s, "构建过程", "按这个顺序记：转译、打包、压缩、hash", n, TOTAL)
steps4 = [
    ("1", "转译", "ts-loader 把 TypeScript 和 JSX 变成 JavaScript。类型检查后擦掉。"),
    ("2", "打包", "顺着 import 把页面、store、请求收进少数几个文件。"),
    ("3", "压缩", "生产模式把 JavaScript 压短。开发模式不压。"),
    ("4", "文件名 hash", "内容变了，文件名才变。入口 HTML 再指向新名字。"),
]
for i, (no, title, desc) in enumerate(steps4):
    x = Inches(0.45 + i * 3.2)
    rrect(s, x, Inches(1.3), Inches(3.05), Inches(4.15), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(1.5), Inches(2.65), Inches(0.45), no, 22, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(2.1), Inches(2.65), Inches(0.85), title, 22, NAVY, True)
    textbox(s, x + Inches(0.2), Inches(3.1), Inches(2.65), Inches(2.0), desc, 15, INK)
callout(s, Inches(0.55), Inches(5.65), Inches(12.25), Inches(1.2),
        "同一趟里，.less 会先编成 CSS，再换 rem、改局部类名。换算和类名放第 4 节。", 18)
notes(s, "四步不要倒着讲。类型擦除放到转译，下一节 TypeScript 再展开。\n"
         "JSX 变成对 React 运行时的调用，不是浏览器原生标签。这句口头带过即可。")

# ---------- 8 压缩和 hash ----------
s, n = new()
chrome(s, "构建过程", "压缩是压短源码，hash 跟着内容走", n, TOTAL)
rrect(s, Inches(0.55), Inches(1.25), Inches(6.15), Inches(3.55), AMBER_BG)
textbox(s, Inches(0.8), Inches(1.45), Inches(5.7), Inches(0.4), "压缩", 22, AMBER, True)
write_lines(s, Inches(0.8), Inches(2.05), Inches(5.7), Inches(2.4), [
    "生产模式去掉空白、缩短局部名字。",
    "这是压源码。",
    "不是打成 zip，也不是服务器上的 gzip。",
    "开发模式不压。",
], 18, INK, before=2, after=2)
rrect(s, Inches(6.9), Inches(1.25), Inches(5.9), Inches(3.55), CARD, LINE)
textbox(s, Inches(7.15), Inches(1.45), Inches(5.45), Inches(0.4), "contenthash", 22, NAVY, True)
write_lines(s, Inches(7.15), Inches(2.05), Inches(5.45), Inches(2.4), [
    "js/[name].[contenthash:8].js",
    "css/[name].[contenthash:8].css",
    "内容没变，名字不变。",
    "旧缓存不会盖住新文件。",
], 18, INK, before=2, after=2)
callout(s, Inches(0.55), Inches(5.05), Inches(12.25), Inches(1.75),
        "看 hash 用生产构建的 dist。开发服务器在内存里给文件，地址栏里对不上这串名字。", 18)
notes(s, "学员若答「压缩就是 gzip」，拉回来：本课的压缩是生产模式压短代码。服务器是否再做 gzip，今天不讲。\n"
         "contenthash 和「每次构建都换一个随机名」不同。内容相同，hash 相同。\n"
         "不讲 source map、分包。")

# ---------- 9 类型擦除 ----------
s, n = new()
chrome(s, "TypeScript  ·  20 分钟", "浏览器里跑的，是擦掉类型之后的 JavaScript", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.2), Inches(6.0), Inches(0.36), "你写的 .tsx", 16, CYAN, True)
textbox(s, Inches(6.85), Inches(1.2), Inches(6.0), Inches(0.36), "产物里执行的", 16, CYAN, True)
codeblock(s, Inches(0.55), Inches(1.62), Inches(6.0), Inches(2.15),
          "function deptLabel(dept: string | null): string {\n"
          "  return dept == null ? '未分配' : dept;\n"
          "}", 16)
codeblock(s, Inches(6.85), Inches(1.62), Inches(5.95), Inches(2.15),
          "function deptLabel(dept) {\n"
          "  return dept == null ? '未分配' : dept;\n"
          "}", 16)
bullets(s, Inches(0.55), Inches(4.05), Inches(12.2), Inches(1.7), [
    "类型写给构建和编辑器。写错了，构建不过。tsconfig.json 开了 strict。",
    "类型在检查后擦掉。用户机器上没有 TypeScript，产物里没有 interface。",
], 18)
amber_bar(s, Inches(0.55), Inches(5.85), Inches(12.25), Inches(1.0),
          "类型能在写的时候发现错误，不能代替运行时那份数据。", 18)
notes(s, "指着左边的类型标注，再指右边已经没有。下一页再认有哪些类型。\n"
         "不讲装饰器、条件类型、手写声明文件。")

# ---------- 10 类型一览 ----------
s, n = new()
chrome(s, "TypeScript", "员工这条数据，先认这几种类型", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.15), Inches(12.25), Inches(2.55),
          "interface Employee {\n"
          "  name: string;     age: number;     active: boolean;\n"
          "  tags: string[];\n"
          "  status: '在职' | '离职';\n"
          "  dept?: string | null;\n"
          "}", 18)
chips = [
    ("string / number / boolean", "文本、数字、真或假"),
    ("string[]", "一组同一类型的值"),
    ("'在职' | '离职'", "联合类型，只能是其中之一"),
    ("dept?", "字段可以不传"),
    ("string | null", "传来了，值也可以是空"),
    ("函数的类型", "参数和返回值同样写上"),
]
for i, (t, d) in enumerate(chips):
    col, row = i % 3, i // 3
    chip(s, Inches(0.55 + col * 4.15), Inches(3.9 + row * 1.45),
         Inches(3.98), Inches(1.32), t, d, 16, 15)
notes(s, "投屏 services/employee.ts 里的 Employee，对一遍这六格。\n"
         "联合类型就用「在职 | 离职」，不要再举一套抽象例子。")

# ---------- 11 空值 ----------
s, n = new()
chrome(s, "TypeScript", "strict 下，空值要先处理", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.22), Inches(7.4), Inches(3.35),
          "function deptLabel(dept: string | null | undefined) {\n"
          "  if (dept == null) {\n"
          "    return '未分配';\n"
          "  }\n"
          "  return dept;\n"
          "}", 18)
rrect(s, Inches(8.15), Inches(1.22), Inches(4.65), Inches(3.35), CARD, LINE)
write_lines(s, Inches(8.38), Inches(1.5), Inches(4.2), Inches(2.85), [
    "部门可能没有。",
    "先判断，再当字符串用。",
    "",
    "年龄是 number | null。",
    "空值不能当数字提交。",
], 18, INK, before=2, after=2)
callout(s, Inches(0.55), Inches(4.8), Inches(12.25), Inches(1.95),
        "dept == null 同时接住 null 和 undefined。\nundefined：字段没来。    null：有意放了一个空。处理完再往下用。", 18)
notes(s, "右边对上员工页：部门用 deptLabel，年龄在保存前看 values.age == null。\n"
         "不要展开 ?? 和 || 的差别，除非有人指着代码问。")

# ---------- 12 Props 与泛型 ----------
s, n = new()
chrome(s, "TypeScript", "interface 描述形状，泛型只说明返回的数据", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.15), Inches(6.15), Inches(0.32), "UserCard 的 Props", 16, CYAN, True)
textbox(s, Inches(6.9), Inches(1.15), Inches(5.9), Inches(0.32), "请求的泛型", 16, CYAN, True)
codeblock(s, Inches(0.55), Inches(1.52), Inches(6.15), Inches(2.85),
          "interface Props {\n"
          "  name: string;\n"
          "  status?: '在职' | '离职';\n"
          "  onSelect: () => void;\n"
          "}", 18)
codeblock(s, Inches(6.9), Inches(1.52), Inches(5.9), Inches(1.55),
          "request<Employee[]>({\n"
          "  url: '/employees',\n"
          "})", 18)
rrect(s, Inches(6.9), Inches(3.22), Inches(5.9), Inches(1.15), CARD, LINE)
textbox(s, Inches(7.12), Inches(3.38), Inches(5.5), Inches(0.85),
        "Employee[] 是业务数据 data 的形状，不是带 status、headers 的原始响应。",
        15, INK, anchor=MSO_ANCHOR.MIDDLE)
amber_bar(s, Inches(0.55), Inches(4.65), Inches(12.25), Inches(2.1),
          "Props 是父组件传下来的对象。interface 描述它的形状，Props 本身不是类型。name 必填，status 可以不传。\n"
          "类型挡不住接口真的返回了别的结构。装饰器、条件类型、手写声明文件，今天不讲。", 16)
notes(s, "左：父组件少传 name，写的时候就能发现。不要说「Props 就是一个 interface」。\n"
         "右：拦截器在业务成功时取出 JSON 里的 data。页面拿到的是员工数组，不是整包 HTTP 响应。\n"
         "不打开拦截器实现。失败那条今天不展开。")

# ---------- 13 Less ----------
s, n = new()
chrome(s, "Less 与 CSS Modules  ·  10 分钟", "Less 是 CSS，加上变量和嵌套", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.2), Inches(6.5), Inches(3.55),
          "@PsPrimaryColorNormal: #0e7c72;\n\n"
          ".link {\n"
          "  color: @PsPrimaryColorNormal;\n"
          "  &:hover {\n"
          "    text-decoration: underline;\n"
          "  }\n"
          "}", 18)
bullets(s, Inches(7.3), Inches(1.25), Inches(5.5), Inches(3.5), [
    "变量集中管颜色。改主题色，改这一处。",
    "嵌套写在父级里面。&:hover 是这个类自己的悬停。",
    "编译之后仍是普通 CSS。",
    "嵌套不会让类名变成局部的。",
], 17, before=6, after=6)
amber_bar(s, Inches(0.55), Inches(5.05), Inches(12.25), Inches(1.7),
          "组件旁的文件叫 index.less。mixin 大全、全局样式方案，今天不讲。\n要改一块颜色，先找变量。", 18)
notes(s, "投屏 employee/index.less，指出 @PsPrimaryColorNormal 和 .link 的嵌套。\n"
         "下一页马上接：嵌套解决的是少写选择器，类名隔离靠 CSS Modules。")

# ---------- 14 CSS Modules ----------
s, n = new()
chrome(s, "Less 与 CSS Modules", "类名只属于这个组件", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.2), Inches(12.25), Inches(1.85),
          "import styles from './index.less';\n\n"
          "<span className={styles.link}>{props.name}</span>", 20)
cards = [
    ("源码里", "类名就叫 link。别的页面也可以写 .link。"),
    ("构建之后", "变成带文件名和 hash 的类，例如 index__link__xxxxx。"),
    ("用的时候", "styles.link 只取本文件这一串。不要写字符串 \"link\"。"),
]
for i, (t, d) in enumerate(cards):
    x = Inches(0.55 + i * 4.15)
    rrect(s, x, Inches(3.25), Inches(3.98), Inches(2.15), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(3.42), Inches(3.55), Inches(0.4), t, 18, CYAN, True)
    textbox(s, x + Inches(0.22), Inches(3.95), Inches(3.55), Inches(1.2), d, 16, INK)
callout(s, Inches(0.55), Inches(5.6), Inches(12.25), Inches(1.2),
        "别的页面写 .link，盖不住这里。全局样式仍会互相盖；这节只留组件自己的 index.less。", 18)
notes(s, "构建后的类名是示意，不要背某一串 hash。localIdentName 是 [name]__[local]__[hash:base64:5]。\n"
         "有人问「嵌套够不够隔离」：不够。Less 编译完仍可能是全局选择器。")

# ---------- 15 px rem ----------
s, n = new()
chrome(s, "Less 与 CSS Modules", "尺寸按 px 写，构建时换成 rem", n, TOTAL)
steps3 = [
    ("1", "less 里这样写", "width: 100px"),
    ("2", "postcss-pxtorem", "rootValue 为 100"),
    ("3", "产物里变成", "width: 1rem"),
]
for i, (no, t, d) in enumerate(steps3):
    x = Inches(0.55 + i * 4.15)
    rrect(s, x, Inches(1.25), Inches(3.98), Inches(2.45), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(1.42), Inches(3.5), Inches(0.4), no, 20, CYAN, True)
    textbox(s, x + Inches(0.22), Inches(1.95), Inches(3.5), Inches(0.55), t, 20, NAVY, True)
    textbox(s, x + Inches(0.22), Inches(2.6), Inches(3.5), Inches(0.8), d, 22, INK, True)
callout(s, Inches(0.55), Inches(3.95), Inches(12.25), Inches(1.45),
        "换算在 .less 的构建链上，不在页面入口，也不是运行时再用脚本换。\n160px 同样是 1.6rem。源码继续写 px。", 18)
amber_bar(s, Inches(0.55), Inches(5.6), Inches(12.25), Inches(1.2),
          "只处理 .less。global.css 和组件库的 CSS 不走这条规则。", 18)
notes(s, "旧说法「入口 px2rem」要改口：工具是 postcss-pxtorem，挂在 less 的 loader 链上，rootValue 100。\n"
         "学员改样式只改 px。不要展开根字号和视口的适配公式。")

# ---------- 16 MVVM ----------
s, n = new()
chrome(s, "React  ·  20 分钟", "三个词，用来记住谁管数据、谁管界面", n, TOTAL)
mv = [
    ("Model", "数据", "list、keyword、open。\n列表、筛选词、弹窗开没开。"),
    ("View", "界面", "return 里的 JSX。\n只负责结构。"),
    ("ViewModel", "这个函数", "EmployeePage。用数据算出要画什么，用 onClick、onChange 接住操作，再改数据。"),
]
for i, (en, zh, desc) in enumerate(mv):
    x = Inches(0.55 + i * 4.15)
    rrect(s, x, Inches(1.2), Inches(3.98), Inches(2.85), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(1.35), Inches(3.55), Inches(0.3), en, 14, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(1.7), Inches(3.55), Inches(0.45), zh, 24, NAVY, True)
    textbox(s, x + Inches(0.2), Inches(2.3), Inches(3.55), Inches(1.5), desc, 15, INK)
callout(s, Inches(0.55), Inches(4.25), Inches(12.25), Inches(1.35),
        "React 没有单独的 ViewModel 类，也没有默认的双向绑定。\n输入框自己把 value 指到状态，再用 onChange 写回去。", 18)
amber_bar(s, Inches(0.55), Inches(5.8), Inches(12.25), Inches(1.05),
          "用这三个词记职责。不要记成「React 就是一套 MVVM 框架」。", 18)
notes(s, "这三个词来自员工页注释，用来对照，不是框架分类。\n"
         "数据从状态流向界面，事件再把新值送回来。下一页看 JSX，再下一页看 value 和 onChange。")

# ---------- 17 JSX ----------
s, n = new()
chrome(s, "React", "组件是函数；父传子、列表、点击都写在 JSX 里", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.18), Inches(12.25), Inches(2.55),
          "{shown.map((item) => (\n"
          "  <UserCard key={item.id} name={item.name}\n"
          "    status={item.status}\n"
          "    onSelect={() => setSelectedId(item.id)} />\n"
          "))}", 18)
points = [
    ("函数", "执行一次，返回 JSX。标签是结构，大括号里放表达式。"),
    ("props", "name、status、onSelect 是父组件传下来的。status 可以不传。"),
    ("key 和事件", "key 用稳定的 item.id，不用下标。事件写 onClick，不是 onclick。"),
]
for i, (t, d) in enumerate(points):
    x = Inches(0.55 + i * 4.15)
    rrect(s, x, Inches(3.95), Inches(3.98), Inches(2.0), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(4.12), Inches(3.55), Inches(0.4), t, 18, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(4.58), Inches(3.55), Inches(1.15), d, 15, INK)
notes(s, "指着员工页的 UserCard。key 用这行不变的 id。会增删的列表不要用数组下标，不展开 reconciliation。\n"
         "onSelect 的值是函数。setSelectedId 从功能内的 store 来，存放位置下一页之后再讲。")

# ---------- 18 useState ----------
s, n = new()
chrome(s, "React", "自己会变的数据，用 useState", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.18), Inches(12.25), Inches(1.15),
          "const [keyword, setKeyword] = useState('');\n"
          "const [open, setOpen] = useState(false);", 20)
examples = [
    ("筛选词 keyword", "当前文字。输入时调用 setKeyword，组件再用新文字执行一次。"),
    ("弹窗 open", "开还是关。打开 setOpen(true)，关掉 setOpen(false)。"),
]
for i, (t, d) in enumerate(examples):
    y = Inches(2.5 + i * 1.15)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(1.05), CARD, LINE)
    textbox(s, Inches(0.78), y + Inches(0.22), Inches(3.3), Inches(0.6), t, 18, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(4.2), y + Inches(0.22), Inches(8.3), Inches(0.6), d, 16, INK, anchor=MSO_ANCHOR.MIDDLE)
codeblock(s, Inches(0.55), Inches(4.95), Inches(12.25), Inches(0.85),
          "<Input value={keyword} onChange={(event) => setKeyword(event.target.value)} />", 16)
amber_bar(s, Inches(0.55), Inches(5.95), Inches(12.25), Inches(0.9),
          "没有双向绑定。value 从状态来，onChange 把新文字写回去。改状态用新值替换，界面才会重画。", 16)
notes(s, "若有人写成 keyword = event.target.value：那只改了这一次执行里的局部变量，函数不会因此再执行。\n"
         "不讲 memo、批量更新、双向绑定库。")

# ---------- 19 请求与状态放哪 ----------
s, n = new()
chrome(s, "React", "进来要请求；状态先问放哪", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.18), Inches(5.9), Inches(1.7),
          "useEffect(() => {\n"
          "  loadList();\n"
          "}, []);", 20)
rrect(s, Inches(6.65), Inches(1.18), Inches(6.15), Inches(1.7), CARD, LINE)
textbox(s, Inches(6.9), Inches(1.35), Inches(5.7), Inches(1.35),
        "进入页面再请求列表。依赖数组这次不展开。", 18, INK, anchor=MSO_ANCHOR.MIDDLE)
rows = [
    ("只属于这一块界面", "留在组件里，用 useState"),
    ("这个功能里多个组件共用", "src/store/employee.ts 的 createStore"),
    ("全站共用", "src/store/global.ts"),
]
for i, (a, b) in enumerate(rows):
    y = Inches(3.1 + i * 0.95)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(0.85), CARD, LINE)
    textbox(s, Inches(0.8), y + Inches(0.18), Inches(5.3), Inches(0.5), a, 18, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(6.3), y + Inches(0.18), Inches(6.2), Inches(0.5), b, 18, CYAN_DEEP, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "页面里只调用 useEmployeeStore、useGlobalStore。不打开 createStore 的实现，不讲 Provider。\n"
         "空数组可以指出来，依赖数组的各种写法、memo、forwardRef 今天不讲。\n"
         "选中的员工 id 在功能内 store；当前用户名在全局 store；筛选词和弹窗留在页面自己的 useState。")

# ---------- 20 收尾 ----------
s, n = new()
chrome(s, "收尾  ·  10 分钟", "打开员工页，按这条线走一遍", n, TOTAL)
order = [
    ("1", "脚本跑在哪", "渲染进程的主线程。卡住时是它被占住。"),
    ("2", "浏览器拿到什么", "转译、打包、压缩，并带 contenthash 的产物。"),
    ("3", "构建时处理掉什么", "类型擦掉。局部类名改写。less 里的 px 换成 rem。"),
    ("4", "页面本身是什么", "一个函数。用状态算出 JSX，进入页面后再请求数据。"),
]
for i, (no, t, d) in enumerate(order):
    y = Inches(1.2 + i * 1.35)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(1.22), CARD, LINE)
    textbox(s, Inches(0.8), y + Inches(0.28), Inches(0.7), Inches(0.65), no, 28, CYAN, True)
    textbox(s, Inches(1.7), y + Inches(0.16), Inches(10.7), Inches(0.42), t, 20, NAVY, True)
    textbox(s, Inches(1.7), y + Inches(0.62), Inches(10.7), Inches(0.42), d, 16, MUTED)
notes(s, "就在员工页上指，不新写：入口 src/index.tsx，页面 src/pages/employee/index.tsx，样式 index.less，"
         "功能内 store 和 global.ts。指完翻到三问，让学员说。")

# ---------- 21 三问 ----------
s, n = new()
chrome(s, "收尾", "离开前，回答这三句", n, TOTAL)
qs = [
    ("1", "页面脚本跑在哪个进程的哪条线程上？"),
    ("2", "打开 dist，还能看到 interface 和源码里的 .link 吗？"),
    ("3", "筛选词放哪？功能内和全站的状态又放哪？"),
]
for i, (no, q) in enumerate(qs):
    y = Inches(1.25 + i * 1.7)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(1.5), CARD, LINE)
    textbox(s, Inches(0.85), y + Inches(0.4), Inches(0.8), Inches(0.7), no, 32, CYAN, True)
    textbox(s, Inches(1.9), y + Inches(0.42), Inches(10.5), Inches(0.7), q, 24, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "让学员先说。参考答案：\n"
         "1. 渲染进程的主线程。页面卡住是这条线程被占住，不是地址栏所在的浏览器进程在算布局。合成器线程也在渲染进程里。\n"
         "2. interface 已经擦掉。.link 被改成带文件名和 hash 的类名。100px 已换成 1rem。文件名里的 contenthash 跟着内容走，内容变了名字才变。压缩是压短源码，不是 zip，也不是 gzip。\n"
         "3. 筛选词 keyword 用组件里的 useState。功能内选中项在 src/store/employee.ts 的 createStore。全站用户名在 src/store/global.ts。页面只调用 useEmployeeStore 和 useGlobalStore。输入框要自己写 value 和 onChange。")


assert page == TOTAL, page

out = r"D:\文档\training\前端概念初识.pptx"
prs.save(out)

sw, sh = prs.slide_width, prs.slide_height
problems = []
for i, slide in enumerate(prs.slides, 1):
    for shape in slide.shapes:
        if shape.top is None or shape.left is None:
            continue
        bottom = shape.top + shape.height
        right = shape.left + shape.width
        if bottom > sh + Inches(0.02) or right > sw + Inches(0.02) or shape.left < -Inches(0.02):
            problems.append(f"slide {i}: L={shape.left} T={shape.top} R={right} B={bottom}")
print(f"saved {out} slides={page}")
if problems:
    print("OVERFLOW")
    print("\n".join(problems))
else:
    print("bounds ok")
