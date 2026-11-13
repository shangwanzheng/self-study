# -*- coding: utf-8 -*-
"""第 2 次 PPT。this、原型、事件循环。数字、JSON、模块在第 3 次。"""
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
prs.core_properties.title = "当你的直觉开始骗你 · 第 2 次"
prs.core_properties.subject = "this、原型、事件循环"
BLANK = prs.slide_layouts[6]
FOOTER = "当你的直觉开始骗你  ·  第 2 次  ·  约 95 分钟"


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


TOTAL = 27
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
        "第 2 次  ·  this、原型、事件循环\n约 95 分钟。承接第 1 次：值是标签，var 的花括号是装饰。",
        18, RGBColor(0xC5, 0xD4, 0xE0))
chips = [
    ("先记住", "this 看调用点。\n属性沿原型找。\n异步是排队。"),
    ("今天三块", "this 约 25 分钟。\n原型约 20 分钟。\n事件循环约 40 分钟。"),
    ("第 3 次再讲", "数字和 sort。\nJSON 会丢字段。\n模块、日期、正则。"),
]
for i, (a, b) in enumerate(chips):
    x = Inches(0.75 + i * 4.05)
    rrect(s, x, Inches(3.7), Inches(3.85), Inches(2.35), RGBColor(0x14, 0x32, 0x4C))
    textbox(s, x + Inches(0.24), Inches(3.88), Inches(3.4), Inches(0.36), a, 14, CYAN, True)
    textbox(s, x + Inches(0.24), Inches(4.36), Inches(3.4), Inches(1.45), b, 16, WHITE)
notes(s, "第 1 次已经讲过类型和作用域。这页不要重讲 === 和 var 循环。\n"
         "数字、sort、JSON、模块、日期、正则明确说留到第 3 次，今天不展开。")

# 2 时间
s, n = new()
chrome(s, "开场", "今天按这个顺序走", n, TOTAL)
steps = [
    ("25′", "this", "只问调用点前面有没有点号。四行对照表对上 Java 和 C++。"),
    ("20′", "原型", "沿链找。new 的四步。class 仍是委托，不是另一套继承。"),
    ("40′", "事件循环", "先猜 1 4 3 2。try/catch 抓不住回调里的抛出。"),
    ("10′", "收束", "六句话复述。练习只标这三块，不对答案。"),
]
for i, (tm, title, desc) in enumerate(steps):
    col, row = i % 2, i // 2
    x = Inches(0.45 + col * 6.45)
    y = Inches(1.25 + row * 2.85)
    rrect(s, x, y, Inches(6.25), Inches(2.6), CARD, LINE)
    textbox(s, x + Inches(0.28), y + Inches(0.28), Inches(5.7), Inches(0.45), tm, 22, CYAN, True)
    textbox(s, x + Inches(0.28), y + Inches(0.85), Inches(5.7), Inches(0.5), title, 26, NAVY, True)
    textbox(s, x + Inches(0.28), y + Inches(1.5), Inches(5.7), Inches(0.8), desc, 16, INK)
notes(s, "时间紧时：this 留丢失回调和对照表；原型留查找链、new 四步和「class 仍是委托」；\n"
         "异步留预测题、微任务先清空、try/catch。ES5 继承和八行继承表可以只指三格。\n"
         "数字、JSON、模块不要临时加进来。")

# 3 this 对照
s, n = new()
chrome(s, "this  ·  25 分钟", "this 看这一次怎么调用", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.35), "amber", "C++ / Java",
      ["实例方法里的 this 写死在这个对象上。", "把方法交出去，接收者还在。", "Java 的方法引用不会丢掉调用对象。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.35), "soft", "JavaScript",
      ["这次调用前面有点号吗？", "有：this 通常是点号前面的对象。", "没有：再看是不是箭头函数、bind 或 new。", "都不是：严格模式下是 undefined。"], 18)
callout(s, Inches(0.45), Inches(5.65), Inches(12.45), Inches(1.2),
        "不要背四条优先级。反复问：这个函数被调用时，前面有点号吗？", 18)
notes(s, "优先级若有人追问：new，然后 bind / call / apply，然后 obj.fn()，最后默认绑定。\n"
         "图上的提问顺序是课堂用的，和规范优先级不完全同一句话，不要在白板上写「优先级表」。\n"
         "下一页用表把这四件事对上 Java 和 C++。")

