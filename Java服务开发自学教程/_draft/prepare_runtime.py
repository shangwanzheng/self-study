# -*- coding: utf-8 -*-
"""Copy the skill template runtime and retarget it for the Java course."""
from pathlib import Path
import re
import shutil

SKILL_ASSETS = Path(r"d:\文档\training\self-study-course\template\assets")
ROOT = Path(r"d:\文档\training\Java服务开发自学教程")
ASSETS = ROOT / "assets"

if ASSETS.exists():
    shutil.rmtree(ASSETS)
shutil.copytree(SKILL_ASSETS, ASSETS, ignore=shutil.ignore_patterns("vmd-models.js"))

course_js = ASSETS / "js" / "course.js"
text = course_js.read_text(encoding="utf-8")
text = re.sub(r"\bVMD\b", "Course", text)
text = text.replace("车辆多体动力学交互教程", "Java 服务开发自学教程")
text = text.replace("h('span', { class: 'logo' }, 'VD')", "h('span', { class: 'logo' }, 'JA')")
text = text.replace("'vmd-theme'", "'java-course-theme'")
text = text.replace("'vmd-visited'", "'java-course-visited'")

start = text.index("  Course.COURSE_NAME = ")
end = text.index("  Course.chapter = ")
replacement = r"""  Course.COURSE_NAME = 'Java 服务开发 · 前端工程师自学教程';
  Course.CHAPTERS = [
    { id: 'ch01', no: 1, stage: 1, file: 'ch01_frontend_map.html', title: '把前端词汇翻译成 Java', short: '词汇对照', desc: 'classpath、Maven、类型、线程池、CORS，以及 Long 主键和金额单位。' },
    { id: 'ch02', no: 2, stage: 1, file: 'ch02_machine_request.html', title: '机器、JDK 与一次请求', short: '环境与请求', desc: '堆和栈、PATH 与 CLASSPATH、JDK 17、WSL，以及一次 HTTP 经过哪些层。' },
    { id: 'ch03', no: 3, stage: 2, file: 'ch03_collections.html', title: '集合：List、Set、Map', short: '集合', desc: '容器怎么选、equals 与 hashCode、HashMap 扩容，以及教学订单该放进哪一种。' },
    { id: 'ch04', no: 4, stage: 2, file: 'ch04_thread_io.html', title: '线程、IO 与网络', short: '线程与 IO', desc: '线程池四个数、字节流与字符流、超时，以及六个能在框架里认出的模式。' },
    { id: 'ch05', no: 5, stage: 2, file: 'ch05_data_structures.html', title: '会在库和索引里碰到的数据结构', short: '数据结构', desc: '数组、链表、哈希、堆、树，以及它们和教学订单查找的关系。' },
    { id: 'ch06', no: 6, stage: 3, file: 'ch06_boot_api.html', title: '从 JDBC 到一个 Boot 接口', short: 'Boot 接口', desc: 'Servlet、JDBC、MyBatis、Spring 容器与事务，直到一个能调试的 Boot 接口。' },
    { id: 'ch07', no: 7, stage: 3, file: 'ch07_quality.html', title: '日志、测试、规范与构建', short: '质量', desc: 'SLF4J、JUnit、分层规范、Maven，以及怎样把接口交给别人。' },
    { id: 'ch08', no: 8, stage: 4, file: 'ch08_algorithm_cost.html', title: '算法代价：怎样判断做对了', short: '算法代价', desc: '排序、查找、贪心、递归和摊还，用教学订单的数据量看代价。' },
    { id: 'ch09', no: 9, stage: 4, file: 'ch09_distributed.html', title: '缓存、消息和一致性上会看到什么', short: '分布式现象', desc: '单体到微服务、CAP、Redis、消息、注册配置、网关、鉴权和全局 id。' },
    { id: 'ch10', no: 10, stage: 5, file: 'ch10_practice.html', title: '部署、排错与全课避坑', short: '实战避坑', desc: 'Docker 与 Kubernetes 的最小闭环，以及把前面各章的坑收成一张清单。' },
  ];
  Course.STAGES = [
    { no: 1, name: '共同语言', desc: '把前端经验翻译成 Java，并看清一次请求' },
    { no: 2, name: '对象与结构', desc: '集合、线程、IO，以及库和索引里的数据结构' },
    { no: 3, name: '方法', desc: '做出一个 Boot 接口，并让别人能接手' },
    { no: 4, name: '现象与判断', desc: '从代价、缓存、消息和一致性判断对错' },
    { no: 5, name: '实战', desc: '部署、排错和全课避坑' },
  ];
"""
text = text[:start] + replacement + text[end:]
if re.search(r"\bVMD\b", text):
    raise SystemExit("VMD identifier still present")
course_js.write_text(text, encoding="utf-8", newline="\n")
print("course.js bytes", course_js.stat().st_size)
