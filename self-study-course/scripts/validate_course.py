# -*- coding: utf-8 -*-
"""Check an offline interactive course folder against the course contract.

Usage:
  python validate_course.py <course_dir> [--author 作者名]
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path

CHAPTER_RE = re.compile(
    r"id:\s*'([^']+)'\s*,\s*no:\s*(\d+)\s*,\s*stage:\s*(\d+)\s*,\s*file:\s*'([^']+)'"
)
REMOTE_RE = re.compile(r"""(?:src|href)\s*=\s*['"]https?:""", re.I)
ASSET_RE = re.compile(r"""(?:src|href)\s*=\s*['"]([^'"]+)['"]""", re.I)
META_AUTHOR_RE = re.compile(r'<meta\s+name="author"\s+content="([^"]*)"\s*/?>', re.I)
INIT_RE = re.compile(r"""(?:VMD|Course)\.initChapter\(\s*['"]([^'"]+)['"]\s*\)""")
ID_RE = re.compile(r"""\sid=["']([^"']+)["']""")
QUIZ_RE = re.compile(r"""(?:VMD|Course)\.ui\.quiz|\bui\.quiz\b""")
REQUIRED_ASSETS = (
    "assets/css/course.css",
    "assets/js/course.js",
    "assets/lib/three.min.js",
    "assets/lib/OrbitControls.js",
    "assets/lib/katex/katex.min.js",
    "assets/lib/katex/katex.min.css",
    "assets/lib/katex/auto-render.min.js",
)
CHAPTER_MARKERS = ("本章避坑清单", "自测题", "术语表", "本章小结")
VEHICLE_MARKERS = ("refCar", "VMD.susp", "VMD.tire", "VMD.veh", "vmd-models.js")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("course_dir")
    parser.add_argument("--author", default="")
    args = parser.parse_args()
    root = Path(args.course_dir)
    errors: list[str] = []
    warns: list[str] = []

    if not root.is_dir():
        print("ERROR 目录不存在: " + str(root))
        return 1
    if not (root / "index.html").is_file():
        errors.append("缺少 index.html")
    for rel in REQUIRED_ASSETS:
        if not (root / rel).is_file():
            errors.append("缺少 " + rel)

    course_js = root / "assets/js/course.js"
    chapters: list[tuple[str, str, str]] = []
    if course_js.is_file():
        js = course_js.read_text(encoding="utf-8")
        chapters = [(m.group(1), m.group(2), m.group(4)) for m in CHAPTER_RE.finditer(js)]
        if not chapters:
            errors.append("course.js 里没有解析到 CHAPTERS 条目")
        if 'type="module"' in js or "type='module'" in js:
            errors.append("course.js 不应使用 ES Module")
        if any(marker in js for marker in VEHICLE_MARKERS):
            if not (root / "assets/js/vmd-models.js").is_file():
                errors.append("course.js 使用了车辆计算，但缺少 assets/js/vmd-models.js")
        elif not (root / "assets/js/models.js").is_file() and not (root / "assets/js/vmd-models.js").is_file():
            warns.append("没有 assets/js/models.js 或 vmd-models.js，共用计算若在章节里会难以复用")
        if "VMD." in js and re.search(r"\bCourse\.", js):
            warns.append("course.js 同时出现 VMD 与 Course")

    seen_files: set[str] = set()
    for cid, _no, filename in chapters:
        if filename in seen_files:
            errors.append("注册表文件名重复: " + filename)
        seen_files.add(filename)
        path = root / filename
        if not path.is_file():
            errors.append("注册了但不存在: " + filename)
            continue
        check_html(path, errors, warns, args.author, chapter_id=cid)

    index = root / "index.html"
    if index.is_file():
        check_html(index, errors, warns, args.author, chapter_id=None)

    extra = sorted(p.name for p in root.glob("ch*.html") if p.name not in seen_files)
    for name in extra:
        errors.append("存在未注册的章节文件: " + name)

    for line in warns:
        print("WARN  " + line)
    for line in errors:
        print("ERROR " + line)
    print("chapters=%d errors=%d warnings=%d" % (len(chapters), len(errors), len(warns)))
    return 1 if errors else 0


def check_html(path: Path, errors: list[str], warns: list[str], author: str, chapter_id: str | None) -> None:
    raw = path.read_bytes()
    name = path.name
    if raw.startswith(b"\xef\xbb\xbf"):
        errors.append(name + " 含 UTF-8 BOM")
    try:
        text = raw.decode("utf-8")
    except UnicodeError:
        errors.append(name + " 不是 UTF-8")
        return

    if REMOTE_RE.search(text):
        errors.append(name + " 引用了远程 URL")
    if re.search(r"<script[^>]+type\s*=\s*['\"]module['\"]", text, re.I):
        errors.append(name + " 使用了 ES Module")

    root = path.parent
    for ref in ASSET_RE.findall(text):
        if ref.startswith(("http://", "https://", "data:", "mailto:", "#", "javascript:")):
            continue
        target = (path.parent / ref.split("#")[0].split("?")[0]).resolve()
        try:
            target.relative_to(root.resolve())
        except ValueError:
            errors.append(name + " 资源逃出课程目录: " + ref)
            continue
        if not target.is_file():
            errors.append(name + " 资源不存在: " + ref)

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

    if "VMD." in text and re.search(r"\bCourse\.", text):
        warns.append(name + " 同时使用了 VMD 与 Course")

    ids = ID_RE.findall(text)
    dups = [item for item, count in Counter(ids).items() if count > 1]
    if dups:
        errors.append(name + " 重复 id: " + ", ".join(dups[:8]))

    if chapter_id is None:
        if "ix-hero" not in text:
            warns.append(name + " 没有 ix-hero")
        return

    inits = INIT_RE.findall(text)
    if inits != [chapter_id]:
        errors.append("%s 的 initChapter 应为 ['%s']，实际 %s" % (name, chapter_id, inits))
    if "chapter-hero" not in text:
        errors.append(name + " 缺少 chapter-hero")
    for marker in CHAPTER_MARKERS:
        if marker not in text:
            errors.append(name + " 缺少「" + marker + "」")
    if not QUIZ_RE.search(text):
        errors.append(name + " 未调用 ui.quiz")


if __name__ == "__main__":
    sys.exit(main())