# 4 this 对照表
s, n = new()
chrome(s, "this  ·  25 分钟", "四件事，不要和 Java 记成一样", n, TOTAL)
rows = [
    ["", "JavaScript", "Java / C++"],
    ["谁决定", "调用形态决定\nobj.m()、m()、call、new", "成员调用时的那个对象"],
    ["自由函数有 this 吗", "普通函数也可以有\n默认全局，严格模式是 undefined", "非实例方法一般没有"],
    ["借给别人当接收者", "call / bind 很常见", "日常基本不这么做"],
    ["箭头 / lambda", "箭头继承外层的 this", "Java lambda 不另造 this\nC++ 要显式写 [this]"],
]
table_shape = s.shapes.add_table(len(rows), 3, Inches(0.4), Inches(1.12), Inches(12.55), Inches(5.9))
table = table_shape.table
table.columns[0].width = Inches(2.55)
table.columns[1].width = Inches(5.0)
table.columns[2].width = Inches(5.0)
table.rows[0].height = Inches(0.58)
for r in range(1, len(rows)):
    table.rows[r].height = Inches(1.33)
for r, row in enumerate(rows):
    for c, text in enumerate(row):
        if r == 0:
            fill, color, bold, size = NAVY, WHITE, True, 18
        elif c == 0:
            fill, color, bold, size = CARD, CYAN_DEEP, True, 16
        elif c == 1:
            fill, color, bold, size = SOFT, INK, False, 18
        else:
            fill, color, bold, size = WHITE, INK, False, 18
        shade_cell(table.cell(r, c), fill, text.split("\n"), size, color, bold)
notes(s, "四行分别对应后面两页：丢失 this 是第一行和第三行，箭头函数是第四行。\n"
         "Java 的方法引用、C++ 的成员函数指针，接收者还在。JS 把函数值拿出来，接收者就没了。\n"
         "C++ 的 [this] 只点到为止，不讲捕获列表。")

# 5 丢失 this
s, n = new()
chrome(s, "this  ·  25 分钟", "点号没了，this 就丢了", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(7.5), Inches(3.15),
          "const obj = {\n  name: 'cs',\n  hi() { return this.name },\n}\nsetTimeout(obj.hi, 100)", 18)
panel(s, Inches(8.15), Inches(1.15), Inches(4.7), Inches(3.15), "card", "两种修法",
      ["箭头函数包一层，调用时点号还在。", "或事先 obj.hi.bind(obj)。", "不要再发明第三种。"], 16)
callout(s, Inches(0.45), Inches(4.5), Inches(12.4), Inches(2.3),
        "obj.hi() 得到 'cs'。单独把 obj.hi 递进定时器，调用时前面没有点号。\n"
        "非严格模式下 this 会落到全局对象；严格模式下是 undefined，读 .name 会抛。", 18)
notes(s, "现场可以先跑 obj.hi()，再跑 const fn = obj.hi; fn()。setTimeout 只是同一件事的工程外形。")

# 5 箭头
s, n = new()
chrome(s, "this  ·  25 分钟", "箭头函数没有自己的 this", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.5), "soft", "写回调，通常用箭头",
      ["它捕获的是定义处外层的 this。", "定时器、Promise、事件回调里，这样能绕开丢失。", "外层是谁，里面就是谁。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.5), "rose", "不要用箭头写对象方法",
      ["对象字面量里的箭头没有「这个对象」。", "this 不会指向该对象。", "方法仍写成普通函数，调用时靠点号。"], 18)
callout(s, Inches(0.45), Inches(5.85), Inches(12.45), Inches(1.0),
        "解药和特例是同一条规则：箭头函数的 this 在定义时就定了，不看这次谁调用。", 17)
notes(s, "不要展开 arguments。第 1 次已经说过剩余参数。")

# 6 原型对照
s, n = new()
chrome(s, "原型  ·  20 分钟", "Java 编译期定好，JS 运行时往上找", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(5.3), Inches(1.8), "amber", "Java",
      ["class 声明继承。", "继承关系不能在运行时改。", "调用走方法表。"], 16)
panel(s, Inches(0.45), Inches(3.1), Inches(5.3), Inches(2.75), "soft", "JavaScript",
      ["先看对象自己有没有这个名字。", "没有，就沿内部原型找上一层。", "直到 null。", "运行时可以增删，前后结果可以不同。"], 16)
callout(s, Inches(0.45), Inches(6.0), Inches(5.3), Inches(1.05),
        "空对象不空：链的底是 Object.prototype，上面有 toString、hasOwnProperty。字典用 Map，不要用 {}。", 15)
