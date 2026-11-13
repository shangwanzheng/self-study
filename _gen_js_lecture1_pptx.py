# -*- coding: utf-8 -*-
"""第 1 次 PPT。

开场取自《当你的直觉开始骗你.md》的课次定位。
模块一、模块二取自同名文件夹里的大纲。
"""
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
ROW_ALT = RGBColor(0xF7, 0xFA, 0xFC)
HEAD_BG = RGBColor(0x0B, 0x1F, 0x33)
FOOT = RGBColor(0xC5, 0xD4, 0xE0)
SOFT = RGBColor(0xE7, 0xF6, 0xF4)
SOFT_LINE = RGBColor(0xB7, 0xE0, 0xDA)
DIM = RGBColor(0xE8, 0xEE, 0xF2)
DIM_INK = RGBColor(0x6A, 0x78, 0x86)

prs = Presentation()
prs.slide_width = W
prs.slide_height = H
prs.core_properties.title = "当你的直觉开始骗你 · 第 1 次"
prs.core_properties.subject = "开场、动态类型、作用域与闭包。"
BLANK = prs.slide_layouts[6]
FOOTER = "当你的直觉开始骗你  ·  第 1 次  ·  90 分钟"


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
    tf.margin_left = Emu(0)
    tf.margin_right = Emu(0)
    tf.margin_top = Emu(0)
    tf.margin_bottom = Emu(0)
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
    tf.margin_left = Emu(0)
    tf.margin_right = Emu(0)
    tf.margin_top = Emu(0)
    tf.margin_bottom = Emu(0)
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
    textbox(slide, Inches(0.55), Inches(0.2), Inches(12.2), Inches(0.28), kicker, 13, CYAN, True)
    textbox(slide, Inches(0.55), Inches(0.46), Inches(12.2), Inches(0.46), title, 26, NAVY, True)
    rect(slide, 0, Inches(7.18), W, Inches(0.32), NAVY)
    textbox(slide, Inches(0.55), Inches(7.2), Inches(9.2), Inches(0.26), FOOTER, 11, FOOT)
    textbox(slide, Inches(11.2), Inches(7.2), Inches(1.6), Inches(0.26),
            f"{page}  /  {total}", 11, FOOT, align=PP_ALIGN.RIGHT)


def codeblock(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, CODE_BG)
    tb = slide.shapes.add_textbox(x + Inches(0.28), y + Inches(0.16), w - Inches(0.5), h - Inches(0.28))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(1)
        p.space_after = Pt(1)
        add_run(p, line if line else " ", size, CODE_FG, font="Consolas", ea="Microsoft YaHei")
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
    cell.margin_left = Pt(10)
    cell.margin_right = Pt(8)
    cell.margin_top = Pt(4)
    cell.margin_bottom = Pt(4)
    tf = cell.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    add_run(p, text, size, color, bold)
    set_cell_border(cell)


def callout(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, SOFT, SOFT_LINE)
    rect(slide, x, y, Inches(0.08), h, CYAN)
    write_lines(slide, x + Inches(0.28), y + Inches(0.08), w - Inches(0.46), h - Inches(0.14),
                text.split("\n"), size, CYAN_DEEP, before=1, after=1, anchor=MSO_ANCHOR.MIDDLE)


def amber_bar(slide, x, y, w, h, text, size=16):
    rrect(slide, x, y, w, h, AMBER_BG)
    rect(slide, x, y, Inches(0.08), h, AMBER_LINE)
    write_lines(slide, x + Inches(0.28), y + Inches(0.08), w - Inches(0.46), h - Inches(0.14),
                text.split("\n"), size, AMBER, before=1, after=1, anchor=MSO_ANCHOR.MIDDLE)


TOTAL = 26
page = 0


def new():
    global page
    page += 1
    return prs.slides.add_slide(BLANK), page


# ---------- 1 封面 ----------
s, n = new()
rect(s, 0, 0, W, H, NAVY)
rect(s, 0, 0, Inches(0.18), H, CYAN)
textbox(s, Inches(0.75), Inches(1.15), Inches(11.5), Inches(0.32),
        "第三课  ·  JavaScript  ·  给有 C++ / Java 背景的同事", 16, CYAN, True)
textbox(s, Inches(0.75), Inches(1.6), Inches(12), Inches(1.05),
        "当你的直觉开始骗你", 46, WHITE, True)
textbox(s, Inches(0.75), Inches(2.8), Inches(11.5), Inches(0.85),
        "第 1 次 · 值和作用域 · 90 分钟\n语法长得像，所以会把静态语言的心智模型用过来。",
        20, FOOT)
labels = [
    ("今天带走", "值没有类型盒子。\nvar 的花括号是装饰。\n闭包记住的是绑定。"),
    ("今天怎么讲", "每个模块先看对照，\n再跑一个会静默出错的例子。"),
    ("今天不讲", "this、原型、事件循环。\nJSON、sort、日期、正则。"),
]
for i, (a, b) in enumerate(labels):
    x = Inches(0.75 + i * 4.05)
    rrect(s, x, Inches(4.15), Inches(3.85), Inches(2.15), RGBColor(0x14, 0x32, 0x4C))
    textbox(s, x + Inches(0.24), Inches(4.32), Inches(3.4), Inches(0.36), a, 14, CYAN, True)
    textbox(s, x + Inches(0.24), Inches(4.78), Inches(3.4), Inches(1.3), b, 16, WHITE)
