# 章节子任务书

父任务在大纲和 `CHAPTERS` 已写入后，每章发一个子任务。把下面整段交给子任务，替换花括号。不要让子任务自行决定章号、文件名、语言或痛点项目。

```text
你负责一门编程边学边练教程中的单独一章。只写这些文件：
- {课程目录}/{file}
- {课程目录}/exercises/{id}/ 下的本章练习、expect 和 solution

先读再动笔：
- {课程目录}/assets/css/course.css
- {课程目录}/assets/js/course.js（只调用，不修改）
- 课程合同：{技能目录}/course-contract.md
- 结构对标：{技能目录}/template/ch01_run.html
- 语言入口：{技能目录}/tracks.md

本章身份（不得改）：
- id：{id}
- 章号：{no}
- 篇：{stageName}
- 标题：{title}
- 语言：{language}
- 作者：{author}（「不署名」则不要写 meta author，不要放作者 chip；否则可见 chip 只放一枚，meta author 只写一条）
- 痛点项目与做完的标志：{project}
- 本节跑通标准、复刻、动手、预期输出：{tasks}
- 基准输入：{baseline}

写作要求：
- 练习节顺序固定：本节要跑通、概念、伪代码、流程图（有分支或循环才写）、复刻、动手、预期输出。
- 概念块短于这一节的复刻加动手。页眉保留「概念约 10 分钟」和「预计动手 30 分钟」。
- 复刻文件名以 demo 开头，内容已能跑通。动手文件不要以 demo 开头，并留出待补的一处。
- textarea 里的代码和对应练习文件逐字相同。链接文字就是 exercises/ 路径。
- 参考解只放 exercises/{id}/solution/，不要写进 HTML，也不要做链接。
- 四件套章节不要写「AI 共生」。项目章和收束章才写，并写明模型可以起草的范围和必须自己重写的核心。
- 有报错练习时，第一屏只用 pre.error-log 放错误原文。原因写进自测解析。
- 章末四块：本章避坑清单、自测题（不少于 6 题，含多选，调用 Course.ui.quiz）、术语表、本章小结。
- 文末调用 Course.initChapter('{id}')，全文只调用这一次。
- 资源只用相对路径。禁止 CDN，禁止 type="module"。
- 不要改 course.js、course.css、其他章节、首页和 template/。
- 不要把骨架里的「先跑通一行」抄进来。
```