rrect(s, Inches(5.95), Inches(1.15), Inches(6.95), Inches(5.9), CARD, LINE)
s.shapes.add_picture(r"D:\文档\training\第2次素材\原型链示意图.png", Inches(6.1), Inches(1.3), width=Inches(6.65))
notes(s, "这 20 分钟的目标是三句：沿链找、别漏 new、字典用 Map。ES5 继承和 class 是把这三句对上写法。\n"
         "右图读法：实线箭头 __proto__ 是内部原型链接，沿它往上找属性；constructor 是普通属性，指回构造函数。\n"
         "图里用的 __proto__ 只为画图方便；代码里读取用 Object.getPrototypeOf(obj)，对照表后面讲两个名字时对上。\n"
         "顶端 Object 原型对象的 __proto__ 指向 null，这就是查找的终点。")

# 7 继承对照表
s, n = new()
chrome(s, "原型  ·  20 分钟", "底下是对象委托，class 只是糖", n, TOTAL)
rows = [
    ["", "JavaScript", "Java", "C++"],
    ["继承落在谁", "对象沿内部原型委托\n类只是语法糖", "类继承类\nextends", "类继承类\n另有多重继承"],
    ["方法在哪", "多在 .prototype 上\n实例共享这一张桌", "在类里\n虚方法走方法表", "非虚按类型\n虚函数靠 vtable"],
    ["查找时机", "运行时\n顺着原型链找", "编译期定成员\n虚调用运行时派发", "编译期定\n虚函数运行时派发"],
    ["类型系统", "动态\ninstanceof 查原型链", "静态类型\n另有运行时 instanceof", "静态类型\nRTTI / dynamic_cast"],
    ["多继承", "只有一条原型链\n混入靠拷贝，不是多父类", "单类继承\n外加多个接口", "可多类继承\n菱形要用虚基类"],
    ["接口 / 抽象", "鸭子类型\n抽象 class 只是约定", "interface / abstract\n是一等公民", "纯虚类当接口"],
    ["改父", "可以 Object.create\n改内部原型，不推荐", "类层次\n编译后固定", "类层次\n编译后固定"],
    ["无类对象", "{} 很常见\n也可 Object.create", "几乎一切\n实例都有类", "对象都有类型\n也有不走继承的组合"],
]
table_shape = s.shapes.add_table(len(rows), 4, Inches(0.35), Inches(1.08), Inches(12.65), Inches(5.95))
table = table_shape.table
table.columns[0].width = Inches(1.85)
table.columns[1].width = Inches(3.7)
table.columns[2].width = Inches(3.55)
table.columns[3].width = Inches(3.55)
table.rows[0].height = Inches(0.42)
for r in range(1, len(rows)):
    table.rows[r].height = Inches(0.691)
for r, row in enumerate(rows):
    for c, text in enumerate(row):
        if r == 0:
            fill, color, bold, size = NAVY, WHITE, True, 14
        elif c == 0:
            fill, color, bold, size = CARD, CYAN_DEEP, True, 13
        elif c == 1:
            fill, color, bold, size = SOFT, INK, False, 13
        else:
            fill, color, bold, size = WHITE, INK, False, 13
        shade_cell(table.cell(r, c), fill, text.split("\n"), size, color, bold)
notes(s, "一句带过，不要逐格念。Java / C++ 主要是类继承加编译期类型；JS 底层是对象委托，class 只是糖。\n"
         "时间紧就指三格：方法在 .prototype、instanceof 走链、改内部原型不推荐。\n"
         "混入、vtable、虚基类、RTTI 都不展开。")

# 8 心智对照
s, n = new()
chrome(s, "原型  ·  20 分钟", "看起来像继承，本质是链接委托", n, TOTAL)
panel(s, Inches(0.4), Inches(1.12), Inches(6.2), Inches(2.05), "amber", "Java / C++",
      ["Dog 是一种 Animal。", "is-a，关系写在类层次上。"], 18)
panel(s, Inches(6.75), Inches(1.12), Inches(6.2), Inches(2.05), "soft", "JavaScript",
      ["dog 委托到 animalProto。", "看起来像继承，本质是链接委托。"], 18)