notes(s, "前两课已经有页面和工程概念。这一课不要求背完怪异行为。\n"
         "结束时要能说出三句：值没有类型盒子；var 的花括号是装饰；闭包记住的是绑定。")

# ---------- 2 定位 ----------
s, n = new()
chrome(s, "开场  ·  8 分钟", "踩坑通常不是因为语法陌生", n, TOTAL)
pairs = [
    (AMBER_BG, AMBER_LINE, AMBER, "他们会怎么错",
     ["语法长得像 C++ / Java。", "于是继续用静态语言的心智模型。", "变量该有类型。花括号该是作用域。", "this 该是当前对象。错了该抛异常。"]),
    (SOFT, SOFT_LINE, CYAN, "这课给什么",
     ["不背所有怪异行为。", "遇到不确定，知道往哪个方向查。", "每个模块先投一张对照。", "再跑一两个会静默出错的例子。"]),
]
for i, (fill, line, color, title, lines) in enumerate(pairs):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(1.18), Inches(6.15), Inches(4.15), fill, line)
    textbox(s, x + Inches(0.3), Inches(1.4), Inches(5.55), Inches(0.5), title, 24, color, True)
    write_lines(s, x + Inches(0.3), Inches(2.15), Inches(5.55), Inches(2.85), lines, 18, INK, before=6, after=6)
callout(s, Inches(0.5), Inches(5.55), Inches(12.3), Inches(1.3),
        "图只服务当场要记住的那一个反差。错了往往不是崩，而是算出一个还能往下用的值。", 18)
notes(s, "开场先把「这不是随机 bug」说清楚，再进四个底层选择。\n"
         "静默出错是全课的共同形状：Java 的转型失败会抛 ClassCastException，JS 常常不抛。")

# ---------- 3 三次 ----------
s, n = new()
chrome(s, "开场  ·  8 分钟", "三次课，每次带走一句判断", n, TOTAL)
sessions = [
    (True, "第 1 次 · 今天", "开场、动态类型、作用域与闭包",
     "值没有类型盒子。var 的花括号是装饰。闭包记住的是绑定。"),
    (False, "第 2 次", "this、原型、事件循环",
     "this 看调用点。属性沿原型找。异步是排队，try/catch 抓不住回调。"),
    (False, "第 3 次", "数字与数组、JSON、模块日期正则",
     "数字和 sort 的规则不同。JSON 会丢字段。模块、日期、正则各有一条守则。"),
]
for i, (today, title, mods, take) in enumerate(sessions):
    y = Inches(1.2 + i * 1.85)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.7), SOFT if today else CARD, SOFT_LINE if today else LINE)
    textbox(s, Inches(0.78), y + Inches(0.18), Inches(4.3), Inches(0.42), title, 20, CYAN if today else NAVY, True)
    textbox(s, Inches(5.2), y + Inches(0.2), Inches(7.2), Inches(0.4), mods, 16, MUTED if not today else CYAN_DEEP)
    textbox(s, Inches(0.78), y + Inches(0.78), Inches(11.6), Inches(0.7), take, 18, INK)
notes(s, "指今天这一行。后两次只让他们知道还没讲，不展开。每次大约 90 分钟。")

# ---------- 4 今天时间 ----------
s, n = new()
chrome(s, "开场  ·  8 分钟", "今天这 90 分钟", n, TOTAL)
steps = [
    ("8′", "开场", "四个底层选择。本课只建立往哪查。"),
    ("40′", "模块一", "标签不是盒子。===、两个空、假值。其余转换只留守则。"),
    ("35′", "模块二", "现场跑 var 循环。const 只冻绑定。"),
    ("7′", "收束", "用两张对照图，各复述一句。"),
]
for i, (tm, title, desc) in enumerate(steps):
    y = Inches(1.22 + i * 1.4)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(1.25), CARD, LINE)
    textbox(s, Inches(0.8), y + Inches(0.32), Inches(1.2), Inches(0.6), tm, 26, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(2.15), y + Inches(0.28), Inches(2.3), Inches(0.7), title, 24, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(4.6), y + Inches(0.28), Inches(7.8), Inches(0.7), desc, 18, INK, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "时间紧时，模块一留对照、===、两个空、假值。模块二留 var 循环和 const 只冻绑定。\n"
         "setTimeout 在循环那页只表示回调晚于循环。有人问微任务，留到第 2 次。")

# ---------- 5 四个选择 ----------
s, n = new()
chrome(s, "开场  ·  8 分钟", "四个底层选择叠在一起", n, TOTAL)
choices = [
    (True, "函数级作用域", "花括号不是\nvar 的边界"),
    (True, "动态类型", "变量没有\n类型盒子"),
    (False, "单线程事件循环", "异步是排队\n不是多线程"),
    (False, "原型继承", "属性运行时\n沿链往上找"),
]
for i, (today, title, desc) in enumerate(choices):
    x = Inches(0.45 + i * 3.22)
    rrect(s, x, Inches(1.2), Inches(3.05), Inches(3.55), SOFT if today else DIM, SOFT_LINE if today else LINE)
    textbox(s, x + Inches(0.18), Inches(1.4), Inches(2.7), Inches(0.36),
            "今天" if today else "第 2 次", 14, CYAN if today else DIM_INK, True)
    textbox(s, x + Inches(0.18), Inches(1.88), Inches(2.7), Inches(1.05), title, 22, NAVY if today else MUTED, True)
    textbox(s, x + Inches(0.18), Inches(3.05), Inches(2.7), Inches(1.35), desc, 16, INK if today else DIM_INK)
