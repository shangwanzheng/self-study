# -*- coding: utf-8 -*-
"""第 1 次加课 PPT：浏览器在跑什么。内容以 06-frontend-basics-outline.md 第 1 次为准。"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree

W, H = Inches(13.333), Inches(7.5)
NAVY = RGBColor(0x0B, 0x1F, 0x33)
INK = RGBColor(0x1C, 0x28, 0x33)
MUTED = RGBColor(0x5C, 0x6B, 0x7A)
CYAN = RGBColor(0x0E, 0x7C, 0x72)
CYAN_DEEP = RGBColor(0x0A, 0x5C, 0x54)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
CARD = RGBColor(0xF4, 0xF7, 0xFA)
LINE = RGBColor(0xD5, 0xDE, 0xE8)
AMBER_BG = RGBColor(0xFF, 0xF6, 0xE8)
AMBER = RGBColor(0x8A, 0x5A, 0x00)
CODE_BG = RGBColor(0x0E, 0x16, 0x24)
CODE_FG = RGBColor(0xD7, 0xE8, 0xFF)
ROW_ALT = RGBColor(0xF7, 0xFA, 0xFC)
HEAD_BG = RGBColor(0x0B, 0x1F, 0x33)

prs = Presentation()
prs.slide_width = W
prs.slide_height = H
prs.core_properties.title = "前端基础加课 · 第 1 次 · 浏览器在跑什么"
prs.core_properties.subject = "面向 Java 云服务与 C++ 客户端"
BLANK = prs.slide_layouts[6]


def set_font(run, name, size, color, bold=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    for tag in ("latin", "ea", "cs"):
        el = rPr.find(qn(f"a:{tag}"))
        if el is None:
            el = rPr.makeelement(qn(f"a:{tag}"), {})
            rPr.append(el)
        el.set("typeface", name)


def add_run(p, text, size, color, bold=False, font="Microsoft YaHei"):
    r = p.add_run()
    r.text = text
    set_font(r, font, size, color, bold)
    return r


def rect(slide, x, y, w, h, fill, line=None):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(1)
    sh.shadow.inherit = False
    return sh


def rrect(slide, x, y, w, h, fill, line=None):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, w, h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = Pt(1)
    sh.shadow.inherit = False
    # tighter corner
    try:
        sh.adjustments[0] = 0.08
    except Exception:
        pass
    return sh


def textbox(slide, x, y, w, h, text, size=18, color=INK, bold=False, align=PP_ALIGN.LEFT, font="Microsoft YaHei", anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.margin_left = Emu(0)
    tf.margin_right = Emu(0)
    tf.margin_top = Emu(0)
    tf.margin_bottom = Emu(0)
    try:
        tb.text_frame._txBody.bodyPr.set("anchor", {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor])
    except Exception:
        pass
    p = tf.paragraphs[0]
    p.alignment = align
    p.space_before = Pt(0)
    p.space_after = Pt(0)
    add_run(p, text, size, color, bold, font)
    return tb


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def chrome(slide, kicker, title, page, total):
    rect(slide, 0, 0, W, Inches(0.08), CYAN)
    textbox(slide, Inches(0.55), Inches(0.22), Inches(10), Inches(0.28), kicker, 12, CYAN, True)
    textbox(slide, Inches(0.55), Inches(0.46), Inches(12.2), Inches(0.48), title, 28, NAVY, True)
    rect(slide, 0, Inches(7.18), W, Inches(0.32), NAVY)
    textbox(slide, Inches(0.55), Inches(7.2), Inches(9), Inches(0.26),
            "前端基础加课  ·  第 1 次  ·  浏览器在跑什么", 11, RGBColor(0xC5, 0xD4, 0xE0))
    textbox(slide, Inches(11.4), Inches(7.2), Inches(1.4), Inches(0.26),
            f"{page}  /  {total}", 11, RGBColor(0xC5, 0xD4, 0xE0), align=PP_ALIGN.RIGHT)


def bullets(slide, x, y, w, h, items, size=18, color=INK, bullet_color=CYAN):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Emu(0)
    tf.margin_right = Emu(0)
    tf.margin_top = Emu(0)
    tf.margin_bottom = Emu(0)
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.space_before = Pt(4)
        p.space_after = Pt(4)
        p.level = 0
        add_run(p, "▸  ", size, bullet_color, True)
        add_run(p, item, size, color, False)
    return tb


def codeblock(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, CODE_BG)
    tb = slide.shapes.add_textbox(x + Inches(0.22), y + Inches(0.12), w - Inches(0.4), h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    lines = text.split("\n")
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(0)
        p.space_after = Pt(0)
        add_run(p, line if line else " ", size, CODE_FG, font="Consolas")
    return tb


def set_cell_border(cell, color="D5DEE8", width_pt=0.75):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    ln = int(width_pt * 12700)
    for edge in ("lnL", "lnR", "lnT", "lnB"):
        old = tcPr.find(qn(f"a:{edge}"))
        if old is not None:
            tcPr.remove(old)
        el = etree.SubElement(tcPr, qn(f"a:{edge}"))
        el.set("w", str(ln))
        el.set("cap", "flat")
        el.set("cmpd", "sng")
        el.set("algn", "ctr")
        sf = etree.SubElement(el, qn("a:solidFill"))
        c = etree.SubElement(sf, qn("a:srgbClr"))
        c.set("val", color)
        etree.SubElement(el, qn("a:prstDash")).set("val", "solid")


def fill_cell(cell, text, size, color, fill, bold=False, align=PP_ALIGN.LEFT):
    cell.text = ""
    cell.fill.solid()
    cell.fill.fore_color.rgb = fill
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    cell.margin_left = Pt(8)
    cell.margin_right = Pt(6)
    cell.margin_top = Pt(4)
    cell.margin_bottom = Pt(4)
    tf = cell.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    add_run(p, text, size, color, bold)
    set_cell_border(cell)


def table(slide, x, y, w, h, headers, rows, font=14, header_fill=HEAD_BG, widths=None):
    tbl_shape = slide.shapes.add_table(len(rows) + 1, len(headers), x, y, w, h)
    tbl = tbl_shape.table
    tbl.rows[0].height = Inches(0.38)
    if widths:
        for i, cw in enumerate(widths):
            tbl.columns[i].width = cw
    for j, htxt in enumerate(headers):
        fill_cell(tbl.cell(0, j), htxt, font, WHITE, header_fill, True)
    for i, row in enumerate(rows):
        bg = WHITE if i % 2 == 0 else ROW_ALT
        for j, val in enumerate(row):
            fill_cell(tbl.cell(i + 1, j), val, font, INK if j else NAVY, bg, bold=(j == 0))
    return tbl_shape


def callout(slide, x, y, w, h, text, size=15):
    rrect(slide, x, y, w, h, RGBColor(0xE7, 0xF6, 0xF4), RGBColor(0xB7, 0xE0, 0xDA))
    rect(slide, x, y, Inches(0.08), h, CYAN)
    textbox(slide, x + Inches(0.22), y + Inches(0.08), w - Inches(0.36), h - Inches(0.12),
            text, size, CYAN_DEEP, False, anchor=MSO_ANCHOR.MIDDLE)


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
textbox(s, Inches(0.7), Inches(1.35), Inches(11), Inches(0.32),
        "POISSON SOFT   ·   前端基础加课", 16, CYAN, True)
textbox(s, Inches(0.7), Inches(1.85), Inches(12), Inches(1.1),
        "浏览器在跑什么", 54, WHITE, True)
textbox(s, Inches(0.7), Inches(3.15), Inches(11), Inches(0.9),
        "第 1 次  ·  90 分钟\n面向 Java 云服务、C++ 客户端。打开已经定位到的文件，说出这段代码在浏览器里怎么跑。",
        20, RGBColor(0xC5, 0xD4, 0xE0))
# three chips
labels = [("上次已会", "跑起来、找到文件"), ("这次要会", "线程、值、类型、await"), ("这次不讲", "重画、缓存、CORS")]
for i, (a, b) in enumerate(labels):
    x = Inches(0.7 + i * 3.9)
    rrect(s, x, Inches(4.7), Inches(3.6), Inches(1.15), RGBColor(0x14, 0x32, 0x4C))
    textbox(s, x + Inches(0.2), Inches(4.82), Inches(3.2), Inches(0.32), a, 13, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(5.16), Inches(3.2), Inches(0.45), b, 16, WHITE, True)
textbox(s, Inches(0.7), Inches(6.55), Inches(10), Inches(0.3),
        "学员结业后仍不是前端开发。页面为什么会变、请求和发版缓存，是第 2、3 次。", 14, RGBColor(0x8A, 0xA0, 0xB5))
notes(s, "开场不要带领 clone，也不要重讲 DevTools 菜单。直接打开已经在跑的页面。")

# ---------- 2 学完能回答 ----------
s, n = new()
chrome(s, "开场  ·  8 分钟里的目标", "看到一段 .ts / .tsx，能回答这四句", n, TOTAL)
qs = [
    ("1", "这段 JS 在哪条线程上？", "卡顿是主线程被同步代码占住。再开一条线程解决不了。"),
    ("2", "这个值和 Java 一样吗？", "分清 null 和 undefined。0 和空字符串是合法值。超长 id 可能已经丢精度。"),
    ("3", "类型还在不在？", "浏览器跑的是擦掉类型之后的 JS。as 不检查这份 JSON。"),
    ("4", "await 有没有真正等到？", "漏写时，手里的是 Promise，不是响应体。"),
]
for i, (no, t, d) in enumerate(qs):
    col = i % 2
    row = i // 2
    x = Inches(0.55 + col * 6.35)
    y = Inches(1.25 + row * 2.55)
    rrect(s, x, y, Inches(6.05), Inches(2.35), CARD, LINE)
    textbox(s, x + Inches(0.28), y + Inches(0.28), Inches(1), Inches(0.5), no, 28, CYAN, True)
    textbox(s, x + Inches(1.15), y + Inches(0.36), Inches(4.6), Inches(0.5), t, 20, NAVY, True)
    textbox(s, x + Inches(0.28), y + Inches(1.15), Inches(5.5), Inches(0.85), d, 16, MUTED)
notes(s, "验收标准：四问里能答上三问即可。加分是漏写 await。")

# ---------- 3 时间表 ----------
s, n = new()
chrome(s, "开场", "今天 90 分钟怎么走", n, TOTAL)
steps = [
    ("8′", "开场", "地址栏到第一行 JS。这次不找文件。"),
    ("12′", "主线程", "一条线程干三件事。什么能活过刷新。"),
    ("15′", "事件循环", "先猜输出，再对上 Qt / Tomcat。"),
    ("16′", "值和 JSON", "两个空、真假、??、数字精度、引用。"),
    ("10′", "类型擦除", "tsconfig。as 不检查 JSON。"),
    ("12′", "函数", "this、箭头函数、闭包钉住变量。"),
    ("12′", "异步", "漏写 await。顺序和 Promise.all。"),
    ("5′", "验收", "控制台再跑一遍，口头抽问。"),
]
for i, (tm, title, desc) in enumerate(steps):
    y = Inches(1.18 + i * 0.72)
    rrect(s, Inches(0.55), y, Inches(12.2), Inches(0.64), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.12), Inches(0.9), Inches(0.4), tm, 16, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(1.8), y + Inches(0.12), Inches(2.2), Inches(0.4), title, 18, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(4.1), y + Inches(0.12), Inches(8.3), Inches(0.4), desc, 16, INK, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "只有两次课时，开头约 35 分钟：主线程表、A D C B、两个空、??、Long 精度、漏写 await。this、闭包、SharedWorker、localStorage 只点名。")

# ---------- 4 地址栏 ----------
s, n = new()
chrome(s, "开场  ·  地址栏到第一行 JS", "JS 是下载下来，在这个 Tab 里执行的", n, TOTAL)
flow = [
    ("1", "要 index.html"),
    ("2", "再要里面的 js / css"),
    ("3", "主线程从上到下执行"),
    ("4", "然后去等事件"),
]
for i, (no, t) in enumerate(flow):
    x = Inches(0.55 + i * 3.2)
    rrect(s, x, Inches(1.35), Inches(3.0), Inches(1.55), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(1.5), Inches(2.5), Inches(0.42), no, 22, CYAN, True)
    textbox(s, x + Inches(0.22), Inches(2.05), Inches(2.55), Inches(0.6), t, 18, NAVY, True)
bullets(s, Inches(0.6), Inches(3.35), Inches(12), Inches(2.2), [
    "开发时，这些文件由 CRACO 的开发服务器现给。生产是 dist/ 里的静态文件，由 Nginx / CDN 给。",
    "文件会不会被浏览器留着下次用，第 3 次讲。这节只建立：脚本跑在用户机器的这个 Tab 里。",
    "npm start 和找文件，上次已经会。这页不再带领 clone。",
], 18)
notes(s, "投屏已经打开的 localhost:8000。不要重新讲目录地图。")

# ---------- 5 window / import ----------
s, n = new()
chrome(s, "开场", "一个 window，依赖在打包时已经折进去", n, TOTAL)
rrect(s, Inches(0.55), Inches(1.3), Inches(6.0), Inches(4.5), CARD, LINE)
textbox(s, Inches(0.8), Inches(1.5), Inches(5.5), Inches(0.4), "window", 22, NAVY, True)
bullets(s, Inches(0.8), Inches(2.1), Inches(5.5), Inches(3.4), [
    "页面只有一个全局对象 window。globalThis 是它的别名。",
    "Java 没有对应物：没有一个进程级的袋子可以随手挂字段。",
    "Qt 注入的 window.qt、window.CsApp 挂在这里。桥只在这个页面里存在。",
    "iframe 是另一个 window。",
], 16)
rrect(s, Inches(6.8), Inches(1.3), Inches(6.0), Inches(4.5), CARD, LINE)
textbox(s, Inches(7.05), Inches(1.5), Inches(5.5), Inches(0.4), "import", 22, NAVY, True)
bullets(s, Inches(7.05), Inches(2.1), Inches(5.5), Inches(3.4), [
    "不是 C++ 的 #include。",
    "也不是把 jar 放进 classpath。",
    "打包器把依赖收成少数 js，浏览器下载的是这个结果。",
    "package-lock.json 锁的是这棵树。上次装依赖时已经用过。",
], 16)
notes(s, "对照一句即可：运行时浏览器不读 node_modules。")

# ---------- 6 主线程表 ----------
s, n = new()
chrome(s, "主线程  ·  12 分钟", "一条线程干三件事", n, TOTAL)
table(s, Inches(0.5), Inches(1.25), Inches(12.3), Inches(3.55),
      ["", "C++", "Java", "浏览器"],
      [
          ["载体", "OS 进程", "JVM", "一个 Tab 近似一个进程"],
          ["并发", "多线程 + 消息泵", "请求线程池", "一条主线程 + 事件循环"],
          ["主线程上还有", "消息、绘制", "无 UI 时无「帧」", "跑 JS、布局、绘制、接点击"],
          ["卡顿", "锁、IO、主线程忙", "GC、线程打满", "同步代码占住，点击要等"],
      ], font=15,
      widths=[Inches(1.7), Inches(2.7), Inches(3.2), Inches(4.7)])
callout(s, Inches(0.5), Inches(5.05), Inches(12.3), Inches(1.0),
        "网络收包可以在浏览器自己的网络栈里并行。回到页面的回调仍排在这条主线程上。所以「再开一个线程处理响应」在这里不成立。", 16)
notes(s, "重计算要么拆成小段让出线程，要么放进 Web Worker。Worker 碰不到页面 DOM。")

# ---------- 7 Worker 与刷新 ----------
s, n = new()
chrome(s, "主线程", "长连接不在 Java 线程里；刷新也不等于清空一切", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.22), Inches(12), Inches(0.7),
        "本仓 src/sw/sharedworkerMgr.ts 用 SharedWorker。多个 Tab 共用一个 Worker 里的 WebSocket。Worker 有自己的全局对象，不是页面的 window。",
        16, INK)
table(s, Inches(0.5), Inches(2.1), Inches(12.3), Inches(3.7),
      ["东西", "刷新之后"],
      [
          ["变量、hox、正在填的表单", "没了。权威数据要重新向 Java 要"],
          ["localStorage", "还在。本仓语言在 DefaultLanguage"],
          ["sessionStorage", "关 Tab 才没。只刷新还在"],
          ["Cookie", "还在，按域和过期时间"],
          ["已下载的 html / js", "可能还在。是不是旧包，第 3 次看"],
      ], font=16)
notes(s, "语言选择：localStorage 的 DefaultLanguage，见 src/i18n/manager.ts，封装在 src/utils/storage.ts。文件注释：监听如果闭包住旧值，后来拿到的一直是注册时那份。闭包本节后面讲，和 React 状态搅在一起留到第 2 次。没有手动 new/delete。没人引用由 GC 收走；闭包还指着就收不走。")

# ---------- 8 先猜 ----------
s, n = new()
chrome(s, "事件循环  ·  15 分钟", "先写结果，先别讨论", n, TOTAL)
codeblock(s, Inches(0.7), Inches(1.4), Inches(11.9), Inches(2.5),
          "console.log('A')\nsetTimeout(() => console.log('B'), 0)\nPromise.resolve().then(() => console.log('C'))\nconsole.log('D')",
          22)
textbox(s, Inches(0.7), Inches(4.2), Inches(12), Inches(0.5),
        "输出顺序是哪一种？", 22, NAVY, True)
opts = ["A  B  C  D", "A  D  B  C", "A  D  C  B", "A  C  D  B"]
for i, t in enumerate(opts):
    x = Inches(0.7 + i * 3.1)
    rrect(s, x, Inches(4.9), Inches(2.9), Inches(0.9), CARD, LINE)
    textbox(s, x, Inches(5.1), Inches(2.9), Inches(0.5), t, 20, NAVY, True, align=PP_ALIGN.CENTER)
notes(s, "让学员先写在纸上或聊天里。下一页再揭晓，然后贴进已打开页面的 Console。不要自己先说答案。")

# ---------- 9 答案 ----------
s, n = new()
chrome(s, "事件循环", "顺序是 A  D  C  B", n, TOTAL)
rrect(s, Inches(0.55), Inches(1.25), Inches(12.2), Inches(1.15), RGBColor(0xE7, 0xF6, 0xF4), RGBColor(0xB7, 0xE0, 0xDA))
textbox(s, Inches(0.8), Inches(1.5), Inches(11.7), Inches(0.7),
        "A   D   C   B", 36, CYAN_DEEP, True, align=PP_ALIGN.CENTER)
steps = [
    ("同步", "先把当前这段跑完", "打印 A，再打印 D"),
    ("微任务", "然后清空微任务", "Promise.then 打印 C"),
    ("宏任务", "再取一条宏任务", "setTimeout(0) 打印 B"),
    ("然后", "才布局和绘制", "点击要等这一轮结束"),
]
for i, (a, b, c) in enumerate(steps):
    x = Inches(0.55 + i * 3.2)
    rrect(s, x, Inches(2.7), Inches(3.0), Inches(2.15), CARD, LINE)
    textbox(s, x + Inches(0.18), Inches(2.85), Inches(2.65), Inches(0.4), a, 18, CYAN, True)
    textbox(s, x + Inches(0.18), Inches(3.35), Inches(2.65), Inches(0.45), b, 16, NAVY, True)
    textbox(s, x + Inches(0.18), Inches(3.9), Inches(2.65), Inches(0.7), c, 15, MUTED)
callout(s, Inches(0.55), Inches(5.1), Inches(12.2), Inches(0.85),
        "setTimeout(..., 0) 不是立刻并行，只是把 B 放到宏任务队列。async 函数里 await 后面的代码，也是以微任务回来的。", 16)
notes(s, "C++：消息进队列，主线程取一条，更新控件。Java：请求进 Tomcat 线程，可以有很多条。前端：一条主线程，先同步，再微任务，再一条宏任务。")

# ---------- 10 四类事件 ----------
s, n = new()
chrome(s, "事件循环", "页面上这四类，都是宏任务，一次只处理一条", n, TOTAL)
table(s, Inches(0.5), Inches(1.25), Inches(12.3), Inches(2.7),
      ["事件", "队列里的谁"],
      [
          ["点击按钮", "这个点击的处理函数"],
          ["setTimeout / setInterval", "到点的回调"],
          ["请求回来", "axios 的回调，里面才是 await 继续往下走"],
          ["桥消息", "onMessageFromQt，页面代码仍在这条主线程"],
      ], font=16)
bullets(s, Inches(0.55), Inches(4.2), Inches(12.2), Inches(1.7), [
    "同步的 throw 会打断当前这个处理函数。",
    "async 里没人 await、也没人 catch 的拒绝：Console 报 Unhandled Rejection。下一个点击还能用。这不是进程崩溃，也不是 Tomcat 线程挂了。",
], 16)
callout(s, Inches(0.5), Inches(5.95), Inches(12.3), Inches(0.95),
        "同源只留一句：页面的源是协议 + 主机 + 端口。localhost:8000 和 Java 那台机器不是一个源。代理为什么让开发环境看起来没有跨域，第 3 次讲。", 15)
notes(s, "不要展开 CORS。")

# ---------- 11 两个空 ----------
s, n = new()
chrome(s, "值和 JSON  ·  16 分钟", "两个空，不是同一种没有", n, TOTAL)
table(s, Inches(0.5), Inches(1.25), Inches(12.3), Inches(1.7),
      ["", "含义", "从哪来"],
      [
          ["undefined", "还没有这个值", "没赋值、对象上没这个字段、函数没返回"],
          ["null", "有意放一个空", "JSON 里写了 null，或代码赋了 null"],
      ], font=16)
rrect(s, Inches(0.5), Inches(3.2), Inches(12.3), Inches(1.35), CARD, LINE)
textbox(s, Inches(0.75), Inches(3.4), Inches(11.8), Inches(1.0),
        "接口少了一个字段，前端拿到的多半是 undefined，不是 null。\nuser?.profile?.name 在中间任何一截为空时停住。对上 Java 的一串判空，或 C++ 的空指针检查。",
        18, INK)
callout(s, Inches(0.5), Inches(4.8), Inches(12.3), Inches(1.15),
        "Java 只有 null。读接口时先问：字段是没来，还是来了但故意是空。", 18)
notes(s, "这是读 JSON 时真正会看错的地方，不是语法。")

# ---------- 12 真假与 ?? ----------
s, n = new()
chrome(s, "值和 JSON", "0 次、空字符串，经常是合法值", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.22), Inches(12), Inches(0.45),
        "if (value) 把这些当假：false、0、''、null、undefined、NaN。空对象 {}、空数组 [] 是真。", 18, INK)
codeblock(s, Inches(0.55), Inches(1.8), Inches(12.2), Inches(1.15),
          "if (count) { /* 数量为 0 时，走的是失败分支 */ }\nconst n = count ?? 0      // 只在 null / undefined 时用 0", 18)
rrect(s, Inches(0.55), Inches(3.2), Inches(6.0), Inches(2.55), RGBColor(0xFF, 0xF4, 0xF0), RGBColor(0xF0, 0xC8, 0xB8))
textbox(s, Inches(0.8), Inches(3.4), Inches(5.5), Inches(0.4), "name || '匿名'", 20, RGBColor(0x8A, 0x30, 0x20), True)
textbox(s, Inches(0.8), Inches(3.95), Inches(5.5), Inches(1.5),
        "'' 和 0 也会被换成默认值。\n展示文案时，这经常是错的。", 18, INK)
rrect(s, Inches(6.8), Inches(3.2), Inches(6.0), Inches(2.55), RGBColor(0xE7, 0xF6, 0xF4), RGBColor(0xB7, 0xE0, 0xDA))
textbox(s, Inches(7.05), Inches(3.4), Inches(5.5), Inches(0.4), "name ?? '匿名'", 20, CYAN_DEEP, True)
textbox(s, Inches(7.05), Inches(3.95), Inches(5.5), Inches(1.5),
        "只在 null 和 undefined 时才换。\n0 和空字符串留着。", 18, INK)
notes(s, "数量、长度用 === 比较，或写成 count ?? 0。")

# ---------- 13 数字 ----------
s, n = new()
chrome(s, "值和 JSON", "数字只有一种，长整型 id 用字符串", n, TOTAL)
bullets(s, Inches(0.55), Inches(1.25), Inches(12.2), Inches(2.4), [
    "JS 的 number 是 64 位浮点。没有 Java 的 int / long，也没有 C++ 里由你选的整数宽度。",
    "0.1 + 0.2 === 0.3 为 false。金额不要用它做精确相等，用整数分。",
    "整数安全范围到 2^53 − 1，也就是 Number.MAX_SAFE_INTEGER。",
], 18)
callout(s, Inches(0.55), Inches(3.7), Inches(12.2), Inches(1.35),
        "Java 的 Long、雪花 id 若以 JSON number 传来，低位会丢，和后端比 id 会对不上。契约上这种 id 用字符串。本仓流程图布局里用 MAX_SAFE_INTEGER 当边界。", 17)
textbox(s, Inches(0.55), Inches(5.3), Inches(12.2), Inches(1.3),
        "10001 这种短 id 在安全整数里面，不会因为「是 JSON 数字」就坏。\n用来演示丢精度的是超过 2^53 − 1 的那一个，例如雪花 id。",
        18, MUTED)
notes(s, "不要拿 10001 当精度反例。字符串 9007199254740993 用 Number 解析后变成 9007199254740992。源码里不要把这个大整数写成 JS 数字字面量，字面量在解析时就已经被舍入。")

# ---------- 14 引用 ----------
s, n = new()
chrome(s, "值和 JSON", "赋值复制的是地址，const 锁的是绑定", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.3), Inches(7.3), Inches(2.6),
          "const obj = { x: 0 }\nconst alias = obj\nalias.x = 1\n// obj.x 也是 1\n// obj = {} 不合法", 18)
bullets(s, Inches(8.1), Inches(1.35), Inches(4.7), Inches(2.6), [
    "对象和数组赋值只复制地址。",
    "const 不能再指向别处。",
    "对象里面仍能改。",
    "字符串、number、boolean 按值比较。",
], 16)
callout(s, Inches(0.55), Inches(4.2), Inches(12.2), Inches(1.55),
        "对象用 === 比的是是不是同一个引用，不是字段相不相等。\n下一课会看到：就地 push、改字段，页面可能不重画。这节只要求看懂「这不是拷贝」。", 18)
notes(s, "不要在这节讲 setState。点到为止。")

# ---------- 15 类型擦除 ----------
s, n = new()
chrome(s, "类型擦除  ·  10 分钟", "浏览器跑的是擦掉类型之后的 JS", n, TOTAL)
textbox(s, Inches(0.55), Inches(1.18), Inches(12.2), Inches(0.7),
        "本仓 tsconfig.json：strict: true，jsx: \"react-jsx\"，module: \"esnext\"，moduleResolution: \"bundler\"，noEmit: true。tsc 不产出 JS，转译在 Webpack（Babel）里做。",
        15, MUTED)
table(s, Inches(0.5), Inches(2.0), Inches(12.3), Inches(3.15),
      ["写在 TS 里的", "运行时"],
      [
          ["interface、type、泛型 T", "没有了。不能 instanceof 一个 interface"],
          ["name?: string", "这个字段的类型含 undefined，strict 会逼你处理"],
          ["as Project", "只让编译器闭嘴，不检查 JSON 里有没有这些字段"],
          ["any", "把检查关掉。后面要用 e?.msg 这种可选链"],
      ], font=15)
callout(s, Inches(0.5), Inches(5.4), Inches(12.3), Inches(1.0),
        "TS 是给 IDE 和打包器的契约。接口文档和返回 JSON 不一致时，页面会在运行时炸，编译可以通过。", 17)
notes(s, "投屏时打开 tsconfig.json，指 noEmit。不要改成 Day1 附录里的 moduleResolution: node，以现场文件为准，大纲写的是 bundler。")

# ---------- 16 this ----------
s, n = new()
chrome(s, "函数  ·  12 分钟", "this 看谁调用，不像 Java 绑死在对象上", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.3), Inches(7.4), Inches(3.3),
          "const mgr = {\n  name: 'cs',\n  hi() { return this.name },\n}\nconst fn = mgr.hi\nmgr.hi()   // 'cs'\nfn()        // this 不再是 mgr", 18)
bullets(s, Inches(8.2), Inches(1.4), Inches(4.6), Inches(3.2), [
    "普通函数的 this 看调用点。",
    "C++ 成员函数、Java 实例方法绑在对象上。这里不是。",
    "箭头函数没有自己的 this，用的是外层那个。",
    "读给定时器、WebSocket、桥的回调时，先看它是普通函数还是箭头函数。",
], 16)
notes(s, "mgr 是举例，不是要求打开某个文件。若投屏能碰到注册回调的地方，指一下 function 还是 =>。")

# ---------- 17 闭包 ----------
s, n = new()
chrome(s, "函数", "闭包记住的是注册时那一份", n, TOTAL)
codeblock(s, Inches(0.55), Inches(1.3), Inches(6.6), Inches(2.5),
          "function makeCounter() {\n  let n = 0\n  return () => ++n\n}", 20)
bullets(s, Inches(7.4), Inches(1.35), Inches(5.4), Inches(2.5), [
    "内层函数可以读外层变量。",
    "外层函数返回之后，这些变量还活着。",
    "每次调用返回的函数，加的是它自己记住的那个 n。",
], 16)
callout(s, Inches(0.55), Inches(4.15), Inches(12.2), Inches(1.7),
        "定时器和 SharedWorker 的监听也是这样。人以为会看到「现在的最新值」，实际还是注册当时闭包里的那份。sharedworkerMgr.ts 的注释说的就是这件事。\n怎么配合 React 的依赖数组，第 2 次讲。", 17)
notes(s, "不要展开 useEffect。")

# ---------- 18 漏写 await ----------
s, n = new()
chrome(s, "异步  ·  12 分钟", "数据还没到，就不能当它已经在手里", n, TOTAL)
codeblock(s, Inches(0.5), Inches(1.25), Inches(12.3), Inches(2.55),
          "async function reload(setList) {\n  try {\n    const res = await request.get('/api/projects')\n    setList(res.data)\n  } catch (e) {\n    alertMessage.error({ content: e?.msg ?? '加载失败' })\n  }\n}", 16)
# three short
cols = [
    ("C++", "回调里才 setItems。回调外面还没有数据。"),
    ("Java", "thenAccept / CompletableFuture 完成之后才更新。"),
    ("前端", "await 把后面的代码推迟成微任务。setList 为什么重画，下一课讲。"),
]
for i, (a, b) in enumerate(cols):
    x = Inches(0.5 + i * 4.2)
    rrect(s, x, Inches(4.05), Inches(4.0), Inches(1.85), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(4.2), Inches(3.6), Inches(0.4), a, 18, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(4.7), Inches(3.6), Inches(0.95), b, 15, INK)
notes(s, "完整三段在 03-demo-snippets.md Demo A。课堂上三份都贴，各讲一句。这节不讲页面怎么重画。")

# ---------- 19 两个坑 ----------
s, n = new()
chrome(s, "异步", "两个坑，各记一次", n, TOTAL)
rrect(s, Inches(0.5), Inches(1.25), Inches(6.05), Inches(3.55), CARD, LINE)
textbox(s, Inches(0.75), Inches(1.45), Inches(5.6), Inches(0.4), "1  漏写 await", 22, NAVY, True)
textbox(s, Inches(0.75), Inches(2.1), Inches(5.6), Inches(2.3),
        "const res = request.get(...)\n\nres 是 Promise，不是响应体。\n接着写 res.data 得到 undefined，很像「接口没返回字段」。",
        18, INK)
rrect(s, Inches(6.75), Inches(1.25), Inches(6.05), Inches(3.55), CARD, LINE)
textbox(s, Inches(7.0), Inches(1.45), Inches(5.6), Inches(0.4), "2  catch 包不住", 22, NAVY, True)
textbox(s, Inches(7.0), Inches(2.1), Inches(5.6), Inches(2.3),
        "try/catch 包不住一个没人等待的 Promise。\n\n要么 await，要么 .catch。\n否则就是 Unhandled Rejection。",
        18, INK)
callout(s, Inches(0.5), Inches(5.05), Inches(12.3), Inches(1.35),
        "两条 await 是先后，不是两个线程。要同时发、都完成再往下，用 Promise.all。它仍回到这条主线程，只是等待期间线程可以去处理点击和别的回调。", 17)
notes(s, "现场若打开到没有 await 的一行，当场说明 res 会是 Promise。")

# ---------- 20 验收 ----------
s, n = new()
chrome(s, "控制台 + 验收  ·  5 分钟", "四问里能答上三问即可", n, TOTAL)
items = [
    ("1", "点击没反应", "主线程上有一段同步代码没跑完。不是再开个 Tomcat 线程能解决的。"),
    ("2", "表单没了，语言还在", "刷新后变量没了，localStorage 还在。"),
    ("3", "少字段，和 null", "少字段多半是 undefined。if (count) 在 0 时为假。"),
    ("4", "Long 对不上", "JSON number 超过 2^53 − 1 会丢精度。id 要用字符串。"),
]
for i, (no, t, d) in enumerate(items):
    y = Inches(1.22 + i * 1.15)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.05), CARD, LINE)
    textbox(s, Inches(0.7), y + Inches(0.28), Inches(0.5), Inches(0.5), no, 22, CYAN, True)
    textbox(s, Inches(1.35), y + Inches(0.12), Inches(10.8), Inches(0.38), t, 18, NAVY, True)
    textbox(s, Inches(1.35), y + Inches(0.5), Inches(10.8), Inches(0.42), d, 15, MUTED)
notes(s, "控制台已经跑过 A D C B。再打开两处：1) tsconfig.json 的 noEmit。2) 任意一处 await request，指出 interface 不会出现在运行时；若这行没有 await，说明 res 是 Promise。加分：漏写 await 时拿到的是 Promise。")

# ---------- 21 边界 ----------
s, n = new()
chrome(s, "收束", "今天停在这里", n, TOTAL)
left = [
    "这段脚本在这个 Tab 的主线程上跑",
    "A D C B：同步，微任务，再宏任务",
    "undefined 是还没有，null 是有意的空",
    "?? 留下 0 和空字符串",
    "超过 2^53 − 1 的 id 用字符串",
    "类型打包后不在；as 不检查 JSON",
    "漏写 await，拿到的是 Promise",
]
right = [
    "页面为什么要 setState 才重画",
    "状态放组件、hox 还是 mgr",
    "拦截器、业务 code",
    "CORS 和开发代理",
    "HTTP 缓存、用户是不是还在跑旧包",
    "断点、Performance、自己写 CRUD",
]
textbox(s, Inches(0.55), Inches(1.22), Inches(6), Inches(0.4), "今天带走", 18, CYAN, True)
textbox(s, Inches(6.9), Inches(1.22), Inches(6), Inches(0.4), "留给第 2、3 次", 18, RGBColor(0x8A, 0x5A, 0x00), True)
for i, t in enumerate(left):
    y = Inches(1.75 + i * 0.68)
    textbox(s, Inches(0.55), y, Inches(6.0), Inches(0.55), "▸  " + t, 16, INK)
for i, t in enumerate(right):
    y = Inches(1.75 + i * 0.78)
    textbox(s, Inches(6.9), y, Inches(5.9), Inches(0.65), "▸  " + t, 16, MUTED)
notes(s, "若课时被压到约 35 分钟：只留主线程表、A D C B、两个空、??、Long 精度、漏写 await。")

out = r"d:\文档\training\前端培训\06-frontend-basics-session1.pptx"
prs.save(out)
print(f"slides={len(prs.slides)} file={out}")