points = [
    ("写 class 时", ["表面像 Java。跑起来仍是这条链：", "child → Child.prototype → Parent.prototype → Object.prototype → null"]),
    ("换父", ["Java / C++ 编译后就固定。", "JS 理论上能改链，实战在创建时定好。"]),
    ("原型不管的", ["多继承、public / private、析构顺序。", "封装靠约定、闭包、模块。"]),
]
for i, (title, body) in enumerate(points):
    y = Inches(3.35 + i * 1.22)
    rrect(s, Inches(0.4), y, Inches(12.55), Inches(1.12), CARD, LINE)
    textbox(s, Inches(0.62), y + Inches(0.16), Inches(2.15), Inches(0.8), title, 18, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    write_lines(s, Inches(2.9), y + Inches(0.14), Inches(9.8), Inches(0.84), body, 16, INK, before=1, after=1, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "指着链读一遍即可。下一页再把 [[Prototype]] 和 Fn.prototype 这两个名字拆开。\n"
         "不要把「实战在创建时定好」说成语言禁止改链。Object.setPrototypeOf 做得到，只是不推荐。")

# 9 两个名字
s, n = new()
chrome(s, "原型  ·  20 分钟", "两个名字，不要看成一个", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(5.65), "soft", "[[Prototype]] 在实例上",
      ["每个对象内部有一条。", "读属性时顺着它往上找。", "Object.getPrototypeOf(obj) 看到的就是它。", "实例上通常没有 .prototype 这个字段。", "去实例上找 .prototype，得到 undefined。"], 17)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(5.65), "card", "Fn.prototype 在函数上",
      ["函数对象上的一个普通属性。", "new Fn() 时，新对象的内部原型被设成它。", "它是所有实例共用的方法桌。", "不是「这个函数的父类」。", "Java 的方法表放在类上；这里放在这张桌上。"], 17)
notes(s, "口误时最容易把两个名字说反。指着左边说「找属性」，指着右边说「new 时接上的那张桌」。")

# 8 new 四步
s, n = new()
chrome(s, "原型  ·  20 分钟", "new 做四件事", n, TOTAL)
steps = [
    ("1", "造一个新对象"),
    ("2", "内部原型设为 Fn.prototype"),
    ("3", "用这个新对象当 this 调用 Fn"),
    ("4", "Fn 若返回对象，就用那个；否则用新对象"),
]
for i, (no, text) in enumerate(steps):
    y = Inches(1.15 + i * 1.2)
    rrect(s, Inches(0.5), y, Inches(12.3), Inches(1.08), CARD, LINE)
    textbox(s, Inches(0.75), y + Inches(0.22), Inches(0.7), Inches(0.6), no, 26, CYAN, True)
    textbox(s, Inches(1.7), y + Inches(0.28), Inches(10.6), Inches(0.55), text, 22, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "第 2 步：若 Fn.prototype 不是对象，则用 Object.prototype。课堂不必展开。\n"
         "第 4 步是「返回了对象才替换」。返回数字、字符串不会替换新对象。")

# 9 方法与漏 new
s, n = new()
chrome(s, "原型  ·  20 分钟", "方法放共享的桌上，别漏 new", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.4), "soft", "方法挂在哪",
      ["挂在 Fn.prototype 上，实例只留数据。", "写成 this.method = ... 会每个实例拷一份。", "Fn.staticLike = 1 在函数身上，实例找不到。", "constructor 默认指回 Fn。new 不读它。"], 16)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.4), "rose", "忘了 new",
      ["普通函数、非严格模式：this 落到全局，调用像成功了。", "class 不用 new：直接抛错。", "两句不要并成一句。"], 16)
callout(s, Inches(0.45), Inches(5.75), Inches(12.45), Inches(1.1),
        "改掉 Fn.prototype.constructor，new Fn() 仍用你写下的那个函数。", 17)
notes(s, "constructor 是普通属性。instanceof 也不看它，下一页再说。")

# 10 ES5
s, n = new()
chrome(s, "原型  ·  20 分钟", "ES5 继承要做两件事", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(7.7), Inches(3.55),
          "function Child(name) {\n  Parent.call(this, name)\n}\nChild.prototype =\n  Object.create(Parent.prototype)\nChild.prototype.constructor = Child", 16)
panel(s, Inches(8.35), Inches(1.15), Inches(4.5), Inches(3.55), "card", "缺一不可",
      ["Object.create：查找链接到父原型。", "Parent.call(this)：初始化跑在这个对象上。", "写回 constructor，不影响 new。"], 15)
callout(s, Inches(0.45), Inches(4.9), Inches(12.4), Inches(1.9),
        "instanceof 看的是右边函数的 .prototype 在不在左边的内部原型链上，不看 constructor。\n"
        "Java 的 extends 在编译期定好。这里漏接，代码仍能跑，只是方法找不到。", 16)
notes(s, "时间紧可以只指代码两行，不讲 constructor 写回。")

# 11 不要 new Parent
s, n = new()
chrome(s, "原型  ·  20 分钟", "不要用 new Parent() 当原型", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.5), "rose", "Child.prototype = new Parent()",
      ["父构造函数会真的跑一遍。", "父实例上的数据字段变成原型属性。", "所有子实例共享那一份数据。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.5), "soft", "Object.create(Parent.prototype)",
      ["只接查找链，不跑父构造函数。", "父的初始化仍由 Parent.call(this) 负责。", "数据留在每个实例上。"], 18)