callout(s, Inches(0.45), Inches(5.0), Inches(12.4), Inches(1.85),
        "这些不是随机 bug。语法像 C / Java，行为不像，是这四个选择叠出来的。\n第 1 次只碰前两个。事件循环和原型在第 2 次。", 18)
notes(s, "先抛判断，再指今天的两张卡。\n"
         "第 2 次还会讲 this。this 不在这四个名字里，不要在这页展开。")

# ---------- 6 模块一对照 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "变量是标签，不是类型盒子", n, TOTAL)
cols = [
    (AMBER_BG, AMBER_LINE, AMBER, "C++ / Java：变量是盒子",
     ["盒子先有类型。", "装得下吗？", "C++：类型不对，编译失败。", "Java：转型失败，抛 ClassCastException。"]),
    (SOFT, SOFT_LINE, CYAN, "JavaScript：变量是标签",
     ["标签贴到哪个值上，它就是什么。", "可以改贴到另一种值。", "let x = 1 再 x = \"hello\"，不报错。", "错配通常不抛，算出还能往下用的值。"]),
]
for i, (fill, line, color, title, lines) in enumerate(cols):
    x = Inches(0.45 + i * 6.45)
    rrect(s, x, Inches(1.18), Inches(6.25), Inches(4.05), fill, line)
    textbox(s, x + Inches(0.28), Inches(1.38), Inches(5.7), Inches(0.7), title, 20, color, True)
    write_lines(s, x + Inches(0.28), Inches(2.2), Inches(5.7), Inches(2.7), lines, 18, INK, before=5, after=5)
callout(s, Inches(0.45), Inches(5.42), Inches(12.45), Inches(1.42),
        "指右边。'5' - 1 得到 4，'5' + 1 得到 '51'。Java 会在转型失败时抛异常，JS 往往安静地给出一个不符合预期的值。", 16)
notes(s, "现场打这两行。先让他们猜加号。\n"
         "这页只建立「标签 / 盒子」。转换规则下一组再拆。")

# ---------- 7 等号右边 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "类型在等号右边", n, TOTAL)
textbox(s, Inches(0.5), Inches(1.15), Inches(12.3), Inches(0.55),
        "动态类型可以看成：类型描述的是值，不是左边那个标签。", 18, INK)
cols = [
    ("原始值：再赋值是另一份", "let a = 1;\nlet b = a;\nb = 2;          // a 仍是 1"),
    ("对象：再赋值是同一份引用", "const o = { x: 1 };\nconst p = o;\np.x = 2;        // o.x 也是 2"),
]
for i, (title, code) in enumerate(cols):
    x = Inches(0.5 + i * 6.4)
    textbox(s, x, Inches(1.8), Inches(6.15), Inches(0.42), title, 18, CYAN, True)
    codeblock(s, x, Inches(2.3), Inches(6.15), Inches(2.15), code, 20)
callout(s, Inches(0.5), Inches(4.7), Inches(12.3), Inches(2.1),
        "C++ 里，原始值像按值传递，对象标签像指针。Java 里，基本类型按值，对象变量存的是引用。\n数组也是对象。函数既是值也是对象，本模块最后单独看。", 18)
notes(s, "先跑左边，再跑右边。停在 o.x 变成 2。\n"
         "同一标签改贴另一种值，上一页已经说过，这里不要再演示 x = \"hello\"。")

# ---------- 8 typeof ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "typeof 会把两件事说错", n, TOTAL)
rows = [
    ("typeof null", "\"object\"", "初版引擎的类型标记遗留。null 仍是原始值，不是对象。"),
    ("typeof NaN", "\"number\"", "它是数字类型里的「不是一个数」。"),
    ("typeof []", "\"object\"", "数组没有自己的 typeof。它是对象。"),
    ("typeof function(){}", "\"function\"", "这里单独一类，但它仍是对象。"),
]
for i, (expr, result, why) in enumerate(rows):
    y = Inches(1.15 + i * 1.22)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.1), CARD, LINE)
    textbox(s, Inches(0.72), y + Inches(0.22), Inches(4.3), Inches(0.66), expr, 18, NAVY, True,
            font="Consolas", ea="Microsoft YaHei", anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(5.1), y + Inches(0.22), Inches(2.15), Inches(0.66), result, 18, CYAN, True,
            font="Consolas", ea="Microsoft YaHei", anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(7.35), y + Inches(0.16), Inches(5.2), Inches(0.8), why, 15, INK, anchor=MSO_ANCHOR.MIDDLE)
callout(s, Inches(0.5), Inches(6.08), Inches(12.3), Inches(0.85),
        "不要用 typeof 做严谨类型判断。它只适合区分字符串、数字、函数这种大类。", 16)
notes(s, "null 那条点到原因即可，不讲引擎源码。\n"
         "有人写 typeof x === \"object\" 来排除 null，提醒数组也会进来。判断数组用 Array.isArray，口头一句。")

