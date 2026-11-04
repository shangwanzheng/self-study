# AI Agent自学教程

不署名。运行时 `Course`。进度键 `agent-course-visited`。

基准只在 `assets/js/models.js` 的 `Course.data.agent` 与 `Course.agentMath`。

教学句：上周报销超了：上限 200 元，这单填了 350 元。
超出 = 350 - 200 = 150。
四条规章：考勤、请假、报销、差旅。命中第 3 条。
全文 320 字，每片 80 字，4 片，重叠 0。
问句向量 [3,1,0,0]，四条依次 [0,1,0,0]、[1,0,1,0]、[3,1,0,0]、[0,0,1,1]。
余弦：第 3 条 1，第 1 条 1/sqrt(10)，第 2 条 3/sqrt(20)，第 4 条 0。
topK = 2，所以取第 3 条和第 2 条。
maxSteps = 4。memoryKeep = 3。contextChars = 120。
skillCount = 2，skillLoaded = 1。工具名 lookupClause。

十章对应公开专栏的学习顺序，正文用本课自己的规章和演示，不粘贴专栏原文。