callout(s, Inches(0.45), Inches(5.85), Inches(12.45), Inches(1.0),
        "共享的是方法桌，不是某一份父实例。", 18)
notes(s, "这是 ES5 继承最常见的静默错误。可以举 name 字段被所有子实例一起改掉。")

# 12 class
s, n = new()
chrome(s, "原型  ·  20 分钟", "class 仍是这套，extends 接两条链", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.45), "card", "实例方法那条",
      ["方法放在 .prototype 上，默认不可枚举。", "extends 把子原型的内部链接到父原型。", "派生构造里，用 this 之前必须先 super(...)。", "这是语法规定，不是静默算错。"], 16)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.45), "soft", "静态方法那条",
      ["子构造函数的内部原型接到父构造函数。", "静态方法靠这条链找到。", "#private 是真私有，类外和子类都看不见。", "底下仍能改原型。instanceof 还是走链。"], 16)
callout(s, Inches(0.45), Inches(5.8), Inches(12.45), Inches(1.05),
        "看一段 class：指出方法在哪张桌上，extends 接了哪两条链。", 17)
notes(s, "new.target、static 块只在有人问时说：new.target 是真正被 new 的那个构造函数。")

# 13 线程对照
s, n = new()
chrome(s, "异步  ·  40 分钟", "多条栈，还是一条栈加队列", n, TOTAL)
panel(s, Inches(0.45), Inches(1.15), Inches(6.15), Inches(4.35), "amber", "C++ / Java",
      ["多个任务可以同时在多条线程上跑。", "每条线程有自己的调用栈。", "用锁、join 或 Future 等结果。"], 18)
panel(s, Inches(6.75), Inches(1.15), Inches(6.15), Inches(4.35), "soft", "页面上的 JavaScript",
      ["跑 JS 的栈只有这一条。", "栈空了，才从队列取一个任务。", "取到的回调又压回这条栈。", "多出来的是队列，不是第二条 JS 栈。"], 18)
callout(s, Inches(0.45), Inches(5.7), Inches(12.45), Inches(1.15),
        "计时器到点、网络收包可以发生在浏览器自己的线程里。回调里的 JS 仍回到这条栈。", 17)
notes(s, "不要说「JS 完全没有线程」。Worker 有自己的栈，但碰不到页面 DOM。本页只讲页面主线程。\n"
         "下一页把这条队列对上 Java 和 C++ 里他们已经用过的名字，不展开 Netty 或 epoll。")

# 14 三种语言的事件循环对照
s, n = new()
chrome(s, "异步  ·  40 分钟", "同一件事，三种语言各叫什么", n, TOTAL)
rows = [
    ["", "JavaScript", "Java", "C++"],
    ["谁在 loop", "浏览器，或 Node + libuv\n循环由宿主来转", "你选的框架，或自己写", "你选的库，或自己写"],
    ["事件队列", "宏任务 + 微任务", "Looper / Handler\nSwing EDT、Netty", "Qt 事件循环\nGUI 的 message pump"],
    ["异步 I/O", "宿主已经封装好", "NIO Selector、Netty", "epoll / kqueue、Asio\nlibuv，Node 也用它"],
    ["以后再跑", "setTimeout、微任务", "Executor、Future\n或投到某线程队列", "io_context、线程池\n或自己的 queue"],
    ["默认并发", "单线程 + 异步\nWorker 另开一条栈", "多线程很常见\n也可单线程 loop", "多线程很常见\n也可单线程 reactor"],
]
table_shape = s.shapes.add_table(len(rows), 4, Inches(0.4), Inches(1.12), Inches(12.55), Inches(5.9))
table = table_shape.table
table.columns[0].width = Inches(1.7)
table.columns[1].width = Inches(3.55)
table.columns[2].width = Inches(3.65)
table.columns[3].width = Inches(3.65)
table.rows[0].height = Inches(0.52)
for r in range(1, len(rows)):
    table.rows[r].height = Inches(1.076)
for r, row in enumerate(rows):
    for c, text in enumerate(row):
        if r == 0:
            fill, color, bold, size = NAVY, WHITE, True, 16
        elif c == 0:
            fill, color, bold, size = CARD, CYAN_DEEP, True, 15
        elif c == 1:
            fill, color, bold, size = SOFT, INK, False, 15
        else:
            fill, color, bold, size = WHITE, INK, False, 15
        shade_cell(table.cell(r, c), fill, text.split("\n"), size, color, bold)