# ---------- 9 显式隐式 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "显式和隐式是同一套运算", n, TOTAL)
pairs = [
    (SOFT, SOFT_LINE, CYAN, "显式：你来调用",
     ["代码里写了函数名。", "Number()、String()、Boolean()。", "解析前缀用 parseInt(str, 10)。", "读代码就能看见转换。"]),
    (AMBER_BG, AMBER_LINE, AMBER, "隐式：语言来调用",
     ["没写函数名，求值时语言调用同一套。", "ToNumber：算术、一元 +、大小比较、位运算。", "ToString：有字符串的 +，模板字符串。", "ToBoolean：if、while、三元、!。", "== 另按两边类型配对，不单走上面某一条。"]),
]
for i, (fill, line, color, title, lines) in enumerate(pairs):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(1.18), Inches(6.15), Inches(4.2), fill, line)
    textbox(s, x + Inches(0.28), Inches(1.38), Inches(5.6), Inches(0.55), title, 22, color, True)
    write_lines(s, x + Inches(0.28), Inches(2.1), Inches(5.6), Inches(3.0), lines, 16, INK, before=4, after=4)
callout(s, Inches(0.5), Inches(5.58), Inches(12.3), Inches(1.25),
        "隐式不是另一套更宽松的规则。它只是你没写函数名。=== 不转换。", 18)
notes(s, "先拿掉「隐式更随便」。\n"
         "ToNumber 含 - * / % **、一元 -、++ --。大小比较只有两边不全是字符串时才转数字，两边都是字符串按码元比。\n"
         "位运算转完再收成 32 位整数。&& 和 || 只用真假选边，返回的仍是原来的值。\n"
         "if、&&、||、模板字符串躲不掉。要避开的是没打算转换时，靠运算符把值转掉。")

# ---------- 10 三条 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "三条转换，各留一个静默结果", n, TOTAL)
ways = [
    ("ToNumber", "算术、一元 +",
     ["'5' - 1   →  4", "Number(\"12px\")  →  NaN", "整段必须是数字。", "parseInt(\"12px\", 10) → 12", "这是读前缀，不是 ToNumber。"]),
    ("ToString", "+ 有字符串就拼接",
     ["'5' + 1   →  '51'", "String(null) → \"null\"", "不是空串。", "模板 ${x} 也走 ToString。"]),
    ("ToBoolean", "if、三元、!",
     ["假值只有六个：", "0   \"\"   null", "undefined   NaN   false", "if (\"0\") 会进。", "Boolean([]) 为 true。"]),
]
for i, (title, sub, lines) in enumerate(ways):
    x = Inches(0.42 + i * 4.28)
    rrect(s, x, Inches(1.16), Inches(4.12), Inches(4.35), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(1.32), Inches(3.72), Inches(0.4), title, 22, NAVY, True)
    textbox(s, x + Inches(0.2), Inches(1.76), Inches(3.72), Inches(0.36), sub, 14, CYAN, True)
    write_lines(s, x + Inches(0.2), Inches(2.25), Inches(3.72), Inches(3.0), lines, 15, INK, before=3, after=3)
callout(s, Inches(0.42), Inches(5.68), Inches(12.48), Inches(1.15),
        "ToBoolean(\"0\") 为真，ToNumber(\"0\") 为 0。两张表不能混。要数字用 Number()，解析前缀用 parseInt(str, 10)。", 16)
notes(s, "加号说完整：有一边是字符串，两边都 ToString 再拼接；否则按 ToNumber 做算术。\n"
         "现场打 '5'-1 和 '5'+1。parseInt 的第二个参数写 10。\n"
         "&& 和 || 不在这页展开返回值，口头补：它们返回被选中的原值，不是布尔。")

# ---------- 11 == ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "== 这条链不能顺着背", n, TOTAL)
rows = [
    ("0 == \"\"", "true", "数字和空串，先转换再比。"),
    ("0 == \"0\"", "true", "看起来还顺着。"),
    ("\"\" == \"0\"", "false", "两边已经是字符串，不再转数字。"),
    ("\"\" == false", "true", "另一对也为真，仍然组不成一条能背的规则。"),
]
for i, (expr, result, why) in enumerate(rows):
    y = Inches(1.16 + i * 1.15)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.05), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.2), Inches(3.3), Inches(0.65), expr, 22, NAVY, True,
            font="Consolas", ea="Microsoft YaHei", anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(4.15), y + Inches(0.2), Inches(1.5), Inches(0.65), result, 22, CYAN, True,
            font="Consolas", ea="Microsoft YaHei", anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(5.8), y + Inches(0.18), Inches(6.7), Inches(0.7), why, 18, INK, anchor=MSO_ANCHOR.MIDDLE)
callout(s, Inches(0.5), Inches(5.85), Inches(12.3), Inches(1.0),
        "默认永远用 ===。没有明确理由，不写 ==。=== 不转换。", 18)
notes(s, "先让他们猜 \"\" == \"0\"。多数人顺着前面两行说 true。\n"
         "== 按两边类型配对转换，不单走 ToNumber 或 ToString。不在这页背完整转换表。")

