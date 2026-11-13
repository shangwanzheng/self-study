# -*- coding: utf-8 -*-
"""第 3 次 PPT。数字、JSON、模块、日期与正则。从第 2 次拆出。"""
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
AMBER_LINE = RGBColor(0xE0, 0xA0, 0x30)
CODE_BG = RGBColor(0x0E, 0x16, 0x24)
CODE_FG = RGBColor(0xD7, 0xE8, 0xFF)
SOFT = RGBColor(0xE7, 0xF6, 0xF4)
SOFT_LINE = RGBColor(0xB7, 0xE0, 0xDA)
ROSE = RGBColor(0xFF, 0xF4, 0xF0)
ROSE_LINE = RGBColor(0xF0, 0xC8, 0xB8)
ROSE_INK = RGBColor(0x8A, 0x30, 0x20)

prs = Presentation()
prs.slide_width = W
prs.slide_height = H
prs.core_properties.title = "当你的直觉开始骗你 · 第 3 次"
prs.core_properties.subject = "数字、JSON、模块、日期与正则"
BLANK = prs.slide_layouts[6]
FOOTER = "当你的直觉开始骗你  ·  第 3 次  ·  约 90 分钟"


def set_font(run, name, size, color, bold=False, ea=None):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    east = ea or name
    for tag, face in (("latin", name), ("ea", east), ("cs", east)):
        el = rPr.find(qn(f"a:{tag}"))
        if el is None:
            el = rPr.makeelement(qn(f"a:{tag}"), {})
            rPr.append(el)
        el.set("typeface", face)


def add_run(p, text, size, color, bold=False, font="Microsoft YaHei", ea=None):
    r = p.add_run()
    r.text = text
    set_font(r, font, size, color, bold, ea)
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
        sh.line.width = Pt(1.25)
    sh.shadow.inherit = False
    try:
        sh.adjustments[0] = 0.08
    except Exception:
        pass
    return sh


def _anchor(tf, anchor):
    try:
        tf._txBody.bodyPr.set(
            "anchor",
            {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}[anchor],
        )
    except Exception:
        pass


def textbox(slide, x, y, w, h, text, size=18, color=INK, bold=False, align=PP_ALIGN.LEFT,
            font="Microsoft YaHei", anchor=MSO_ANCHOR.TOP, ea=None):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, Emu(0))
    _anchor(tf, anchor)
    p = tf.paragraphs[0]
    p.alignment = align
    p.space_before = Pt(0)
    p.space_after = Pt(0)
    add_run(p, text, size, color, bold, font, ea)
    return tb


def write_lines(slide, x, y, w, h, lines, size=16, color=INK, bold=False, align=PP_ALIGN.LEFT,
                font="Microsoft YaHei", ea=None, before=2, after=2, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, Emu(0))
    _anchor(tf, anchor)
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_before = Pt(before)
        p.space_after = Pt(after)
        add_run(p, line, size, color, bold, font, ea)
    return tb


def notes(slide, text):
    slide.notes_slide.notes_text_frame.text = text


def chrome(slide, kicker, title, page, total):
    rect(slide, 0, 0, W, Inches(0.08), CYAN)
    textbox(slide, Inches(0.55), Inches(0.18), Inches(12.2), Inches(0.26), kicker, 13, CYAN, True)
    textbox(slide, Inches(0.55), Inches(0.42), Inches(12.2), Inches(0.46), title, 26, NAVY, True)
    rect(slide, 0, Inches(7.18), W, Inches(0.32), NAVY)
    textbox(slide, Inches(0.55), Inches(7.2), Inches(9.2), Inches(0.26), FOOTER, 11, RGBColor(0xC5, 0xD4, 0xE0))
    textbox(slide, Inches(11.2), Inches(7.2), Inches(1.6), Inches(0.26),
            f"{page}  /  {total}", 11, RGBColor(0xC5, 0xD4, 0xE0), align=PP_ALIGN.RIGHT)