notes(s, "只对名字，不讲用法。三句就够：\n"
         "JS 的 loop 是浏览器或 libuv 送的；Java、C++ 常常要自己选框架或库。\n"
         "微任务是 JS 多出来的一层。Java 的消息队列、C++ 的 message pump 通常不区分这一层。\n"
         "libuv 是交叉点：Node 用它，C++ 也可以直接用它。")

# 15 先猜
s, n = new()
chrome(s, "异步  ·  40 分钟", "先写结果，先别讨论", n, TOTAL)
codeblock(s, Inches(0.7), Inches(1.2), Inches(11.9), Inches(2.55),
          "console.log(\"1\")\nsetTimeout(() => console.log(\"2\"), 0)\nPromise.resolve().then(() => console.log(\"3\"))\nconsole.log(\"4\")", 22)
textbox(s, Inches(0.7), Inches(4.0), Inches(12), Inches(0.45), "输出顺序是哪一种？", 22, NAVY, True)
for i, t in enumerate(["1  2  3  4", "1  4  2  3", "1  4  3  2", "1  3  4  2"]):
    x = Inches(0.7 + i * 3.1)
    rrect(s, x, Inches(4.65), Inches(2.9), Inches(0.95), CARD, LINE)
    textbox(s, x, Inches(4.85), Inches(2.9), Inches(0.55), t, 20, NAVY, True, align=PP_ALIGN.CENTER)
notes(s, "让学员先写。下一页再揭晓，然后贴进 Console。不要自己先说答案。")

# 15 答案
s, n = new()
chrome(s, "异步  ·  40 分钟", "顺序是 1  4  3  2", n, TOTAL)
rrect(s, Inches(0.5), Inches(1.15), Inches(12.3), Inches(1.05), SOFT, SOFT_LINE)
textbox(s, Inches(0.7), Inches(1.35), Inches(11.9), Inches(0.65), "1    4    3    2", 36, CYAN_DEEP, True, align=PP_ALIGN.CENTER)
quad = [
    ("同步", "先跑完当前这段", "打印 1，再打印 4"),
    ("微任务", "然后清空微任务", "Promise.then 打印 3"),
    ("宏任务", "再取一条", "setTimeout(0) 打印 2"),
    ("然后", "才布局和绘制", "点击要等这一轮结束"),
]
for i, (a, b, c) in enumerate(quad):
    x = Inches(0.5 + i * 3.2)
    rrect(s, x, Inches(2.45), Inches(3.05), Inches(2.35), CARD, LINE)
    textbox(s, x + Inches(0.18), Inches(2.6), Inches(2.7), Inches(0.4), a, 18, CYAN, True)
    textbox(s, x + Inches(0.18), Inches(3.1), Inches(2.7), Inches(0.55), b, 16, NAVY, True)
    textbox(s, x + Inches(0.18), Inches(3.7), Inches(2.7), Inches(0.8), c, 15, MUTED)
callout(s, Inches(0.5), Inches(5.05), Inches(12.3), Inches(1.75),
        "setTimeout(…, 0) 不是立刻并行，只是把 2 放到宏任务队尾。\n"
        "await 后面的代码，也是以微任务回来的。", 17)
notes(s, "现场贴进已打开页面的 Console，对上 1 4 3 2。")

# 16 三件套
s, n = new()
chrome(s, "异步  ·  40 分钟", "一条栈，一片堆，一个队列", n, TOTAL)
cols = [
    ("调用栈", "当前同步调用叠在一起。栈没清空，取不了队列里的任务，点击也进不来。"),
    ("堆", "对象和闭包记住的绑定住在这里。没人引用由 GC 收走。闭包还指着，就收不走。"),
    ("事件循环", "栈空了才取任务，回调再压回这条栈。没有第二条 JS 栈去处理响应。"),
]
for i, (title, desc) in enumerate(cols):
    x = Inches(0.45 + i * 4.25)
    rrect(s, x, Inches(1.2), Inches(4.05), Inches(4.3), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(1.45), Inches(3.6), Inches(0.5), title, 22, CYAN, True)
    textbox(s, x + Inches(0.22), Inches(2.2), Inches(3.6), Inches(2.9), desc, 16, INK)
callout(s, Inches(0.45), Inches(5.7), Inches(12.4), Inches(1.15),
        "和 Java 的差别：Java 每个请求可以有自己的栈。这里同时在跑的 JS 栈只有一条。", 17)
notes(s, "堆和 Java 堆可以一句话带过，重点放在「栈空才取队列」。")

