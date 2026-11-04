# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
html_bytes = (root / "ch05_vectors.html").read_bytes()
print("bom", html_bytes.startswith(b"\xef\xbb\xbf"))
print("crlf", b"\r\n" in html_bytes)
text = html_bytes.decode("utf-8")
blocks = re.findall(r'<div class="c05-code">(.*?)</div>', text, re.S)
files = ["vector-row.js", "whole-sentence.js", "read-scores.js"]
print("blocks", len(blocks))
for block, name in zip(blocks, files):
    file_text = (root / "examples" / "ch05" / name).read_text(encoding="utf-8")
    print(name, "match", block == file_text, "blen", len(block), "flen", len(file_text))
    if block != file_text:
        print("BLOCK", repr(block))
        print("FILE", repr(file_text))
print("inits", re.findall(r"initChapter\(\s*'([^']+)'\s*\)", text))
print("author", 'name="author"' in text)
print("http", bool(re.search(r"https?://", text)))
print("module", 'type="module"' in text)
print("h2count", len(re.findall(r"<h2>", text)))
print("ids", [i for i, c in __import__("collections").Counter(re.findall(r'\sid="([^"]+)"', text)).items() if c > 1])
print("quiz items", text.count("answer:"))