def codeblock(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, CODE_BG)
    tb = slide.shapes.add_textbox(x + Inches(0.26), y + Inches(0.14), w - Inches(0.46), h - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(1)
        p.space_after = Pt(1)
        add_run(p, line if line else " ", size, CODE_FG, font="Consolas", ea="Microsoft YaHei")
    return tb


def callout(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, SOFT, SOFT_LINE)
    rect(slide, x, y, Inches(0.08), h, CYAN)
    write_lines(slide, x + Inches(0.26), y + Inches(0.08), w - Inches(0.42), h - Inches(0.14),
                text.split("\n"), size, CYAN_DEEP, before=1, after=1, anchor=MSO_ANCHOR.MIDDLE)


def shade_cell(cell, fill, lines, size, color, bold=False, align=PP_ALIGN.LEFT):
    cell.fill.solid()
    cell.fill.fore_color.rgb = fill
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf = cell.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    first = tf.paragraphs[0]
    first.clear()
    for i, line in enumerate(lines):
        p = first if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_before = Pt(1)
        p.space_after = Pt(1)
        add_run(p, line, size, color, bold)
    tcPr = cell._tc.get_or_add_tcPr()
    for attr, val in (("marL", "90000"), ("marR", "70000"), ("marT", "20000"), ("marB", "20000")):
        tcPr.set(attr, val)
    for edge in ("lnL", "lnR", "lnT", "lnB"):
        for old in tcPr.findall(qn(f"a:{edge}")):
            tcPr.remove(old)
        ln = etree.SubElement(tcPr, qn(f"a:{edge}"))
        ln.set("w", "6350")
        solid = etree.SubElement(ln, qn("a:solidFill"))
        rgb = etree.SubElement(solid, qn("a:srgbClr"))
        rgb.set("val", "D5DEE8")


def panel(slide, x, y, w, h, tone, title, lines, size=16):
    fill, line, color = {
        "amber": (AMBER_BG, AMBER_LINE, AMBER),
        "soft": (SOFT, SOFT_LINE, CYAN_DEEP),
        "rose": (ROSE, ROSE_LINE, ROSE_INK),
        "card": (CARD, LINE, NAVY),
    }[tone]
    rrect(slide, x, y, w, h, fill, line)
    textbox(slide, x + Inches(0.22), y + Inches(0.16), w - Inches(0.4), Inches(0.4), title, 18, color, True)
    write_lines(slide, x + Inches(0.22), y + Inches(0.62), w - Inches(0.4), h - Inches(0.78),
                lines, size, INK, before=3, after=3)


TOTAL = 13
page = 0


def new():
    global page
    page += 1
    return prs.slides.add_slide(BLANK), page


# 1 封面
s, n = new()
rect(s, 0, 0, W, H, NAVY)
rect(s, 0, 0, Inches(0.18), H, CYAN)
textbox(s, Inches(0.75), Inches(1.05), Inches(11.5), Inches(0.32),
        "第三课  ·  JavaScript  ·  给有 C++ / Java 背景的同事", 16, CYAN, True)
textbox(s, Inches(0.75), Inches(1.48), Inches(12), Inches(0.85), "当你的直觉开始骗你", 44, WHITE, True)
textbox(s, Inches(0.75), Inches(2.45), Inches(11.5), Inches(0.7),
        "第 3 次  ·  数字、JSON、模块、日期与正则\n约 90 分钟。承接第 2 次：this 看调用点，属性沿原型找，异步是排队。",
        18, RGBColor(0xC5, 0xD4, 0xE0))
chips = [
    ("先记住", "日常只有一种数字。\nJSON 会丢字段。\n日期和正则带着状态。"),
    ("今天三块", "数字与数组约 25 分钟。\nJSON 约 30 分钟。\n模块、日期、正则约 20 分钟。"),
    ("今天不讲", "this、原型、事件循环。\nDOM、fetch、TypeScript。\n那些已经讲过，或留给后续。"),
]
for i, (a, b) in enumerate(chips):
    x = Inches(0.75 + i * 4.05)
    rrect(s, x, Inches(3.7), Inches(3.85), Inches(2.35), RGBColor(0x14, 0x32, 0x4C))
    textbox(s, x + Inches(0.24), Inches(3.88), Inches(3.4), Inches(0.36), a, 14, CYAN, True)
    textbox(s, x + Inches(0.24), Inches(4.36), Inches(3.4), Inches(1.45), b, 16, WHITE)
notes(s, "不要回头讲 this 和事件循环。有人用它们提问，指回第 2 次的口袋页。")

# 2 时间
s, n = new()
chrome(s, "开场", "今天按这个顺序走", n, TOTAL)
steps = [
    ("25′", "数字与数组", "一种数字。sort 默认按字符串。两种 for。"),
    ("30′", "JSON", "哪些字段会消失。?? 和可选链各停在不同的空上。"),
    ("20′", "模块与日期", "CJS 和 ESM。日期、正则各一个反例。"),
    ("15′", "收束", "发这一讲的口袋。练习布置下去，不对答案。"),
]
for i, (tm, title, desc) in enumerate(steps):
    col, row = i % 2, i // 2
    x = Inches(0.45 + col * 6.45)
    y = Inches(1.25 + row * 2.85)
    rrect(s, x, y, Inches(6.25), Inches(2.6), CARD, LINE)
    textbox(s, x + Inches(0.28), y + Inches(0.28), Inches(5.7), Inches(0.45), tm, 22, CYAN, True)
    textbox(s, x + Inches(0.28), y + Inches(0.85), Inches(5.7), Inches(0.5), title, 26, NAVY, True)
    textbox(s, x + Inches(0.28), y + Inches(1.5), Inches(5.7), Inches(0.8), desc, 16, INK)
notes(s, "时间紧时：数字留 0.1+0.2 和 sort；JSON 留丢字段；日期和正则各一句。解构可以口头带过。")

# 3 数字
s, n = new()
chrome(s, "数字与数组  ·  25 分钟", "日常计算只有一种数字", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(4.05), Inches(4.2), "amber", "C++",
      ["int、long、double 分开。", "宽度由你选。"], 18)
panel(s, Inches(4.65), Inches(1.15), Inches(4.05), Inches(4.2), "amber", "Java",
      ["int、long 分开。", "金额可以用 BigDecimal。"], 18)
panel(s, Inches(8.85), Inches(1.15), Inches(4.0), Inches(4.2), "soft", "JavaScript",
      ["日常只有 Number。", "超过 2^53−1 用 BigInt。", "0.1+0.2 不等于 0.3。"], 18)
callout(s, Inches(0.45), Inches(5.55), Inches(12.4), Inches(1.3),
        "这不是 JS 独有的浮点问题。JS 没有开箱的小数类型，所以业务里直接看见。钱用整数分，或单独的 decimal 库。", 16)
notes(s, "长 id 不要用 JSON 数字。字符串契约留到 JSON 那页再钉一次。")

# 4 sort
s, n = new()
chrome(s, "数字与数组  ·  25 分钟", "sort 默认按字符串", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(12.4), Inches(1.7),
          "[1, 2, 10].sort()           // [1, 10, 2]\n[1, 2, 10].sort((a, b) => a - b)", 20)
panel(s, Inches(0.45), Inches(3.1), Inches(6.15), Inches(2.55), "rose", "会改原数组",
      ["sort、reverse、splice、push。", "和 C++ std::sort、Java Arrays.sort 一样就地改。"], 16)
panel(s, Inches(6.75), Inches(3.1), Inches(6.1), Inches(2.55), "soft", "要新数组",
      ["toSorted、toReversed、toSpliced。", "业务代码优先用不改原数组的写法。"], 16)
callout(s, Inches(0.45), Inches(5.85), Inches(12.4), Inches(1.0),
        "数值序必须传入比较函数。不传，10 会排在 2 前面。", 17)
notes(s, "对照：C++ 和 Java 的默认排序按数值。这里默认把元素转成字符串再比。")

# 5 遍历
s, n = new()
chrome(s, "数字与数组  ·  25 分钟", "两种 for，不是 Java 那一种", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.4), "rose", "for...in",
      ["走可枚举属性名，包括原型链上的。", "顺序不要依赖。", "不要用它遍历数组。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.4), "soft", "for...of",
      ["走可迭代对象的值。", "数组、字符串、Map、Set 用它。", "普通对象用 Object.entries。"], 18)
callout(s, Inches(0.45), Inches(5.75), Inches(12.45), Inches(1.1),
        "Array(3) 是三个空槽，不是三个 undefined。map 会跳过空槽。要三个 undefined，用 Array.from({ length: 3 })。", 16)
notes(s, "Java 增强 for 只有一种语义。这里有两个，名字还很近。")

# 6 JSON
s, n = new()
chrome(s, "JSON  ·  30 分钟", "JSON 不是对象的完整镜像", n, TOTAL)
rows = [
    ("留下", "普通数据、null"),
    ("丢掉", "对象里的 undefined、函数、Symbol"),
    ("变形", "NaN 和 Infinity 变成 null；Date 变成字符串"),
    ("抛错", "BigInt、循环引用"),
]
for i, (k, v) in enumerate(rows):
    y = Inches(1.15 + i * 1.15)
    rrect(s, Inches(0.45), y, Inches(12.4), Inches(1.05), CARD, LINE)
    textbox(s, Inches(0.7), y + Inches(0.25), Inches(1.6), Inches(0.55), k, 20, CYAN, True)
    textbox(s, Inches(2.5), y + Inches(0.25), Inches(9.9), Inches(0.55), v, 20, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "Java 字段写在类上，Jackson 对不上时常直接失败。JS 往往序列化成功，只是字段没了。\n"
         "自定义用 toJSON；解析用 JSON.parse(text, reviver)。深合并时提一句原型污染，不展开。")

# 7 两种没有
s, n = new()
chrome(s, "JSON  ·  30 分钟", "两种「没有」，到了 JSON 里不一样", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(3.3), "card", "对象里的 undefined",
      ["JSON.stringify({ a: undefined })", "字段被丢掉，结果是 {}。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(3.3), "card", "数组里的 undefined",
      ["JSON.stringify([undefined])", "变成 null，结果是 [null]。"], 18)
callout(s, Inches(0.45), Inches(4.65), Inches(12.45), Inches(2.15),
        "长整型 id 用字符串。Number 超过 2^53−1 会丢低位，和后端比 id 会对不上。\n"
        "序列化前先问：哪些字段会消失或变形。", 17)
notes(s, "上一页的「丢掉」指对象字段。这一页把数组补上，避免学员记成「undefined 一律消失」。")

# 8 解构
s, n = new()
chrome(s, "JSON  ·  30 分钟", "默认值、??、可选链，各停在不同的空上", n, TOTAL)
items = [
    ("解构 null", "const { a } = null 直接抛 TypeError。空在解构这一步就炸。"),
    ("默认值", "只在 undefined 时生效。{ a: null } 解构出来仍是 null，不是 1。"),
    ("可选链", "?. 只停在写了问号的那一层。obj?.a.b 在 a 为 null 时仍会抛。要写成 obj?.a?.b。"),
    ("?? 和 ||", "|| 把 0 和空字符串也换掉。?? 只换 null 和 undefined。0 ?? 1 是 0。"),
]
for i, (title, desc) in enumerate(items):
    col, row = i % 2, i // 2
    x = Inches(0.45 + col * 6.45)
    y = Inches(1.15 + row * 2.85)
    rrect(s, x, y, Inches(6.25), Inches(2.7), CARD, LINE)
    textbox(s, x + Inches(0.22), y + Inches(0.2), Inches(5.8), Inches(0.45), title, 20, NAVY, True)
    textbox(s, x + Inches(0.22), y + Inches(0.8), Inches(5.8), Inches(1.65), desc, 16, INK)
notes(s, "展开是浅拷贝，嵌套对象仍共享。这页时间不够就口头一句，不单开。")

# 9 模块
s, n = new()
chrome(s, "模块、日期、正则  ·  20 分钟", "代码怎么进来，四套不是一套", n, TOTAL)
rows = [
    ("C++", "#include 在预处理时把文本拉进来"),
    ("Java", "import 在编译期解析类型"),
    ("CJS", "require 运行时同步加载，结果有缓存"),
    ("ESM", "import 静态提升；导出名是活绑定"),
]
for i, (k, v) in enumerate(rows):
    y = Inches(1.15 + i * 1.15)
    rrect(s, Inches(0.45), y, Inches(12.4), Inches(1.05), CARD, LINE)
    textbox(s, Inches(0.7), y + Inches(0.25), Inches(1.5), Inches(0.55), k, 20, CYAN, True)
    textbox(s, Inches(2.4), y + Inches(0.25), Inches(10), Inches(0.55), v, 20, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "CJS：module.exports 和 exports 起初是同一对象。把 exports 重新赋值为另一个对象会断开。顶层 this 是 module.exports。\n"
         "ESM：顶层 this 是 undefined。import() 返回 Promise。package.json 的 type 为 module 时，.js 按 ESM 解析。\n"
         "循环依赖时 ESM 可能拿到尚未初始化的绑定。守则：新项目用 ESM，看到 require 就知道是 CJS，不要混用。")

# 10 日期正则
s, n = new()
chrome(s, "模块、日期、正则  ·  20 分钟", "日期和正则都带着隐藏状态", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.4), "amber", "日期",
      ["2024-01-01 按 UTC 解析。", "2024/01/01 常按本地，引擎还不完全一致。", "getMonth() 返回 0 表示一月。", "setDate 改的是原对象。"], 17)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.4), "rose", "带 g 的正则",
      ["同一个实例记住 lastIndex。", "第二次 test 可能变成 false。", "每次新建，或用完把 lastIndex 设回 0。"], 17)
