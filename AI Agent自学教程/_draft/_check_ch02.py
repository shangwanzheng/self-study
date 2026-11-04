# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(r"D:\文档\training\AI Agent自学教程")
files = [root / "ch02_structured.html"] + list((root / "examples" / "ch02").glob("*.js"))
for p in files:
    b = p.read_bytes()
    if b.startswith(b"\xef\xbb\xbf"):
        b = b[3:]
    b = b.replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    if not b.endswith(b"\n"):
        b += b"\n"
    p.write_bytes(b)
    print(p.name, "lf", b.count(b"\n"), "cr", b.count(b"\r"))

html = (root / "ch02_structured.html").read_text(encoding="utf-8")
html_only = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S | re.I)
parts = re.split(r"(<pre class=\"c02-code\">.*?</pre>)", html_only, flags=re.S)
ok = True
count = 0
for i, part in enumerate(parts):
    m = re.match(r"<pre class=\"c02-code\">(.*)</pre>$", part, flags=re.S)
    if not m:
        continue
    count += 1
    code = m.group(1)
    window = parts[i + 1][:500] if i + 1 < len(parts) else ""
    hm = re.search(r"href=\"(examples/ch02/[^\"]+)\"", window)
    print("---", "link", hm.group(1) if hm else "MISSING", "len", len(code))
    if not hm:
        ok = False
        continue
    file_text = (root / hm.group(1)).read_text(encoding="utf-8")
    if code != file_text:
        ok = False
        print("MISMATCH", len(code), len(file_text))
        n = min(len(code), len(file_text))
        for j in range(n):
            if code[j] != file_text[j]:
                print("diff at", j)
                print("HTML", repr(code[max(0, j - 30):j + 30]))
                print("FILE", repr(file_text[max(0, j - 30):j + 30]))
                break
        else:
            print("prefix equal, lens differ")
    else:
        print("MATCH")
print("blocks", count, "all_match", ok)
print("init", re.findall(r"Course\.initChapter\(\s*'([^']+)'\s*\)", html))
print("https", len(re.findall(r"https?:", html)))
print("module", 'type="module"' in html or "type='module'" in html)
print("author", 'name="author"' in html)
print("sections", len(re.findall(r"<h2>2\.", html)))
print("demos", html.count('class="demo"'))
print("ids", re.findall(r'\sid="([^"]+)"', html))
from collections import Counter
ids = re.findall(r'\sid="([^"]+)"', html)
dups = [k for k, v in Counter(ids).items() if v > 1]
print("dups", dups)