# ---------- 12 假值 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "条件里，六个假值以外都是真", n, TOTAL)
langs = [
    (AMBER_BG, AMBER_LINE, AMBER, "C++", "if (1) 合法，也直观。"),
    (AMBER_BG, AMBER_LINE, AMBER, "Java", "if (1) 直接编译错误。条件必须是 boolean。"),
    (SOFT, SOFT_LINE, CYAN, "JavaScript", "if (\"0\") 会进。\nif (\"false\") 也会进。"),
]
for i, (fill, line, color, title, desc) in enumerate(langs):
    x = Inches(0.45 + i * 4.28)
    rrect(s, x, Inches(1.18), Inches(4.12), Inches(2.35), fill, line)
    textbox(s, x + Inches(0.22), Inches(1.38), Inches(3.7), Inches(0.45), title, 22, color, True)
    write_lines(s, x + Inches(0.22), Inches(2.0), Inches(3.7), Inches(1.25), desc.split("\n"), 16, INK, before=2, after=2)
callout(s, Inches(0.45), Inches(3.75), Inches(12.45), Inches(1.35),
        "假值只有 0、\"\"、null、undefined、NaN、false。空数组、空对象、非空字符串都是真。", 18)
amber_bar(s, Inches(0.45), Inches(5.3), Inches(12.45), Inches(1.5),
          "这是从静态语言过来之后，最容易误判的条件分支。\nBoolean([]) 为 true。不要把「看起来空」当成假。", 18)
notes(s, "和上一页的 ToBoolean 接上，重点是跨语言对照，不再念运算符清单。\n"
         "口头补：空对象 {} 也是真。")

# ---------- 13 两个空 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "两个空，不是一种空", n, TOTAL)
cards = [
    ("undefined", "语言留下的空白",
     ["还没赋值。", "属性不存在。", "函数没有 return。", "先当「这里没放东西」来查。"]),
    ("null", "你放进去的空",
     ["调用方明确表示没有值。", "它是原始值。", "尽管 typeof 说它是 \"object\"。", "对外接口用它表示明确的空。"]),
]
for i, (title, sub, lines) in enumerate(cards):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(1.18), Inches(6.15), Inches(4.15), CARD, LINE)
    textbox(s, x + Inches(0.28), Inches(1.38), Inches(5.6), Inches(0.48), title, 26, NAVY, True)
    textbox(s, x + Inches(0.28), Inches(1.95), Inches(5.6), Inches(0.4), sub, 16, CYAN, True)
    write_lines(s, x + Inches(0.28), Inches(2.55), Inches(5.6), Inches(2.45), lines, 18, INK, before=4, after=4)
callout(s, Inches(0.5), Inches(5.55), Inches(12.3), Inches(1.28),
        "undefined == null 为 true，undefined === null 为 false。不要混用。内部承接语言行为，对外的空写 null。", 16)
notes(s, "JSON 里对象字段的 undefined 会被丢掉，那是第 3 次的事。这里只把两个空分开。")

# ---------- 14 浅拷贝 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "对象赋值复制的是引用", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.16), Inches(7.45), Inches(4.15),
          "const a = { x: 1, nested: { y: 1 } };\n"
          "const b = a;\n"
          "b.x = 2;          // a.x 也是 2\n"
          "\n"
          "const c = { ...a };\n"
          "c.x = 9;          // a.x 仍是 2\n"
          "c.nested.y = 9;   // a.nested.y 也是 9", 16)
rrect(s, Inches(8.1), Inches(1.16), Inches(4.75), Inches(4.15), AMBER_BG, AMBER_LINE)
write_lines(s, Inches(8.32), Inches(1.4), Inches(4.35), Inches(3.7),
            ["b 和 a 是同一份。", "这是引用共享。", "", "展开只拷这一层。", "嵌套对象仍共享。", "", "Object.assign 也只拷一层。", "数组 [...arr] 同样。"],
            16, INK, before=2, after=2)
callout(s, Inches(0.45), Inches(5.5), Inches(12.4), Inches(1.32),
        "const 只冻住标签。a = {} 抛 TypeError，a.x = 1 合法。Object.freeze 也只冻这一层，嵌套仍可改。", 16)
notes(s, "现场改三个赋值，每改一次打印 a。\n"
         "seal、preventExtensions 这页不演示，名字留到模块二。")

# ---------- 15 函数 ----------
s, n = new()
chrome(s, "模块一  ·  动态类型  ·  40 分钟", "函数是值，也是对象", n, TOTAL)
codeblock(s, Inches(0.5), Inches(1.16), Inches(12.3), Inches(2.55),
          "function add(x) { return x + 1; }\n"
          "const f = add;            // 函数是值\n"
          "f.label = \"inc\";          // 函数是对象\n"
          "function make(n) {\n"
          "  return () => n;         // 带走定义时的绑定\n"
          "}", 18)
bits = [
    ("可以赋值", "赋给变量，或当作参数交出去。"),
    ("可以挂属性", "所以才有 call、apply、bind。"),
    ("可以返回", "返回的函数还看得见定义时的变量。"),
]
for i, (title, desc) in enumerate(bits):
    x = Inches(0.5 + i * 4.25)
    rrect(s, x, Inches(3.9), Inches(4.08), Inches(1.45), CARD, LINE)
    textbox(s, x + Inches(0.2), Inches(4.05), Inches(3.7), Inches(0.38), title, 18, CYAN, True)
    textbox(s, x + Inches(0.2), Inches(4.48), Inches(3.7), Inches(0.7), desc, 15, INK)
