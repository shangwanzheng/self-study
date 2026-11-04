# -*- coding: utf-8 -*-
"""Run demo programs, or reference solutions, and compare stdout.

Copy this file into a course unchanged. Add exercises; do not edit the comparison.

  python exercises/check.py
  python exercises/check.py --solution

Default runs exercises/ch*/demo* and ignores solution/.
--solution runs exercises/ch*/solution/ and compares each file with the
.expect.txt beside the learner file of the same name.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


class MissingTool(Exception):
    pass


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    root = Path(__file__).resolve().parents[1]
    solution = "--solution" in sys.argv[1:]
    files = collect(root, solution)
    if not files:
        print("ERROR 没有要运行的文件")
        return 1
    try:
        ensure_tools(files)
    except MissingTool as exc:
        print("ERROR 缺少运行器 " + str(exc) + "，这一门课的练习还没跑")
        return 2
    failed = 0
    for path in files:
        ok, line = run_one(root, path)
        print(("PASS " if ok else "FAIL ") + line)
        if not ok:
            failed += 1
    print("checked=%d failed=%d" % (len(files), failed))
    return 1 if failed else 0


def collect(root: Path, solution: bool) -> list[Path]:
    found: list[Path] = []
    exercises = root / "exercises"
    if not exercises.is_dir():
        return found
    for path in exercises.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".py", ".js", ".java"}:
            continue
        if path.name == "check.py":
            continue
        in_solution = path.parent.name == "solution"
        if solution != in_solution:
            continue
        if not solution and not path.name.startswith("demo"):
            continue
        found.append(path)
    return sorted(found)


def ensure_tools(files: list[Path]) -> None:
    suffixes = {path.suffix.lower() for path in files}
    if ".js" in suffixes and shutil.which("node") is None:
        raise MissingTool("node")
    if ".java" in suffixes and (shutil.which("javac") is None or shutil.which("java") is None):
        raise MissingTool("javac/java")


def expect_path(path: Path) -> Path:
    if path.parent.name == "solution":
        return path.parent.parent / (path.stem + ".expect.txt")
    return path.with_suffix(".expect.txt")


def run_one(root: Path, path: Path) -> tuple[bool, str]:
    rel = path.relative_to(root).as_posix()
    expected_file = expect_path(path)
    if not expected_file.is_file():
        return False, rel + " 缺少 " + expected_file.name
    try:
        got = run_file(root, path)
    except subprocess.TimeoutExpired:
        return False, rel + " 超时"
    except OSError as exc:
        return False, rel + " 无法启动: " + str(exc)
    expected = expected_file.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    actual = got.replace("\r\n", "\n").strip()
    if actual == expected:
        return True, rel
    return False, "%s\n  预期: %s\n  实际: %s" % (rel, expected, actual)


def run_file(root: Path, path: Path) -> str:
    suffix = path.suffix.lower()
    env = dict(os.environ)
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    if suffix == ".py":
        proc = subprocess.run(
            [sys.executable, str(path)],
            cwd=str(root),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            timeout=15,
            check=False,
        )
    elif suffix == ".js":
        proc = subprocess.run(
            ["node", str(path)],
            cwd=str(root),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            timeout=15,
            check=False,
        )
    elif suffix == ".java":
        return run_java(path)
    else:
        return ""
    out = proc.stdout or ""
    if proc.returncode != 0:
        out += proc.stderr or ""
    return out


def run_java(path: Path) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        compiled = subprocess.run(
            ["javac", "-encoding", "UTF-8", "-d", tmp, str(path)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=15,
            check=False,
        )
        if compiled.returncode != 0:
            return (compiled.stdout or "") + (compiled.stderr or "")
        ran = subprocess.run(
            ["java", "-cp", tmp, path.stem],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=15,
            check=False,
        )
    out = ran.stdout or ""
    if ran.returncode != 0:
        out += ran.stderr or ""
    return out


if __name__ == "__main__":
    sys.exit(main())