callout(s, Inches(0.45), Inches(5.75), Inches(12.45), Inches(1.1),
        "日期用带时区的 ISO 字符串。正则带 g 时，不要复用同一个实例做多次 test。", 17)
notes(s, "不要展开时区数据库。只留这两个反例。")

# 11 口袋
s, n = new()
chrome(s, "收束  ·  15 分钟", "这一讲带走这六句", n, TOTAL)
rules = [
    ("数字", "超安全整数用 BigInt。钱用整数分。"),
    ("sort", "数字必须传比较函数，而且会改原数组。"),
    ("遍历", "数组用 for...of。对象用 Object.entries。"),
    ("JSON", "对象里的 undefined 会丢。NaN 变成 null。"),
    ("空值", "?? 只换 null 和 undefined。?. 要逐级写。"),
    ("日期", "用带时区的 ISO。带 g 的正则不要复用。"),
]
for i, (name, desc) in enumerate(rules):
    col, row = i % 2, i // 2
    x = Inches(0.4 + col * 6.5)
    y = Inches(1.2 + row * 1.9)
    rrect(s, x, y, Inches(6.3), Inches(1.72), CARD, LINE)
    textbox(s, x + Inches(0.28), y + Inches(0.22), Inches(5.75), Inches(0.4), name, 18, CYAN, True)
    textbox(s, x + Inches(0.28), y + Inches(0.72), Inches(5.75), Inches(0.75), desc, 16, INK)