callout(s, Inches(0.5), Inches(5.55), Inches(12.3), Inches(1.28),
        "下一模块的闭包就是这件事。this 随这次调用变化，不在本模块展开。", 18)
notes(s, "不要在这里讲 this 的规则。有人问，回答第 2 次，例子是 setTimeout(obj.method)。")

# ---------- 16 模块二对照 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "var 的花括号是装饰", n, TOTAL)
cols = [
    (AMBER_BG, AMBER_LINE, AMBER, "C++ / Java",
     ["花括号创造块级作用域。", "进入一块，绑定是新的。", "C++ lambda 要写明捕获。", "Java lambda 捕获的变量必须 effectively final。"]),
    (SOFT, SOFT_LINE, CYAN, "JavaScript 的 var",
     ["if / for 的花括号不产生新绑定。", "var 只认函数边界。", "闭包不写也会记住。", "记住的是那一个变量，不是一份拷贝。"]),
]
for i, (fill, line, color, title, lines) in enumerate(cols):
    x = Inches(0.45 + i * 6.45)
    rrect(s, x, Inches(1.18), Inches(6.25), Inches(4.15), fill, line)
    textbox(s, x + Inches(0.28), Inches(1.4), Inches(5.7), Inches(0.5), title, 24, color, True)
    write_lines(s, x + Inches(0.28), Inches(2.15), Inches(5.7), Inches(2.85), lines, 18, INK, before=6, after=6)
callout(s, Inches(0.45), Inches(5.52), Inches(12.45), Inches(1.32),
        "左边：你得写明捕获什么。右边：不写也会记住，而且记住的是那一个变量。三个回调共享同一个 i，都打印 3。", 16)
notes(s, "新代码不用 var。这里用它，是因为老代码还在，而且这个反差靠它才看得见。\n"
         "let / const 的块级作用域更接近他们的直觉，先把差异演出来。")

# ---------- 17 词法作用域 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "变量看定义处，不看调用处", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.16), Inches(7.55), Inches(3.55),
          "let x = \"定义处\";\n"
          "function show() {\n"
          "  console.log(x);\n"
          "}\n"
          "function caller() {\n"
          "  let x = \"调用处\";\n"
          "  show();\n"
          "}", 18)
rrect(s, Inches(8.2), Inches(1.16), Inches(4.65), Inches(3.55), SOFT, SOFT_LINE)
textbox(s, Inches(8.42), Inches(1.36), Inches(4.25), Inches(0.4), "打印", 14, CYAN, True)
textbox(s, Inches(8.42), Inches(1.85), Inches(4.25), Inches(0.7), "定义处", 32, NAVY, True)
textbox(s, Inches(8.42), Inches(2.7), Inches(4.25), Inches(1.7),
        "show 写在外层，就绑定外层的 x。在哪调用，不改变这件事。", 16, INK)
callout(s, Inches(0.45), Inches(4.9), Inches(12.4), Inches(1.9),
        "这和 C++ / Java 的名字解析一样：写在哪就绑哪。区别是报错时机。\n"
        "JS 找不到名字，是运行时 ReferenceError，不是编译失败。如果是动态作用域，show() 会读到 caller() 里的 x。JS 不是。", 16)
notes(s, "先问：caller() 里打印什么。停一下再揭晓。\n"
         "动态作用域只作反例锚点，不展开别的语言。")

# ---------- 18 作用域链 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "从内往外找，同名就停", n, TOTAL)
chain = ["当前作用域", "外层，一层层", "全局"]
for i, label in enumerate(chain):
    y = Inches(1.18 + i * 1.15)
    rrect(s, Inches(0.5), y, Inches(4.5), Inches(0.95), SOFT if i == 0 else CARD, SOFT_LINE if i == 0 else LINE)
    textbox(s, Inches(0.72), y + Inches(0.22), Inches(4.1), Inches(0.52), label, 20, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
rules = [
    ("遮蔽", "内层 let / const 同名，挡住外层。外层那个不受影响。"),
    ("别和 this 混", "this 看调用点。作用域链看定义点。"),
    ("隐式全局", "未声明就赋值，非严格模式挂到全局。严格模式直接 ReferenceError。"),
]
for i, (title, desc) in enumerate(rules):
    y = Inches(1.18 + i * 1.15)
    rrect(s, Inches(5.25), y, Inches(7.55), Inches(0.95), CARD, LINE)
    textbox(s, Inches(5.48), y + Inches(0.1), Inches(7.1), Inches(0.32), title, 16, CYAN, True)
    textbox(s, Inches(5.48), y + Inches(0.44), Inches(7.1), Inches(0.42), desc, 14, INK)
callout(s, Inches(0.5), Inches(4.75), Inches(12.3), Inches(2.05),
        "闭包 = 函数 + 它定义时那条作用域链。外层变量还能读到，是因为这条链还连着。\n"
        "typeof 对没声明的名字不报错，返回 \"undefined\"，会把「没声明」伪装成「值是 undefined」。\n"
        "找不到就是 ReferenceError。不要靠隐式全局补救。", 16)
notes(s, "严格模式包括 ES 模块、class 内部、以及文件顶上的 \"use strict\"。\n"
         "这页把系统概念说完。下一页才进循环陷阱。")

# ---------- 19 先写 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "先写下三行输出", n, TOTAL)
codeblock(s, Inches(0.5), Inches(1.25), Inches(12.3), Inches(2.55),
          "for (var i = 0; i < 3; i++) {\n"
          "  setTimeout(() => console.log(i));\n"
          "}", 26)
amber_bar(s, Inches(0.5), Inches(4.1), Inches(12.3), Inches(1.25),
          "输出是三行。把三行写下来，先别跑。", 22)
callout(s, Inches(0.5), Inches(5.6), Inches(12.3), Inches(1.22),
        "问的是三次打印的 i 各是多少。setTimeout 在这里只表示：回调会在循环结束之后才跑。", 17)
notes(s, "停两分钟。常见猜测是 0 1 2。先不要评价。\n"
         "不要借这页讲宏任务。回调晚跑这一句够用。")

# ---------- 20 结果 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "三个回调共享同一个 i", n, TOTAL)
cols = [
    (AMBER_BG, AMBER_LINE, AMBER, "var", "3\n3\n3", "只有一个 i。回调跑的时候，它已经是 3。"),
    (SOFT, SOFT_LINE, CYAN, "改成 let", "0\n1\n2", "for 每次迭代一个新绑定。回调记住的是当次那个。"),
]
for i, (fill, line, color, title, nums, why) in enumerate(cols):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(1.18), Inches(6.15), Inches(5.6), fill, line)
    textbox(s, x + Inches(0.3), Inches(1.4), Inches(5.55), Inches(0.45), title, 22, color, True)
    textbox(s, x + Inches(0.3), Inches(2.05), Inches(5.55), Inches(2.5), nums, 42, NAVY, True,
            font="Consolas", ea="Microsoft YaHei")
    textbox(s, x + Inches(0.3), Inches(4.85), Inches(5.55), Inches(1.5), why, 20, INK)
