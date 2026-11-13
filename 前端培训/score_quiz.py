# -*- coding: utf-8 -*-
"""给培训测验的答案 txt 打分。单选 20 题、判断 10 题，每题 1 分。

用法:
  py score_quiz.py 答案-张三.txt
  py score_quiz.py 某一文件夹
"""
import sys
from pathlib import Path

KEY = {
    1: "B", 2: "B", 3: "B", 4: "A", 5: "C",
    6: "B", 7: "C", 8: "B", 9: "B", 10: "B",
    11: "C", 12: "B", 13: "B", 14: "B", 15: "C",
    16: "B", 17: "B", 18: "B", 19: "B", 20: "B",
    21: "×", 22: "√", 23: "√", 24: "√", 25: "×",
    26: "×", 27: "×", 28: "×", 29: "×", 30: "×",
}
TRUE_MARKS = {"√", "✓", "对", "T", "TRUE", "Y", "YES"}
FALSE_MARKS = {"×", "✕", "✗", "错", "F", "FALSE", "N", "NO"}


def norm(raw):
    text = raw.strip().upper()
    if text in TRUE_MARKS or raw.strip() in TRUE_MARKS:
        return "√"
    if text in FALSE_MARKS or raw.strip() in FALSE_MARKS:
        return "×"
    return text[:1] if text else ""


def parse(text):
    text = text.lstrip("\ufeff")
    name = ""
    answers = {}
    for line in text.splitlines():
        if line.startswith("姓名:"):
            name = line.split(":", 1)[1].strip()
            continue
        head, sep, tail = line.partition(".")
        if sep and head.strip().isdigit():
            answers[int(head.strip())] = norm(tail)
    return name, answers


def report(path):
    name, answers = parse(path.read_text(encoding="utf-8"))
    got = 0
    wrong = []
    blank = []
    for n in range(1, 31):
        picked = answers.get(n, "")
        if not picked:
            blank.append(str(n))
            continue
        if picked == KEY[n]:
            got += 1
        else:
            wrong.append(f"{n}(选{picked}，应为{KEY[n]})")
    lines = [
        f"文件: {path.name}",
        f"姓名: {name or '（未填）'}",
        f"客观题: {got}/30",
        "未答: " + ("、".join(blank) if blank else "无"),
        "错题: " + ("、".join(wrong) if wrong else "无"),
    ]
    return "\n".join(lines)


def main(argv):
    if len(argv) != 2:
        print("用法: py score_quiz.py 答案.txt 或 py score_quiz.py 文件夹")
        return 1
    target = Path(argv[1])
    files = sorted(target.glob("*.txt")) if target.is_dir() else [target]
    if not files:
        print("没有找到 txt")
        return 1
    chunks = [report(path) for path in files]
    print("\n\n".join(chunks))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
