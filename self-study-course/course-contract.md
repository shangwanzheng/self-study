# 课程合同

未在本文列出的调用，先读本技能 `template/assets/js/course.js` 里的实现。不要另写一套滑块、曲线或 3D 查看器。

## 目录

```text
<课程目录>/
  index.html
  ch01_<slug>.html
  ch02_<slug>.html
  assets/css/course.css
  assets/js/course.js          # CHAPTERS / STAGES / ui / Plot / three
  assets/js/models.js          # 纯计算，无 DOM；续写旧课可仍叫 vmd-models.js
  assets/lib/three.min.js
  assets/lib/OrbitControls.js
  assets/lib/katex/...
```

经典脚本，非 ES Module。全部相对路径。3D 场景默认 Z 轴向上，长度单位在大纲里写死。大纲另有坐标约定时以大纲为准。

运行时全局名在大纲里冻结：新课为 `Course`，续写沿用原名。下文写作 `Course`；实际调用换成该课的全局名。同一门课不要混用两个全局名。

## 注册表

`course.js` 里每章一条，首页和顶栏都读它：

```javascript
{ id: 'ch07', no: 7, stage: 2, file: 'ch07_example.html', title: '…', short: '短名', desc: '…' }
```

`id`、`file`、`Course.initChapter('ch07')` 三者一致。`stage` 对应 `STAGES`。新增章只追加条目，不改已有章的 `id` 与 `file`。

## 页面骨架

章节 `<head>` 顺序固定：charset、viewport、作者元信息（仅当用户指定了作者）、title、katex css、course.css、katex js、auto-render、three、OrbitControls、course.js、本课计算文件、本章 `<style>`。

未指定作者时，不要输出 `meta name="author"`。指定了作者时：

```html
<meta name="author" content="作者名">
```

```html
<main>
  <header class="chapter-hero">
    <div class="kicker">第 7 章 · 对象与结构</div>
    <h1>章标题</h1>
    <p class="subtitle">……</p>
    <div class="meta">
      <span class="chip">作者：作者名</span>
      <span class="chip">预计学习 120 分钟</span>
      <span class="chip">前置：第 2、4 章</span>
      <span class="chip">3D 演示 1 个 · 2D 演示 3 个</span>
    </div>
    <ul class="objectives">
      <li>……</li>
    </ul>
  </header>

  <section class="lesson">
    <h2>7.1 这一节的问题<span class="level l1"></span></h2>
    ...
  </section>

  <section class="lesson" id="c07-pitfalls"><h2>本章避坑清单</h2>
    <ol class="pitfall-summary">...</ol>
  </section>
  <section class="lesson" id="c07-quiz-sec"><h2>自测题</h2><div id="c07-quiz"></div></section>
  <section class="lesson" id="c07-glossary"><h2>术语表</h2>...</section>
  <section class="lesson" id="c07-summary"><h2>本章小结与延伸阅读</h2>...</section>
</main>
<script>Course.initChapter('ch07');</script>
```

未指定作者时，删掉作者那枚 chip，不要留空 chip。

首页不重复章节骨架。指定了作者时，标签放在 `ix-hero` 的导语和按钮之间，只用一枚 chip：

```html
<div class="meta"><span class="chip">作者：作者名</span></div>
```

并有样式：

```css
.ix-hero .meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
```

`.chip` 使用 `course.css` 里的全局样式，不要自绘一套徽章。

## 正文构件

| 类名 | 用途 |
| --- | --- |
| `level l1` / `l2` / `l3` | 小节标题后的入门 / 进阶 / 深入，文字由 CSS 生成 |
| `callout tip` | 要点 |
| `callout pitfall` | 避坑 |
| `callout warn` | 易错 |
| `callout info` | 说明 |
| `callout deep` | 深入 |
| `callout example` | 算例 |
| `demo` + `demo-title` | 交互演示。3D 标题加 `d3` |
| `demo-body` / `demo-view` / `demo-panel` | 左视图右控件 |
| `demo-caption` | 观察要点 |
| `tbl` / `tbl-wrap` | 表格 |
| `summary-box` / `ref-list` | 章末小结与文献 |