notes(s, "this、原型、异步的口袋在第 2 次，这页不重复。模块再补一句：新项目用 ESM，看到 require 就是 CJS。")

# 12 练习
s, n = new()
chrome(s, "收束  ·  15 分钟", "标出会静默出错的地方", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(12.4), Inches(3.7),
          "if (count == \"\") list.sort()\nconst text = JSON.stringify({ id: undefined, n: NaN })\nconst re = /a/g\nre.test(\"a\")\nre.test(\"a\")", 20)
callout(s, Inches(0.45), Inches(5.1), Inches(12.4), Inches(1.7),
        "课后标出每一处为什么和直觉不一样。这 15 分钟只布置，不对答案。", 18)
notes(s, "答案：== 会把 0 当成空串；sort 不传比较函数按字符串排，并且改原数组；\n"
         "JSON 丢掉 id，n 变成 null；同一个 /a/g 第二次 test 是 false。")

# 13 Q&A
s, n = new()
chrome(s, "收束  ·  Q & A", "提问前，先说清楚三件事", n, TOTAL)
qa = [
    ("哪一行", "贴出代码，或说明第几行。", "只说「不对」，别人没法接。"),
    ("预期与实际", "你以为会输出什么？", "实际输出什么？差在哪一步？"),
    ("对应哪条规则", "归到哪一块？", "数字、JSON，还是日期？"),
]
for i, (title, a, b) in enumerate(qa):
    x = Inches(0.45 + i * 4.2)
    rrect(s, x, Inches(1.2), Inches(4.0), Inches(3.7), CARD, LINE)
    textbox(s, x + Inches(0.25), Inches(1.45), Inches(3.5), Inches(0.5), title, 22, CYAN, True)
    write_lines(s, x + Inches(0.25), Inches(2.25), Inches(3.5), Inches(2.5), [a, b], 18, INK, before=8, after=8)
callout(s, Inches(0.45), Inches(5.3), Inches(12.4), Inches(1.4),
        "this、原型、事件循环指回第 2 次。DOM、fetch、TypeScript、框架留到后续课。\n"
        "上一页的练习如有人提问，先指回代码行，不直接给答案。", 17)
notes(s, "练习答案：== 把 0 当空串；sort 按字符串排并改原数组；JSON 丢掉 id，n 变成 null；\n"
         "同一个 /a/g 第二次 test 为 false。时间不够时只收两个问题。")

assert page == TOTAL, page
out = r"D:\文档\training\前端培训\第3次-数字JSON与模块.pptx"
prs.save(out)
print(f"saved {out} slides={page}")
