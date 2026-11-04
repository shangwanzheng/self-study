# 课程合同

未列出的页面行为，先看本技能 `template/` 里的骨架，不要另写一套运行器、流程图或自测。

骨架只用来对标结构。正式课不要保留「先跑通一行」和「结构骨架」。

## 目录

```text
<课程目录>/
  index.html
  ch01_<slug>.html
  assets/css/course.css
  assets/js/course.js
  exercises/check.py
  exercises/data/           # 有基准输入时才放
  exercises/ch01/demo.js    # 以 demo 开头，已能跑通
  exercises/ch01/demo.expect.txt
  exercises/ch01/task.js    # 动手文件不要以 demo 开头
  exercises/ch01/task.expect.txt
  exercises/ch01/solution/task.js
  _draft/outline.md
```

经典脚本，非 ES Module。资源全部相对路径。不要三个点跳出课程目录。

`course.js` 开头固定两处语言标记，两边必须相同：

```javascript
/* language: javascript */
language: "javascript",
```

`python`、`java` 同样写法。一门课只有这一个语言标记。

## 注册表

字段顺序固定，标题里不要用英文单引号：

```javascript
{ id: 'ch01', no: 1, stage: 1, file: 'ch01_goal.html', title: '目标', short: '目标', desc: '跑通标准一句话' }
```

`STAGES` 使用这五篇，短课可以少登记空篇：

```javascript
{ id: 1, title: '目标' },
{ id: 2, title: '四件套' },
{ id: 3, title: '先写清楚' },
{ id: 4, title: '项目' },
{ id: 5, title: '协作与收束' }
```

`id`、文件名、`Course.initChapter('ch01')` 三者一致。新增章只追加条目。

## 大纲

`<课程目录>/_draft/outline.md` 至少包含：

```text
语言：
目标：
痛点项目：
做完的标志：
基准输入：
章：
  ch01  篇  文件名  跑通标准  复刻文件  动手文件  预期输出
```

## 首页

`header.ix-hero` 里写清四件事：

- 目标驱动、边学边练、AI 共生，避开只收藏不跑通。
- 时间感写成 3–6 个月从零到能独立做完这门课的小项目。
- 这门课的痛点项目，以及做完的标志。
- 延伸只留 freeCodeCamp、Exercism、roadmap.sh 这三个名字，不加链接。

章列表用 `<a href="ch01_goal.html">`，链接文字含章名。首页链接和 `CHAPTERS` 一致。

## 章节骨架

```html
<div class="layout">
  <aside class="sidebar" id="sidebar"></aside>
  <div class="content">
    <main>
      <header class="chapter-hero">
        <div class="kicker">第 1 章 · 目标</div>
        <h1>章标题</h1>
        <div class="meta">
          <span class="chip">概念约 10 分钟</span>
          <span class="chip">预计动手 30 分钟</span>
        </div>
      </header>
      <section class="lesson needs-flow" id="c01-s1">
        <h2>1.1 标题</h2>
        <p class="run-goal"><strong>本节要跑通：</strong>……</p>
        <div class="concept"><h3>概念</h3><p>……</p></div>
        <div class="pseudo"><h3>伪代码</h3><ol><li>……</li></ol></div>
        <div id="c01-flow"></div>
        <div class="demo-block">
          <h3>复刻</h3>
          <textarea id="c01-demo-code">与 demo 文件逐字相同</textarea>
          <div class="js-run" data-code="c01-demo-code"></div>
          <p><a href="exercises/ch01/demo.js">exercises/ch01/demo.js</a></p>
          <p class="expect"><strong>预期输出：</strong><code>ok</code></p>
        </div>
        <div class="task">
          <h3>动手</h3>
          <textarea id="c01-task-code">与 task 文件逐字相同</textarea>
          <div class="js-run" data-code="c01-task-code"></div>
          <p><a href="exercises/ch01/task.js">exercises/ch01/task.js</a></p>
          <p class="expect"><strong>预期输出：</strong><code>ready</code></p>
        </div>
      </section>
      <nav class="pager"></nav>
    </main>
  </div>
</div>
<script src="assets/js/course.js"></script>
<script>
Course.initChapter('ch01');
Course.ui.flow('c01-flow', [
  { t: 'action', text: '运行这一行' },
  { t: 'decision', text: '输出是 ok 吗', yes: '去做动手', no: '看报错原文，只改这一行再跑' }
]);
</script>
```

没有分支或循环的节，去掉 `needs-flow`、流程图容器和 `Course.ui.flow`。

Python 和 Java 的练习节不放 `js-run`。在复刻和动手里各写一条从课程根目录执行的命令。

指定了作者时，`head` 里加一条 `<meta name="author" content="作者名">`，页眉只放一枚 `作者：作者名` chip。未指定则两处都不要。

章末四节的 id 以 `pitfalls`、`quiz-sec`、`glossary`、`summary` 结尾。标题分别是「本章避坑清单」「自测题」「术语表」「本章小结」。

自测调用：

```javascript
Course.ui.quiz('c01-quiz', [
  { q: '题目', options: ['甲', '乙'], answer: [1], why: '为什么乙才对，甲错在哪。' }
]);
```

`answer` 多于一个时，页面渲染成多选。

报错练习的原文放在：

```html
<pre class="error-log">原样粘贴的报错</pre>
```

AI 共生块：

```html
<aside class="ai-loop">
  <h3>AI 共生</h3>
  <ol>
    <li>你先写业务逻辑（伪代码已经是你的）</li>
    <li>模型只起草：……</li>
    <li>必须自己重写：……</li>
  </ol>
</aside>
```

概念、伪代码、复刻、动手这四块的 `class` 只用合同里的那一个名字。练习代码放在 `textarea` 里。

## 练习文件

- 复刻文件名以 `demo` 开头，内容已经能打出它的 `.expect.txt`。
- 动手文件名不要以 `demo` 开头，页面上留着待补的那一处。
- 参考解路径是 `exercises/chNN/solution/与动手文件同名`。它的输出对应动手文件旁边的 `.expect.txt`。
- `.expect.txt` 的正文和页面「预期输出」里的文字一致。
- 页面链接的文字就是路径，例如 `exercises/ch01/demo.js`。
- 练习从课程根目录运行。读数据时用 `exercises/data/...`。
- Java 不写 `package`。JavaScript 四件套不写 DOM，保证 `node` 与页面运行器输出一致。

`exercises/check.py` 从模板复制。默认只跑 `demo` 文件。`python exercises/check.py --solution` 只跑 `solution/`。不要改比较逻辑。

## 运行时

`Course.initChapter(id)` 填充侧栏、上一章 / 下一章，并给每个 `.js-run` 接上「运行」。

`Course.ui.flow(id, steps)` 的 `t` 只有 `action`（矩形）和 `decision`（菱形，带 `yes` / `no`）。

`Course.ui.quiz(id, items)` 提交后显示解析，并写上答对几题。

章节专用样式写在该章 `<style>` 里，类名以章号为前缀（`c01-`）。共用外观在 `course.css`，不要为了一章去改它。