notes(s, "两种都要现场跑。\n"
         "口播：闭包记住的不是那一次的数字，是名叫 i 的那个变量。var 只有一个。\n"
         "let 在 for 的每次迭代新建绑定。这是 for 的特殊行为，今天不展开规范。")

# ---------- 21 提升 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "声明可以先看见，赋值不会", n, TOTAL)
cols = [
    ("var x", "console.log(x);\nvar x = 1;", "undefined",
     "声明被抬到函数顶部。赋值留在原地。读到的是语言留下的空，不是报错。"),
    ("let / const", "console.log(y);\nlet y = 1;", "ReferenceError",
     "声明之前是暂时性死区。更接近静态语言的直觉，但要跑到那一行才报。"),
]
for i, (title, code, result, why) in enumerate(cols):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(1.16), Inches(6.15), Inches(5.6), CARD, LINE)
    textbox(s, x + Inches(0.25), Inches(1.35), Inches(5.65), Inches(0.4), title, 20, CYAN, True)
    codeblock(s, x + Inches(0.25), Inches(1.9), Inches(5.65), Inches(1.45), code, 20)
    textbox(s, x + Inches(0.25), Inches(3.55), Inches(5.65), Inches(0.6), result, 26, NAVY, True,
            font="Consolas", ea="Microsoft YaHei")
    textbox(s, x + Inches(0.25), Inches(4.35), Inches(5.65), Inches(2.05), why, 18, INK)
notes(s, "函数声明整段提升今天不单开。\n"
         "报错是 ReferenceError，不是 undefined。两边都是运行时。")

# ---------- 22 闭包 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "闭包记住的是绑定", n, TOTAL)
textbox(s, Inches(0.5), Inches(1.16), Inches(12.3), Inches(0.85),
        "三个函数值都指着同一个 i，不是各抄走一个数字。循环陷阱是共享绑定，不是「记住了旧值」。",
        20, INK)
uses = [
    (SOFT, SOFT_LINE, CYAN_DEEP, "可以拿来用", "私有状态、模块模式、柯里化。函数把定义时看见的变量一起带走。"),
    (AMBER_BG, AMBER_LINE, AMBER, "也会钉住内存", "定时器、事件监听、缓存如果还指着大对象，函数活着，对象就收不走。"),
]
for i, (fill, line, color, title, desc) in enumerate(uses):
    x = Inches(0.5 + i * 6.4)
    rrect(s, x, Inches(2.2), Inches(6.15), Inches(2.05), fill, line)
    textbox(s, x + Inches(0.28), Inches(2.4), Inches(5.6), Inches(0.42), title, 20, color, True)
    textbox(s, x + Inches(0.28), Inches(2.95), Inches(5.6), Inches(1.05), desc, 16, INK)
callout(s, Inches(0.5), Inches(4.5), Inches(12.3), Inches(2.25),
        "需要每次迭代各留一份：用 let，或写工厂函数把当次的值当参数传进去。\n"
        "function make(i) { return () => console.log(i); }\n"
        "闭包不是魔法，是函数记住了它定义时的作用域。", 17)
notes(s, "工厂函数只给形状。循环里是 setTimeout(make(i))。\n"
         "内存这句对上监听没卸、定时器没清。不讲堆快照。")