callout 结构：`<div class="callout pitfall"><div class="callout-title">短标题</div><p>…</p></div>`。

演示标记：

```html
<div class="demo" id="c07-demo-1">
  <div class="demo-title d3">演示标题<span class="hint">拖动旋转 · 点击后滚轮缩放</span></div>
  <div class="demo-body">
    <div class="demo-view h460" id="c07-v-1"></div>
    <div class="demo-panel" id="c07-p-1"></div>
  </div>
  <div class="demo-caption"><b>观察要点：</b>① … ② …</div>
</div>
```

2D 或分步演示不要加 `d3`，提示文案改成实际操作（拖动滑块、切换步骤）。本章脚本放在 `initChapter` 之后，每个演示一个 IIFE。`h2` 会进入侧栏目录，演示内部标题用 `h4`/`h5`。

## 脚本合同

章节脚本模板（把 `Course` 换成大纲冻结的全局名）：

```javascript
(function () {
  try {
    const T = Course.three, M = Course.math, ui = Course.ui;
    const panel = Course.$('#c07-p-1');
    const v = T.viewer('#c07-v-1', {
      camera: { pos: [2.2, -2.4, 1.4], target: [0, 0, 0.3], fov: 40 },
      grid: { size: 4, step: 0.25 }, axes: 0.4
    });
    v.add(/* Object3D */);
    ui.slider(panel, { label: '参数', min: -8, max: 8, step: 0.1, value: 2, unit: '', onInput() {} });
    ui.readout(panel, [{ key: 'y', label: '结果', unit: '', digits: 2 }]);
  } catch (e) {
    console.error(e);
    Course.errors.push('c07 演示: ' + e.message);
  }
})();
```

常用 API（均挂在运行时全局对象上）：

- `ui.slider(parent, {label,min,max,step,value,unit,digits,format,onInput})` → `{value,set,setRange,disable}`
- `ui.select` / `ui.checkbox` / `ui.button` / `ui.seg` / `ui.readout` / `ui.toast`
- `ui.quiz(parent, [{q, options, answer: 下标或下标数组, explain}])`
- `canvas2d(container, {height, draw(api)})` → `{ctx,w,h,redraw}`
- `loop(fn(dt,t), visibilityEl).start()`
- `new Plot(container, {height,xLabel,yLabel,xRange,yRange,series:[{name,color,data:[[x,y]]}], hlines,vlines})`
- `three.viewer` 返回 `{ok,add,onFrame(fn),setView,resetView,htmlLabel,overlay}`
- `three.link` / `joint` / `arrow` / `axes` / `box` / `wheel` / `label` / `line`
- `tex(tex, display)`、`fmt`、`math`（`deg2rad`、`clamp`、`step`、向量运算）

模板课里的学科计算（车辆悬架、轮胎、整车等）只在该学科的领域包要求时使用。其他课把公式放进 `models.js`。

3D 失败时 `viewer` 自己写入降级说明，章节不要再引入第二个三维库。滚轮缩放要先点击视图，这是查看器既定行为，3D 提示文案保持「拖动旋转 · 点击后滚轮缩放」。

自测题挂到 `#cNN-quiz`，题干和解析里的公式用 `\(...\)`。术语表四列：中文、英文、符号、含义。

## 基准算例

大纲里的那一套数字是全课唯一来源。章节可以引用并写清单位换算，不要改成另一套互相矛盾的数。新增共用公式放进计算文件，保持无 DOM，由父任务修改。

## 编码

UTF-8，无 BOM。章节文件用 LF 或保持该文件原有换行，不要整文件来回改换行。指定作者时，可见字符串用全角冒号：`作者：作者名`。
