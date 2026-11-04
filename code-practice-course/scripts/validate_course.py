# -*- coding: utf-8 -*-
"""Check a code-practice course folder.

Usage:
  python validate_course.py <course_dir> [--author 作者名] [--full | --short]
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path

CHAPTER_RE = re.compile(
    r"id:\s*'([^']+)'\s*,\s*no:\s*(\d+)\s*,\s*stage:\s*(\d+)\s*,\s*file:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'"
)
REMOTE_RE = re.compile(r"""(?:src|href)\s*=\s*['"]https?:""", re.I)
ASSET_RE = re.compile(r"""(?:src|href)\s*=\s*['"]([^'"]+)['"]""", re.I)
META_AUTHOR_RE = re.compile(r'<meta\s+name="author"\s+content="([^"]*)"\s*/?>', re.I)
INIT_RE = re.compile(r"""Course\.initChapter\(\s*['"]([^'"]+)['"]\s*\)""")
ID_RE = re.compile(r"""\sid=["']([^"']+)["']""")
SOURCE_SUFFIXES = {".py", ".js", ".java"}
END_TOKENS = ("pitfalls", "quiz-sec", "glossary", "summary")
INDEX_PHRASES = (
    "目标驱动",
    "边学边练",
    "AI 共生",
    "痛点",
    "freeCodeCamp",
    "Exercism",
    "roadmap.sh",
    "3–6 个月",
)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser()
    parser.add_argument("course_dir")
    parser.add_argument("--author", default="")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--full", action="store_true")
    group.add_argument("--short", action="store_true")
    args = parser.parse_args()

    root = Path(args.course_dir)
    errors: list[str] = []
    warns: list[str] = []
    if not root.is_dir():
        print("ERROR 目录不存在: " + str(root))
        return 1

    if not (root / "index.html").is_file():
        errors.append("缺少 index.html")
    for rel in ("assets/css/course.css", "assets/js/course.js", "exercises/check.py"):
        if not (root / rel).is_file():
            errors.append("缺少 " + rel)

    language = ""
    chapters: list[dict[str, str]] = []
    course_js = root / "assets/js/course.js"
    if course_js.is_file():
        js = read_text(course_js, errors)
        language = check_runtime(js, errors, warns)
        chapters = [
            {
                "id": m.group(1),
                "no": m.group(2),
                "stage": m.group(3),
                "file": m.group(4),
                "title": m.group(5),
            }
            for m in CHAPTER_RE.finditer(js)
        ]
        if not chapters:
            errors.append("course.js 里没有解析到 CHAPTERS 条目")

    index_text = ""
    index_path = root / "index.html"
    if index_path.is_file():
        index_text = read_text(index_path, errors)
        check_html(index_path, index_text, errors, warns, args.author, None, language)
        if "ix-hero" not in index_text:
            errors.append("index.html 缺少 ix-hero")

    seen: set[str] = set()
    pages: dict[str, str] = {}
    for chapter in chapters:
        filename = chapter["file"]
        if filename in seen:
            errors.append("注册表文件名重复: " + filename)
        seen.add(filename)
        path = root / filename
        if not path.is_file():
            errors.append("注册了但不存在: " + filename)
            continue
        if 'href="%s"' % filename not in index_text and "href='%s'" % filename not in index_text:
            errors.append("首页没有链接 " + filename)
        text = read_text(path, errors)
        pages[filename] = text
        check_html(path, text, errors, warns, args.author, chapter["id"], language)

    extra = sorted(p.name for p in root.glob("ch*.html") if p.name not in seen)
    for name in extra:
        errors.append("存在未注册的章节文件: " + name)

    if args.full or args.short:
        check_coverage(root, args.full, chapters, pages, index_text, errors)

    for line in warns:
        print("WARN  " + line)
    for line in errors:
        print("ERROR " + line)
    print("chapters=%d errors=%d warnings=%d" % (len(chapters), len(errors), len(warns)))
    return 1 if errors else 0


def check_runtime(js: str, errors: list[str], warns: list[str]) -> str:
    if 'type="module"' in js or "type='module'" in js:
        errors.append("course.js 不应使用 ES Module")
    comment = re.search(r"/\*\s*language:\s*(javascript|python|java)\s*\*/", js)
    prop = re.search(r"\blanguage:\s*['\"](javascript|python|java)['\"]", js)
    if not comment or not prop or comment.group(1) != prop.group(1):
        errors.append("course.js 的 language 注释和 language 属性缺失或不一致")
        return ""
    if "VMD" in js:
        warns.append("course.js 出现了车辆课标记 VMD")
    return comment.group(1)


def check_coverage(
    root: Path,
    full: bool,
    chapters: list[dict[str, str]],
    pages: dict[str, str],
    index_text: str,
    errors: list[str],
) -> None:
    chapter_blob = "\n".join(pages.values())
    blob = index_text + "\n" + chapter_blob
    for phrase in INDEX_PHRASES:
        if phrase not in index_text:
            errors.append("首页缺少「" + phrase + "」")
    if "先跑通一行" in blob:
        errors.append("还留着骨架章「先跑通一行」")
    if "结构骨架" in index_text:
        errors.append("首页还写着「结构骨架」")
    if "伪代码" not in chapter_blob:
        errors.append("章节里没有「伪代码」")
    if "AI 共生" not in chapter_blob:
        errors.append("章节里没有「AI 共生」")
    if "Course.ui.flow(" not in chapter_blob:
        errors.append("没有流程图调用 Course.ui.flow")
    logs = re.findall(r'<pre class="error-log">(.*?)</pre>', chapter_blob, re.S)
    if not any(re.sub(r"<[^>]+>", "", item).strip() for item in logs):
        errors.append("没有错误原文（pre.error-log）")
    sols = [
        p
        for p in (root / "exercises").rglob("*")
        if p.is_file() and "solution" in p.parts and p.suffix.lower() in SOURCE_SUFFIXES
    ]
    if not sols:
        errors.append("缺少 exercises/chNN/solution 参考解")

    titles = " ".join(chapter["title"] for chapter in chapters)
    if full:
        have = {chapter["stage"] for chapter in chapters}
        for number in ("1", "2", "3", "4", "5"):
            if number not in have:
                errors.append("完整课缺少第 " + number + " 篇")
        stage2 = [chapter["title"] for chapter in chapters if chapter["stage"] == "2"]
        used: set[int] = set()
        for word in ("变量", "循环", "条件", "函数"):
            hit = next((i for i, title in enumerate(stage2) if word in title and i not in used), None)
            if hit is None:
                errors.append("四件套缺少独立一章：" + word)
            else:
                used.add(hit)
    else:
        body = titles + "\n" + chapter_blob
        for word in ("变量", "循环", "条件", "函数"):
            if word not in body:
                errors.append("短课缺少「" + word + "」")


def check_html(
    path: Path,
    text: str,
    errors: list[str],
    warns: list[str],
    author: str,
    chapter_id: str | None,
    language: str,
) -> None:
    name = path.name
    if REMOTE_RE.search(text):
        errors.append(name + " 引用了远程 URL")
    if re.search(r"<script[^>]+type\s*=\s*['\"]module['\"]", text, re.I):
        errors.append(name + " 使用了 ES Module")
    check_assets(path, text, errors)
    check_author(name, text, author, errors)
    ids = ID_RE.findall(text)
    dups = [item for item, count in Counter(ids).items() if count > 1]
    if dups:
        errors.append(name + " 重复 id: " + ", ".join(dups[:8]))
    if chapter_id is None:
        return

    if "chapter-hero" not in text:
        errors.append(name + " 缺少 chapter-hero")
    if "概念约" not in text or "预计动手" not in text:
        errors.append(name + " 页眉缺少「概念约」或「预计动手」")
    inits = INIT_RE.findall(text)
    if inits != [chapter_id]:
        errors.append("%s 的 initChapter 应为 ['%s']，实际 %s" % (name, chapter_id, inits))
    for marker in ("本章避坑清单", "自测题", "术语表", "本章小结"):
        if marker not in text:
            errors.append(name + " 缺少「" + marker + "」")
    if "Course.ui.quiz" not in text:
        errors.append(name + " 未调用 Course.ui.quiz")
    if language == "java" and re.search(r"(?m)^\s*package\s+", text):
        warns.append(name + " 出现了 package，Java 练习应是单个文件")
    check_sections(path, text, language, errors)


def check_sections(path: Path, text: str, language: str, errors: list[str]) -> None:
    masked = mask_embedded(text)
    practice = 0
    for attrs, start, end in iter_elements(masked, "section"):
        classes = class_list(attrs)
        if "lesson" not in classes:
            continue
        inner = text[start:end]
        masked_inner = masked[start:end]
        if any(token in attrs for token in END_TOKENS):
            continue
        if 'class="run-goal"' not in inner:
            errors.append(path.name + " 有一节缺少「本节要跑通」")
            continue
        practice += 1
        for class_name in ("concept", "pseudo", "demo-block", "task"):
            if extract_div(masked_inner, class_name) is None:
                errors.append(path.name + " 的练习节缺少 " + class_name)
        if 'class="expect"' not in inner or "预期输出" not in inner:
            errors.append(path.name + " 的练习节缺少预期输出")
        concept = extract_div(masked_inner, "concept")
        demo = extract_div(masked_inner, "demo-block")
        task = extract_div(masked_inner, "task")
        if concept is not None and demo is not None and task is not None:
            if visible_len(concept) >= visible_len(demo) + visible_len(task):
                errors.append(path.name + " 的概念块不短于这一节的复刻加动手")
        links = re.findall(r'href="(exercises/[^"]+)"', inner)
        demos = [href for href in links if Path(href).name.startswith("demo")]
        tasks = [href for href in links if "solution" not in href and not Path(href).name.startswith("demo")]
        if not demos or not tasks:
            errors.append(path.name + " 的练习节要同时链到 demo 文件和动手文件")
        for href in links:
            check_exercise_link(path, text, inner, href, errors)
        if language == "javascript" and inner.count('class="js-run"') < 2:
            errors.append(path.name + " 的复刻和动手都要能在页面里运行")
        for code_id in re.findall(r'<div class="js-run" data-code="([^"]+)"', inner):
            if 'id="%s"' % code_id not in text:
                errors.append(path.name + " 的运行器找不到文本框 " + code_id)
        if "needs-flow" in classes:
            mounts = re.findall(r'<div id="([^"]+)"></div>', inner)
            flow_mounts = [mount for mount in mounts if "flow" in mount]
            if not flow_mounts:
                errors.append(path.name + " 标记了流程图但没有容器")
            for mount in flow_mounts:
                call_s = "Course.ui.flow('%s'" % mount
                call_d = 'Course.ui.flow("%s"' % mount
                if call_s not in text and call_d not in text:
                    errors.append(path.name + " 没有调用 Course.ui.flow('" + mount + "')")
    if practice < 1:
        errors.append(path.name + " 没有练习节")


def check_exercise_link(path: Path, text: str, section: str, href: str, errors: list[str]) -> None:
    name = path.name
    if "\\" in href or "solution" in href.split("/"):
        errors.append(name + " 链接了参考解或使用了反斜杠: " + href)
        return
    target = (path.parent / href).resolve()
    try:
        target.relative_to(path.parent.resolve())
    except ValueError:
        errors.append(name + " 资源逃出课程目录: " + href)
        return
    if ">%s</a>" % href not in section:
        errors.append(name + " 的链接文字应是路径 " + href)
    if not target.is_file():
        errors.append(name + " 资源不存在: " + href)
        return
    if target.suffix.lower() not in SOURCE_SUFFIXES:
        return
    needle = target.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    if not needle:
        errors.append(href + " 是空文件")
    elif needle not in text.replace("\r\n", "\n"):
        errors.append(name + " 里的代码和 " + href + " 不是同一份")
    expect = target.parent / (target.stem + ".expect.txt")
    if not expect.is_file():
        errors.append(href + " 缺少 " + expect.name)
        return
    expect_text = expect.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    if expect_text and expect_text not in section:
        errors.append(name + " 的预期输出和 " + expect.name + " 不一致")
    solution = target.parent / "solution" / target.name
    if not target.name.startswith("demo") and solution.is_file():
        secret = solution.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
        if secret and secret in text.replace("\r\n", "\n"):
            errors.append(name + " 把参考解写进了页面")


def check_assets(path: Path, text: str, errors: list[str]) -> None:
    for ref in ASSET_RE.findall(text):
        if ref.startswith(("http://", "https://", "data:", "mailto:", "#", "javascript:")):
            continue
        target = (path.parent / ref.split("#")[0].split("?")[0]).resolve()
        try:
            target.relative_to(path.parent.resolve())
        except ValueError:
            errors.append(path.name + " 资源逃出课程目录: " + ref)
            continue
        if not target.is_file():
            errors.append(path.name + " 资源不存在: " + ref)


def check_author(name: str, text: str, author: str, errors: list[str]) -> None:
    metas = META_AUTHOR_RE.findall(text)
    if author:
        visible = text.count("作者：" + author)
        if visible != 1:
            errors.append("%s 可见署名「作者：%s」出现 %d 次，应为 1" % (name, author, visible))
        if metas != [author]:
            errors.append("%s 的 meta author 应为唯一一条「%s」，实际 %s" % (name, author, metas))
    elif len(metas) > 1:
        errors.append(name + " 有多条 meta author")
    elif len(metas) == 1:
        visible = text.count("作者：" + metas[0])
        if visible != 1:
            errors.append("%s 有 meta author「%s」，可见署名出现 %d 次，应为 1" % (name, metas[0], visible))


def read_text(path: Path, errors: list[str]) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        errors.append(path.name + " 含 UTF-8 BOM")
    try:
        return raw.decode("utf-8")
    except UnicodeError:
        errors.append(path.name + " 不是 UTF-8")
        return ""


def visible_len(html: str) -> int:
    return len(re.sub(r"<[^>]+>", "", html).strip())


def class_list(attrs: str) -> list[str]:
    match = re.search(r'class="([^"]*)"', attrs)
    return match.group(1).split() if match else []


def mask_embedded(html: str) -> str:
    chars = list(html)
    lowered = html.lower()
    i = 0
    while i < len(html):
        tag = None
        if lowered.startswith("<textarea", i):
            tag = "textarea"
        elif lowered.startswith("<script", i):
            tag = "script"
        if not tag:
            i += 1
            continue
        gt = html.find(">", i)
        if gt < 0:
            break
        close = lowered.find("</" + tag, gt)
        if close < 0:
            break
        for pos in range(gt + 1, close):
            chars[pos] = " "
        i = close
    return "".join(chars)


def iter_elements(html: str, tag: str):
    open_re = re.compile(r"<%s\b([^>]*)>" % tag, re.I)
    token_re = re.compile(r"</?%s\b[^>]*>" % tag, re.I)
    pos = 0
    while pos < len(html):
        match = open_re.search(html, pos)
        if not match:
            return
        depth = 1
        cursor = match.end()
        while depth and cursor < len(html):
            token = token_re.search(html, cursor)
            if not token:
                return
            if token.group(0).lower().startswith("</"):
                depth -= 1
                if depth == 0:
                    yield match.group(1), match.end(), token.start()
                    pos = token.end()
                    break
            else:
                depth += 1
            cursor = token.end()
        else:
            return


def extract_div(html: str, class_name: str) -> str | None:
    open_re = re.compile(r'<div\b[^>]*class="%s"[^>]*>' % re.escape(class_name))
    match = open_re.search(html)
    if not match:
        return None
    token_re = re.compile(r"</?div\b[^>]*>", re.I)
    depth = 1
    pos = match.end()
    while depth and pos < len(html):
        token = token_re.search(html, pos)
        if not token:
            return None
        if token.group(0).lower().startswith("</"):
            depth -= 1
            if depth == 0:
                return html[match.end() : token.start()]
        else:
            depth += 1
        pos = token.end()
    return None


if __name__ == "__main__":
    sys.exit(main())