# ---------- 23 const ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "const 只冻绑定，不冻值", n, TOTAL)
rows = [
    ("绑定", "const obj = {} 之后，obj.x = 1 合法。obj = {} 抛 TypeError。"),
    ("浅冻结", "Object.freeze 只冻这一层。嵌套对象仍可改。深冻结要递归，或用库。"),
    ("只记名字", "seal 禁止增删、允许改值。preventExtensions 只禁止新增。描述符有 writable、enumerable、configurable。"),
]
for i, (title, desc) in enumerate(rows):
    y = Inches(1.18 + i * 1.4)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.25), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.28), Inches(2.15), Inches(0.7), title, 20, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(3.05), y + Inches(0.22), Inches(9.4), Inches(0.82), desc, 16, INK, anchor=MSO_ANCHOR.MIDDLE)
callout(s, Inches(0.5), Inches(5.5), Inches(12.3), Inches(1.32),
        "Java 的 final 如果指向对象，对象内容同样可变，但有 unmodifiable 之类的包装。JS 没有编译期约束，全靠运行时 API 和约定。", 16)
notes(s, "浅拷贝那页已经见过嵌套穿透。这页把 freeze、seal、preventExtensions 的名字对齐，不重新演示。\n"
         "Object.defineProperty 只提能精细控制，不写描述符代码。")

# ---------- 24 声明 ----------
s, n = new()
chrome(s, "模块二  ·  作用域与闭包  ·  35 分钟", "新代码默认 const", n, TOTAL)
rules3 = [
    ("const", "默认用它。绑定本身不需要换成另一个值。"),
    ("let", "只在这个绑定需要重新赋值时用。"),
    ("var", "不要再用。花括号拦不住它。"),
]
for i, (title, desc) in enumerate(rules3):
    y = Inches(1.2 + i * 1.3)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.15), CARD, LINE)
    textbox(s, Inches(0.78), y + Inches(0.25), Inches(2.2), Inches(0.65), title, 26, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(3.15), y + Inches(0.25), Inches(9.3), Inches(0.65), desc, 20, INK, anchor=MSO_ANCHOR.MIDDLE)
callout(s, Inches(0.5), Inches(5.25), Inches(12.3), Inches(1.55),
        "const 不冻对象内容，前面已经见过。\narguments 是类数组，箭头函数没有它。剩余参数 ...args 是真数组。新代码用剩余参数。", 17)
notes(s, "有人把 const 理解成 C++ 的 const 或深冻结，指回上一页。")

# ---------- 25 收束 ----------
s, n = new()
chrome(s, "收束  ·  7 分钟", "两张对照图，各复述一句", n, TOTAL)
lines = [
    ("1", "值没有类型盒子。错了往往不抛，\n而是算出一个还能往下用的值。比较默认用 ===。"),
    ("2", "var 的花括号是装饰。闭包记住的是绑定，\n所以三个回调都是 3。const 只冻绑定。"),
]
for i, (no, sentence) in enumerate(lines):
    y = Inches(1.3 + i * 2.15)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.95), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.5), Inches(0.8), Inches(0.9), no, 32, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    write_lines(s, Inches(1.75), y + Inches(0.4), Inches(10.7), Inches(1.2),
                sentence.split("\n"), 22, NAVY, True, before=2, after=2, anchor=MSO_ANCHOR.MIDDLE)
callout(s, Inches(0.5), Inches(5.75), Inches(12.3), Inches(1.08),
        "让两个人各说一句。说的时候指回模块一、模块二的对照，不新开话题。", 18)
notes(s, "第一句要能说出 '5' + 1 为什么是 '51'，以及为什么默认不用 ==。\n"
         "第二句要能说出三个 3 是三个函数值共享同一个 i，而且 const obj.x = 1 为什么合法。")

# ---------- 26 口袋 ----------
s, n = new()
chrome(s, "收束  ·  7 分钟", "今天可以带走的", n, TOTAL)
rules = [
    ("标签", "类型在值上。错了往往不崩，而是算出还能用的值。"),
    ("typeof", "typeof null 是历史坑。null 仍是原始值。"),
    ("转换", "要数字用 Number()。解析前缀用 parseInt(str, 10)。"),
    ("比较", "默认 ===。六个假值以外，条件都当真。"),
    ("两个空", "undefined 是语言留下的。对外的空用 null。"),
    ("引用", "展开只拷一层。const 只冻绑定。"),
    ("定义处", "变量看写在哪。var 不认花括号。"),
    ("闭包", "记住的是绑定，不是当时的值。"),
]
for i, (name, desc) in enumerate(rules):
    col = i % 2
    row = i // 2
    x = Inches(0.45 + col * 6.45)
    y = Inches(1.16 + row * 1.42)
    rrect(s, x, y, Inches(6.25), Inches(1.28), CARD, LINE)
    textbox(s, x + Inches(0.22), y + Inches(0.12), Inches(5.85), Inches(0.34), name, 16, CYAN, True)
    textbox(s, x + Inches(0.22), y + Inches(0.5), Inches(5.85), Inches(0.64), desc, 15, INK)
notes(s, "这是今天的口袋，不是全课速查。全课速查在第 3 次结尾。时间不够就只留上一页两句。")

assert page == TOTAL, page

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

out = r"D:\文档\training\第1次-值和作用域.pptx"
try:
    prs.save(out)
except PermissionError:
    out = r"D:\文档\training\第1次-值和作用域-本版.pptx"
    prs.save(out)
print(f"saved {out} slides={page}")
if problems:
    print("OVERFLOW")
    print("\n".join(problems))
else:
    print("bounds ok")
