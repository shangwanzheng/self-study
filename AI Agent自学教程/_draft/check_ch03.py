# -*- coding: utf-8 -*-
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, r"D:\文档\training\self-study-course\scripts")
import validate_course as v

root = Path(r"D:\文档\training\AI Agent自学教程")
html_path = root / "ch03_tools.html"
text = html_path.read_text(encoding="utf-8")
raw = html_path.read_bytes()
errors = []
warns = []
v.check_html(html_path, errors, warns, "", "ch03")
print("BOM", raw.startswith(b"\xef\xbb\xbf"))
print("CRLF", b"\r\n" in raw)
print("ERRORS", errors)
print("WARNS", warns)
blocks = re.findall(r'<div class="c03-code">(.*?)</div>', text, flags=re.S)
files = ["tool-spec.js", "model-select.js", "lookup-once.js"]
print("blocks", len(blocks))
for block, name in zip(blocks, files):
    ft = (root / "examples" / "ch03" / name).read_text(encoding="utf-8")
    print(name, block == ft, len(block), len(ft))
print("h2_3", len(re.findall(r"<h2>3\.\d+", text)))
print("demos", text.count('class="demo"'))
print("q", text.count("\n        q:"))
print("init", re.findall(r"initChapter\('(\w+)'\)", text))
ids = re.findall(r'\sid=["\']([^"\']+)["\']', text)
print("dups", [i for i, c in Counter(ids).items() if c > 1])
print("arc-now", text.count("arc-now"))
print("http", "http://" in text or "https://" in text)
print("module", 'type="module"' in text)
print("author", "作者" in text)
