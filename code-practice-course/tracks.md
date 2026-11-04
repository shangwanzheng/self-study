# 先定方向

不要纠结哪门语言最厉害。按目标选，用来尽快拿到能跑通的结果。

- 想做自动化办公、数据分析、AI 应用：Python。生态最完善，新手门槛最低。
- 想做网页、前端交互、小程序：JavaScript。能快速写出可视化的页面效果。
- 想走后端开发、找 Java 相关工作：Java。企业需求最广。

一门课只走其中一条。用户明确点名其他语言时，沿用本技能的五篇、四件套和动手比例，把 `course.js` 的 `language` 写成该语言的小写英文名。

用户没给出痛点时，项目用 `exercises/data/` 里几行虚构 csv 做批量整理。不要改成爬虫。

## Python

自动化办公、数据分析、AI 应用走这里。

- 练习是 `.py`。页面写明从课程根目录执行：`python exercises/ch01/demo.py`。`python` 不可用时改写 `py -3`。
- 四件套只用标准库。痛点只是表格整理时，用 csv，不引入表格库。
- 不写虚拟环境、编辑器插件和解释器原理。某章确实缺一个库时，只给一行安装命令。

## JavaScript

网页、前端交互、小程序走这里。

- 复刻和四件套只写 `console.log` 和纯计算，保证页面运行器和 `node` 看到同一份输出。
- 同一份代码放在页面文本框和 `exercises/chNN/demo-*.js`。页面命令写 `node exercises/chNN/demo-名称.js`。
- 项目章要看见页面效果时，把可见部分写在该章 HTML 里，把要验收的计算留成纯函数文件，交给 `check.py`。
- 目标是小程序时，项目章只做能在浏览器里看见的页面。平台工程不在这门课里搭。

## Java

后端和 Java 相关工作走这里。

- 每个练习是单个 `.java` 文件，文件名与类名相同，不写 `package`。
- 页面写明从课程根目录执行：`javac exercises/ch01/Demo.java`，再 `java -cp exercises/ch01 Demo`。`check.py` 会在临时目录编译。
- 不引入 Maven、Spring、IDE 工程。四件套放在 `main` 里跑通，不讲 JVM 内存。