# 17 微任务宏任务
s, n = new()
chrome(s, "异步  ·  40 分钟", "一轮里，微任务要先清空", n, TOTAL)
flow = ["同步代码跑完", "清空全部微任务", "取一条宏任务", "再清空微任务"]
for i, t in enumerate(flow):
    x = Inches(0.4 + i * 3.25)
    rrect(s, x, Inches(1.15), Inches(3.0), Inches(1.15), SOFT if i == 1 else CARD, SOFT_LINE if i == 1 else LINE)
    textbox(s, x + Inches(0.12), Inches(1.4), Inches(2.75), Inches(0.7), t, 16, NAVY, True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
panel(s, Inches(0.4), Inches(2.55), Inches(6.2), Inches(2.85), "soft", "微任务",
      ["Promise 的 then / catch / finally", "queueMicrotask", "async 函数里 await 之后的续体"], 16)
panel(s, Inches(6.75), Inches(2.55), Inches(6.15), Inches(2.85), "amber", "宏任务",
      ["setTimeout / setInterval", "点击等界面事件", "I/O 回调"], 16)
callout(s, Inches(0.4), Inches(5.6), Inches(12.5), Inches(1.25),
        "清空微任务时新排进来的，仍算这一轮。若一直排微任务，下一轮宏任务和绘制会轮不上。这是队列没停，不是死锁。", 16)
notes(s, "布局和绘制夹在宏任务之间，不插进微任务队列里面。下一页的图把「该渲染了吗」画出来。")

# 18 事件循环流程图
s, n = new()
chrome(s, "异步  ·  40 分钟", "渲染夹在宏任务之间", n, TOTAL)
steps = [
    ("栈空了", "同步代码跑完，才清空微任务。"),
    ("微任务", "全部执行到空。新排进来的仍算这一轮。"),
    ("该渲染了吗", "不需要渲染，就直接取一条宏任务。"),
    ("渲染", "需要时才画。每帧最多一次。"),
    ("再循环", "取完这条宏任务，回到「调用栈空了吗」。"),
]
for i, (title, body) in enumerate(steps):
    y = Inches(1.12 + i * 1.14)
    rrect(s, Inches(0.4), y, Inches(8.85), Inches(1.04), CARD, LINE)
    textbox(s, Inches(0.62), y + Inches(0.14), Inches(8.4), Inches(0.34), title, 16, CYAN, True)
    textbox(s, Inches(0.62), y + Inches(0.48), Inches(8.4), Inches(0.42), body, 16, INK)
rrect(s, Inches(9.45), Inches(1.12), Inches(3.45), Inches(5.75), CARD, LINE)
s.shapes.add_picture(
    r"D:\文档\training\第2次素材\事件循环流程.png",
    Inches(9.68), Inches(1.22), height=Inches(5.55),
)
notes(s, "指着图说两句就够：微任务清空完才问要不要渲染；渲染每帧最多一次。\n"
         "不要展开浏览器的帧调度。若微任务一直不停，绘制会轮不上，这是队列没停，不是死锁。")

# 19 三个坑
s, n = new()
chrome(s, "异步  ·  40 分钟", "三个会静默出错的写法", n, TOTAL)
traps = [
    ("漏写 await", "const res = request.get(...)\nres 是 Promise，不是响应体。\nres.data 是 undefined，很像接口没返回字段。"),
    ("forEach 不等", "回调里的 await 等不到下一轮。\n要按顺序等，用 for...of。"),
    ("Promise.all", "一个 reject，整体 reject。\n要每个结果都留下，用 allSettled。"),
]
for i, (title, body) in enumerate(traps):
    x = Inches(0.4 + i * 4.3)
    rrect(s, x, Inches(1.2), Inches(4.1), Inches(5.55), CARD, LINE)
    textbox(s, x + Inches(0.22), Inches(1.45), Inches(3.65), Inches(0.7), title, 20, NAVY, True)
    textbox(s, x + Inches(0.22), Inches(2.3), Inches(3.65), Inches(4.0), body, 16, INK)
notes(s, "漏写 await 和第 1 次的「类型错配不抛异常」是同一种形状：拿到一个还能往下写的值。")

# 19 try/catch
s, n = new()
chrome(s, "异步  ·  40 分钟", "try/catch 只抓当前这段同步代码", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(12.4), Inches(2.15),
          "try {\n  setTimeout(() => { throw new Error(\"late\") }, 0)\n} catch (e) {\n  // 进不来\n}", 18)
panel(s, Inches(0.45), Inches(3.5), Inches(4.05), Inches(2.3), "card", "同步抛出",
      ["用 try/catch。", "始终抛 Error，否则没有栈。"], 16)
panel(s, Inches(4.65), Inches(3.5), Inches(4.05), Inches(2.3), "card", "Promise",
      ["await 放进 try，或 .catch。", "没人接，就是未处理拒绝。"], 16)
panel(s, Inches(8.85), Inches(3.5), Inches(4.0), Inches(2.3), "card", "回调风格",
      ["错误常常是第一个参数。", "外层 catch 看不见它。"], 16)
callout(s, Inches(0.45), Inches(6.0), Inches(12.4), Inches(0.9),
        "不要在 JS 里找线程安全。先问这段代码在事件循环的哪一步执行。", 16)
notes(s, "Java 有 checked / unchecked，C++ 有 noexcept。JS 只有一种运行时异常，而且没有编译期检查。\n"
         "cause 和 AggregateError 点一句即可：Error 可以带 cause；Promise.any 全失败时抛 AggregateError。")

# 24 口袋
s, n = new()
chrome(s, "收束  ·  10 分钟", "今天只带走这六句", n, TOTAL)
rules = [
    ("this", "看调用点。点号没了，this 就丢了。"),
    ("箭头", "没有自己的 this，用定义处外层的。"),
    ("原型", "沿链找。class 仍是委托。字典用 Map。"),
    ("new", "做四件事。不要用 new Parent() 当原型。"),
    ("异步", "同步跑完，清空微任务，再取一条宏任务。"),
    ("异常", "try/catch 抓不住回调里的抛出。"),
]
for i, (name, desc) in enumerate(rules):
    col, row = i % 2, i // 2
    x = Inches(0.4 + col * 6.5)
    y = Inches(1.2 + row * 1.9)
    rrect(s, x, y, Inches(6.3), Inches(1.72), CARD, LINE)
    textbox(s, x + Inches(0.28), y + Inches(0.22), Inches(5.75), Inches(0.4), name, 18, CYAN, True)
    textbox(s, x + Inches(0.28), y + Inches(0.72), Inches(5.75), Inches(0.75), desc, 16, INK)
notes(s, "每句指回今天的一页，不新开话题。数字、JSON、模块请学员记到第 3 次。")

# 25 练习
s, n = new()
chrome(s, "收束  ·  10 分钟", "标出这三块里会静默出错的地方", n, TOTAL)
codeblock(s, Inches(0.45), Inches(1.15), Inches(12.4), Inches(4.15),
          "setTimeout(obj.save, 0)\nChild.prototype = new Parent()\nconsole.log(\"1\")\nPromise.resolve().then(() => console.log(\"2\"))\nconsole.log(\"3\")", 20)
callout(s, Inches(0.45), Inches(5.5), Inches(12.4), Inches(1.35),
        "课后标出每一处为什么和直觉不一样。这 10 分钟只布置，不对答案。", 18)
notes(s, "答案：obj.save 单独递进去会丢 this；new Parent() 让子实例共享父实例上的数据；\n"
         "输出是 1 3 2，微任务在同步结束之后、下一条宏任务之前。\n"
         "若有人问 try/catch，指回前面那页，不在这题里再加。")

# 26 收束安排
s, n = new()
chrome(s, "收束", "接下来做这三件事", n, TOTAL)
closing = [
    ("1", "Q & A"),
    ("2", "重新介绍下仓库"),
    ("3", "前端环境搭建"),
]
for i, (no, title) in enumerate(closing):
    y = Inches(1.35 + i * 1.8)
    rrect(s, Inches(0.55), y, Inches(12.25), Inches(1.6), CARD, LINE)
    textbox(s, Inches(0.85), y + Inches(0.4), Inches(1.1), Inches(0.8), no, 32, CYAN, True, anchor=MSO_ANCHOR.MIDDLE)
    textbox(s, Inches(2.2), y + Inches(0.45), Inches(9.8), Inches(0.7), title, 28, NAVY, True, anchor=MSO_ANCHOR.MIDDLE)
notes(s, "按这个顺序收。Q&A 先记在白板上，能现场跑的就现场跑。\n"
         "练习答案仍在上一页备注：obj.save 丢 this；new Parent() 共享父实例数据；输出 1 3 2。\n"
         "然后重新过一遍仓库，再走前端环境搭建。数字、JSON、模块留到第 3 次。")

assert page == TOTAL, page
out = r"D:\文档\training\第2次-this原型与事件循环.pptx"
try:
    prs.save(out)
    print(f"saved {out} slides={page}")
except PermissionError:
    alt = out.replace(".pptx", "-本版.pptx")
    prs.save(alt)
    print(f"locked, saved {alt} slides={page}")
