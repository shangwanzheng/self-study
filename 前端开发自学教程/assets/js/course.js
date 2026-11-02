/* 前端开发自学教程 · 公共脚本 course.js
 * 纯原生 JS（经典脚本，非 ES Module），file:// 离线直接打开可用。
 * 3D 功能依赖先加载：assets/lib/three.min.js（r147）与 assets/lib/OrbitControls.js。
 * 全局命名空间：window.Course
 */
(function (global) {
  'use strict';
  const Course = (global.Course = global.Course || {});
  Course.version = '1.0.0';
  Course.errors = [];
  const hasDOM = typeof document !== 'undefined';
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('error', (e) => { Course.errors.push(String((e && e.message) || e)); });
    window.addEventListener('unhandledrejection', (e) => { Course.errors.push('Promise: ' + String(e && e.reason)); });
  }

  /* ------------------------------------------------------------------ 章节注册表 */
  Course.COURSE_NAME = '前端开发自学教程';
  Course.CHAPTERS = [
    { id: 'ch01', no: 1, stage: 1, file: 'ch01_skill_map.html', title: '技能模型与教学订单页', short: '订单页', desc: '中级要独立完成的页面、同一笔教学订单的字段，以及刷新后还留下什么。' },
    { id: 'ch02', no: 2, stage: 1, file: 'ch02_browser_runtime.html', title: '浏览器：一帧、事件循环与一次加载', short: '浏览器', desc: '进程与主线程、宏任务与微任务、页面生命周期，以及 DNS 到同源策略。' },
    { id: 'ch03', no: 3, stage: 2, file: 'ch03_js_values.html', title: '类型、数字、作用域与对象', short: '类型与对象', desc: '相等与空值合并、安全整数、闭包与 this，以及不可变更新。' },
    { id: 'ch04', no: 4, stage: 2, file: 'ch04_async_modules.html', title: '异步、模块与页面上的结构', short: '异步与模块', desc: 'Promise、漏写 await、模块边界，以及 Map、树和渲染路径上的复杂度。' },
    { id: 'ch05', no: 5, stage: 2, file: 'ch05_typescript.html', title: 'TypeScript：类型在打包后不存在', short: '类型', desc: '联合与收窄、泛型、tsconfig，以及 as 不能代替运行时校验。' },
    { id: 'ch06', no: 6, stage: 3, file: 'ch06_ui_framework.html', title: '组件、状态、副作用与路由', short: '组件', desc: '函数组件、列表 key、useState 与 useEffect，以及状态放在哪一层。' },
    { id: 'ch07', no: 7, stage: 3, file: 'ch07_style_request_build.html', title: '样式、请求契约与工程化', short: '请求与构建', desc: '盒模型与局部样式、旧响应、跨域凭据、lock 和环境变量。' },
    { id: 'ch08', no: 8, stage: 4, file: 'ch08_quality.html', title: '排错、测试与协作', short: '质量', desc: '把现象缩到文件、组件测试替换请求，以及安装到构建的检查。' },
    { id: 'ch09', no: 9, stage: 4, file: 'ch09_architecture.html', title: '架构、性能、安全与发布', short: '架构与发布', desc: '首屏分包、虚拟列表、两层缓存、XSS 与凭据，以及旧包和回滚。' },
    { id: 'ch10', no: 10, stage: 5, file: 'ch10_practice.html', title: '把教学订单页做完并排错', short: '实战避坑', desc: '一条可交付的页面闭环，以及把前面各章的坑收成一张清单。' },
  ];
  Course.STAGES = [
    { no: 1, name: '共同语言', desc: '用同一笔教学订单页对齐技能模型和浏览器' },
    { no: 2, name: '对象与结构', desc: 'JavaScript、模块、复杂度和 TypeScript 的边界' },
    { no: 3, name: '方法', desc: '把组件、样式、请求和构建做成一页' },
    { no: 4, name: '现象与判断', desc: '从排错、测试、性能、安全和发布判断对错' },
    { no: 5, name: '实战', desc: '交付教学订单页，并收成避坑清单' },
  ];
  Course.chapter = (id) => Course.CHAPTERS.find((c) => c.id === id) || null;

  /* ------------------------------------------------------------------ 存储/DOM/格式化 */
  const store = {
    get(k, d) { try { const v = global.localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { global.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* file:// 下可能不可用 */ } },
  };
  Course.store = store;

  function $(sel, root) { return typeof sel === 'string' ? (root || document).querySelector(sel) : sel; }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children !== undefined && children !== null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c === null || c === undefined || c === false) return;
        el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return el;
  }
  Course.$ = $; Course.$$ = $$; Course.h = h;

  Course.fmt = function (v, d) {
    if (v === null || v === undefined || typeof v !== 'number' || !isFinite(v)) return '—';
    const digits = d === undefined ? 2 : d;
    let s = v.toFixed(digits);
    if (/^-0(\.0+)?$/.test(s)) s = s.slice(1);
    return s;
  };

  /* ------------------------------------------------------------------ 主题 */
  Course.theme = {
    get() { return document.documentElement.getAttribute('data-theme') || 'light'; },
    set(t) {
      document.documentElement.setAttribute('data-theme', t);
      store.set('java-course-theme', t);
      global.dispatchEvent(new CustomEvent('java-course-theme', { detail: t }));
    },
    toggle() { this.set(this.get() === 'dark' ? 'light' : 'dark'); },
    init() { document.documentElement.setAttribute('data-theme', store.get('java-course-theme', 'light') || 'light'); },
  };
  Course.cssVar = (name, el) => getComputedStyle(el || document.documentElement).getPropertyValue(name).trim();
  if (hasDOM) Course.theme.init();

  /* ------------------------------------------------------------------ 章节框架 */
  Course.initChapter = function (id, opts) {
    opts = opts || {};
    const list = Course.CHAPTERS;
    const idx = list.findIndex((c) => c.id === id);
    const ch = list[idx] || { no: '', title: document.title };
    const prev = idx > 0 ? list[idx - 1] : null;
    const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
    const main = $('main');
    if (!main) { console.warn('[Course] 页面缺少 <main>'); return; }
    document.body.classList.add('vmd');
    main.classList.add('content');

    const themeBtn = h('button', { class: 'icon-btn', type: 'button', title: '切换明暗主题' }, '明/暗');
    themeBtn.addEventListener('click', () => Course.theme.toggle());
    const menuBtn = h('button', { class: 'icon-btn menu-btn', type: 'button', title: '目录' }, '目录');
    menuBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
    const navBtn = (c, label) => c
      ? h('a', { class: 'nav-btn', href: c.file, title: '第' + c.no + '章 ' + c.title }, label)
      : h('span', { class: 'nav-btn disabled' }, label);
    const top = h('header', { class: 'vmd-topbar' }, [
      menuBtn,
      h('a', { class: 'brand', href: 'index.html', title: '返回课程首页' }, [h('span', { class: 'logo' }, 'FE'), h('span', { class: 'txt' }, Course.COURSE_NAME)]),
      h('div', { class: 'chapter-name' }, ch.no ? '第 ' + ch.no + ' 章 · ' + ch.title : ch.title),
      h('div', { class: 'actions' }, [navBtn(prev, '上一章'), h('a', { class: 'nav-btn', href: 'index.html' }, '目录'), navBtn(next, '下一章'), themeBtn]),
    ]);
    const progress = h('div', { class: 'vmd-progress' });

    const layout = h('div', { class: 'vmd-layout' });
    const sidebar = h('nav', { class: 'vmd-sidebar' });
    const mainWrap = h('div', { class: 'vmd-main' });
    main.parentNode.insertBefore(layout, main);
    layout.appendChild(sidebar);
    layout.appendChild(mainWrap);
    mainWrap.appendChild(main);
    document.body.insertBefore(progress, document.body.firstChild);
    document.body.insertBefore(top, document.body.firstChild);

    // 本章目录
    const heads = $$('h2, h3', main).filter((el) => !el.closest('.demo, .quiz, .tabs, .no-toc, .chapter-hero') && !el.classList.contains('no-toc'));
    heads.forEach((el, i) => { if (!el.id) el.id = 'sec-' + (i + 1); });
    const toc = h('div', { class: 'toc' });
    heads.forEach((el) => {
      toc.appendChild(h('a', { href: '#' + el.id, class: el.tagName === 'H3' ? 'h3' : 'h2', 'data-target': el.id }, el.textContent.trim()));
    });
    sidebar.appendChild(h('h4', null, '本章目录'));
    sidebar.appendChild(toc);
    // 全部章节
    const visited = store.get('java-course-visited', {}) || {};
    if (ch.id) { visited[ch.id] = Date.now(); store.set('java-course-visited', visited); }
    const det = h('details', { open: !!opts.openChapters });
    det.appendChild(h('summary', null, '全部章节'));
    const cl = h('div', { class: 'chap-list' });
    cl.appendChild(h('a', { href: 'index.html' }, [h('span', { class: 'no' }, '⌂'), '课程首页']));
    list.forEach((c) => {
      cl.appendChild(h('a', { href: c.file, class: (c.id === ch.id ? 'current ' : '') + (visited[c.id] ? 'visited' : '') },
        [h('span', { class: 'no' }, String(c.no).padStart(2, '0')), c.short]));
    });
    det.appendChild(cl);
    sidebar.appendChild(det);
    sidebar.addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('sidebar-open'); });

    // 章末导航
    if (!opts.noFooterNav) {
      const navEl = h('nav', { class: 'chapter-nav' }, [
        prev ? h('a', { class: 'prev', href: prev.file }, [h('small', null, '上一章'), '第' + prev.no + '章 ' + prev.title]) : h('span', { class: 'placeholder' }),
        h('a', { class: 'home', href: 'index.html' }, '课程目录'),
        next ? h('a', { class: 'next', href: next.file }, [h('small', null, '下一章'), '第' + next.no + '章 ' + next.title]) : h('span', { class: 'placeholder' }),
      ]);
      main.appendChild(navEl);
    }
    const backTop = h('button', { class: 'back-top', type: 'button', title: '回到顶部' }, '↑');
    backTop.addEventListener('click', () => global.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(backTop);

    // 滚动：进度条 + 目录高亮
    const links = $$('a', toc);
    let ticking = false;
    function onScroll() {
      ticking = false;
      const st = global.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - global.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, (st / max) * 100) : 0) + '%';
      backTop.classList.toggle('show', st > 600);
      let cur = null;
      const lim = (parseFloat(Course.cssVar('--topbar-h')) || 54) + 60;
      for (const el of heads) { if (el.getBoundingClientRect().top <= lim) cur = el; else break; }
      links.forEach((a) => a.classList.toggle('active', !!cur && a.dataset.target === cur.id));
    }
    global.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    if (!document.title && ch.title) document.title = '第' + ch.no + '章 ' + ch.title;
    Course.ui.initTabs(document);
    // 章节脚本同步生成的内容（自测题、表格等）也要渲染公式，所以推迟到本轮脚本结束后
    setTimeout(() => Course.renderMath(document.body), 0);
    return ch;
  };

  /* ------------------------------------------------------------------ 公式（KaTeX，离线） */
  /** 渲染 root 内的 \( 行内 \) 与 \[ 行间 \] 公式；可重复调用（已渲染部分会跳过） */
  Course.renderMath = function (root) {
    const el = root ? $(root) : document.body;
    if (!el || typeof global.renderMathInElement !== 'function') return false;
    try {
      global.renderMathInElement(el, {
        delimiters: [
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
        throwOnError: false,
        strict: false,
        ignoredClasses: ['no-math', 'katex', 'vmd-3d'],
      });
      return true;
    } catch (e) {
      console.warn('[Course] 公式渲染失败', e);
      return false;
    }
  };
  /** TeX → HTML 字符串（用于 JS 动态拼接的读数、提示等）；KaTeX 不可用时退化为 <code> */
  Course.tex = function (tex, display) {
    if (global.katex) {
      try { return global.katex.renderToString(tex, { throwOnError: false, strict: false, displayMode: !!display }); } catch (e) { /* 退化 */ }
    }
    return '<code>' + String(tex).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</code>';
  };

  /* ------------------------------------------------------------------ UI 组件 */
  const ui = (Course.ui = {});
  function guessDigits(step) {
    if (!step || step === 'any') return 2;
    const s = String(step);
    if (s.indexOf('e-') >= 0) return parseInt(s.split('e-')[1], 10);
    const p = s.split('.')[1];
    return p ? p.length : 0;
  }
  /** 滑块：o = {label, min, max, step, value, unit, digits, format(v), onInput(v)} */
  ui.slider = function (parent, o) {
    const row = h('div', { class: 'ctrl-row' });
    const name = h('span', null, o.label || '');
    const val = h('b');
    const lab = h('div', { class: 'ctrl-label' }, [name, val]);
    const step = o.step !== undefined ? o.step : (o.max - o.min) / 100;
    const inp = h('input', { type: 'range', min: o.min, max: o.max, step: step, value: o.value });
    row.append(lab, inp);
    $(parent).appendChild(row);
    const digits = o.digits !== undefined ? o.digits : guessDigits(step);
    const fmt = o.format || ((v) => Course.fmt(v, digits) + (o.unit ? ' ' + o.unit : ''));
    const api = {
      el: row, input: inp,
      get value() { return parseFloat(inp.value); },
      set(v, silent) { inp.value = v; show(); if (!silent && o.onInput) o.onInput(api.value); return api; },
      setLabel(t) { name.textContent = t; return api; },
      setRange(min, max) { inp.min = min; inp.max = max; show(); return api; },
      disable(b) { inp.disabled = !!b; return api; },
    };
    function show() { val.textContent = fmt(parseFloat(inp.value)); }
    inp.addEventListener('input', () => { show(); if (o.onInput) o.onInput(api.value); });
    show();
    return api;
  };
  /** 下拉框：o = {label, options:[{value,label}]|[string], value, onChange(v)} */
  ui.select = function (parent, o) {
    const row = h('div', { class: 'ctrl-row' });
    if (o.label) row.appendChild(h('div', { class: 'ctrl-label' }, [h('span', null, o.label)]));
    const sel = h('select');
    (o.options || []).forEach((op) => {
      const v = typeof op === 'object' ? op.value : op;
      const t = typeof op === 'object' ? op.label : op;
      sel.appendChild(h('option', { value: v }, t));
    });
    if (o.value !== undefined) sel.value = o.value;
    row.appendChild(sel);
    $(parent).appendChild(row);
    sel.addEventListener('change', () => o.onChange && o.onChange(sel.value));
    return { el: row, select: sel, get value() { return sel.value; }, set(v, silent) { sel.value = v; if (!silent && o.onChange) o.onChange(sel.value); } };
  };
  /** 复选框：o = {label, checked, onChange(bool)} */
  ui.checkbox = function (parent, o) {
    const inp = h('input', { type: 'checkbox' });
    inp.checked = !!o.checked;
    const lab = h('label', { class: 'ctrl-check' }, [inp, h('span', null, o.label || '')]);
    $(parent).appendChild(lab);
    inp.addEventListener('change', () => o.onChange && o.onChange(inp.checked));
    return { el: lab, input: inp, get value() { return inp.checked; }, set(b, silent) { inp.checked = !!b; if (!silent && o.onChange) o.onChange(inp.checked); } };
  };
  /** 按钮：o = {label, onClick, primary} */
  ui.button = function (parent, o) {
    const b = h('button', { class: 'btn' + (o.primary ? ' primary' : ''), type: 'button' }, o.label || '');
    b.addEventListener('click', (e) => o.onClick && o.onClick(e));
    $(parent).appendChild(b);
    return b;
  };
  /** 分段按钮：o = {options:[{value,label}], value, onChange(v)} */
  ui.seg = function (parent, o) {
    const wrap = h('div', { class: 'seg' });
    const btns = (o.options || []).map((op) => {
      const v = typeof op === 'object' ? op.value : op;
      const b = h('button', { type: 'button', 'data-v': v }, typeof op === 'object' ? op.label : op);
      b.addEventListener('click', () => api.set(v));
      wrap.appendChild(b);
      return b;
    });
    $(parent).appendChild(wrap);
    let cur = o.value !== undefined ? o.value : (btns[0] && btns[0].dataset.v);
    const api = {
      el: wrap,
      get value() { return cur; },
      set(v, silent) { cur = v; btns.forEach((b) => b.classList.toggle('active', String(b.dataset.v) === String(v))); if (!silent && o.onChange) o.onChange(v); },
    };
    api.set(cur, true);
    return api;
  };
  /** 读数面板：items = [{key,label,unit,digits}] */
  ui.readout = function (parent, items) {
    const box = h('div', { class: 'readout' });
    const map = {};
    items.forEach((it) => {
      const k = h('span', { class: 'k' }, it.label);
      const v = h('span', { class: 'v' }, '—');
      box.append(k, v);
      map[it.key] = { it, v };
    });
    $(parent).appendChild(box);
    return {
      el: box,
      set(key, value, cls) {
        const m = map[key];
        if (!m) return;
        m.v.textContent = typeof value === 'number'
          ? Course.fmt(value, m.it.digits !== undefined ? m.it.digits : 2) + (m.it.unit ? ' ' + m.it.unit : '')
          : String(value);
        m.v.className = 'v' + (cls ? ' ' + cls : '');
      },
      setAll(obj) { for (const k in obj) this.set(k, obj[k]); },
    };
  };
  ui.toast = function (msg, ms) {
    let el = $('.vmd-toast');
    if (!el) { el = h('div', { class: 'vmd-toast' }); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), ms || 1800);
  };
  /** 标签页：<div class="tabs"><div class="tab-nav"><button data-tab="a">…</button></div><div class="tab-panel" data-panel="a">…</div></div> */
  ui.initTabs = function (root) {
    $$('.tabs', root).forEach((tabs) => {
      if (tabs.dataset.inited) return;
      tabs.dataset.inited = '1';
      const nav = Array.from(tabs.children).find((c) => c.classList.contains('tab-nav'));
      const btns = nav ? Array.from(nav.querySelectorAll('button')) : [];
      const panels = Array.from(tabs.children).filter((c) => c.classList.contains('tab-panel'));
      const show = (b) => {
        btns.forEach((x) => x.classList.toggle('active', x === b));
        panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === b.dataset.tab));
        global.dispatchEvent(new Event('resize'));
      };
      btns.forEach((b) => b.addEventListener('click', () => show(b)));
      const act = btns.find((b) => b.classList.contains('active')) || btns[0];
      if (act) show(act);
    });
  };
  /** 自测题：questions = [{q, options:[...], answer: 下标 | [下标...], explain}] */
  ui.quiz = function (parent, questions) {
    const root = $(parent);
    root.classList.add('quiz');
    let answered = 0, correct = 0;
    const scoreEl = h('div', { class: 'q-score' }, '已答 0 / ' + questions.length);
    questions.forEach((q, qi) => {
      const multi = Array.isArray(q.answer);
      const ans = multi ? q.answer.slice().sort((a, b) => a - b) : [q.answer];
      const item = h('div', { class: 'q-item' });
      item.appendChild(h('div', { class: 'q-head', html: '<span class="q-type">' + (multi ? '多选' : '单选') + '</span>' + (qi + 1) + '. ' + q.q }));
      const name = 'q' + Math.random().toString(36).slice(2);
      const opts = q.options.map((t, oi) => {
        const inp = h('input', { type: multi ? 'checkbox' : 'radio', name: name, value: oi });
        const lab = h('label', { class: 'q-opt' }, [inp, h('span', { html: String.fromCharCode(65 + oi) + '. ' + t })]);
        item.appendChild(lab);
        return { lab, inp };
      });
      const btn = h('button', { class: 'btn primary', type: 'button' }, '提交');
      const res = h('span', { class: 'q-result' });
      item.appendChild(h('div', { class: 'q-foot' }, [btn, res]));
      item.appendChild(h('div', { class: 'q-explain', html: '<b>解析：</b>' + (q.explain || '') }));
      btn.addEventListener('click', () => {
        const chosen = opts.map((o, i) => (o.inp.checked ? i : -1)).filter((i) => i >= 0);
        if (!chosen.length) { ui.toast('请先选择答案'); return; }
        const ok = chosen.length === ans.length && chosen.every((c, i) => c === ans[i]);
        opts.forEach((o, i) => {
          o.lab.classList.toggle('correct', ans.indexOf(i) >= 0);
          o.lab.classList.toggle('wrong', chosen.indexOf(i) >= 0 && ans.indexOf(i) < 0);
          o.inp.disabled = true;
        });
        res.textContent = ok ? '回答正确' : '回答错误';
        res.className = 'q-result ' + (ok ? 'ok' : 'no');
        item.classList.add('done');
        btn.disabled = true;
        answered++;
        if (ok) correct++;
        scoreEl.textContent = '已答 ' + answered + ' / ' + questions.length + '，答对 ' + correct + ' 题' +
          (answered === questions.length ? '（正确率 ' + Math.round((100 * correct) / questions.length) + '%）' : '');
      });
      root.appendChild(item);
    });
    root.appendChild(scoreEl);
    Course.renderMath(root);
    return { el: root };
  };

  /* ------------------------------------------------------------------ 数学工具 */
  const M = (Course.math = {});
  M.DEG = Math.PI / 180;
  M.deg2rad = (d) => d * M.DEG;
  M.rad2deg = (r) => r / M.DEG;
  M.clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  M.lerp = (a, b, t) => a + (b - a) * t;
  M.sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  M.linspace = (a, b, n) => { const r = []; for (let i = 0; i < n; i++) r.push(n === 1 ? a : a + ((b - a) * i) / (n - 1)); return r; };
  M.range = (a, b, step) => { const r = []; const n = Math.floor((b - a) / step + 1e-9); for (let i = 0; i <= n; i++) r.push(a + i * step); return r; };
  // 三维向量（数组 [x,y,z]）
  M.add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  M.sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  M.scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  M.addScaled = (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
  M.dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  M.cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  M.norm = (a) => Math.sqrt(M.dot(a, a));
  M.normalize = (a) => { const n = M.norm(a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  M.dist = (a, b) => M.norm(M.sub(a, b));
  M.mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  // 3x3 矩阵（行主序二维数组）
  M.I3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  M.matVec = (R, v) => [M.dot(R[0], v), M.dot(R[1], v), M.dot(R[2], v)];
  M.matMul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
  M.transpose = (A) => [[A[0][0], A[1][0], A[2][0]], [A[0][1], A[1][1], A[2][1]], [A[0][2], A[1][2], A[2][2]]];
  M.rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
  M.rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
  M.rotZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
  /** 旋转向量 → 旋转矩阵（Rodrigues 公式），th = 轴 × 角(rad) */
  M.rodrigues = function (th) {
    const a = M.norm(th);
    if (a < 1e-12) return [[1, -th[2], th[1]], [th[2], 1, -th[0]], [-th[1], th[0], 1]];
    const x = th[0] / a, y = th[1] / a, z = th[2] / a, c = Math.cos(a), s = Math.sin(a), C = 1 - c;
    return [
      [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
      [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
      [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
    ];
  };
  /** 高斯消元（列主元）解 A x = b；奇异返回 null。不修改输入。 */
  M.solveLinear = function (A, b) {
    const n = b.length;
    const Mx = A.map((r, i) => r.slice().concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r;
      if (Math.abs(Mx[p][c]) < 1e-14) return null;
      if (p !== c) { const t = Mx[c]; Mx[c] = Mx[p]; Mx[p] = t; }
      for (let r = c + 1; r < n; r++) {
        const f = Mx[r][c] / Mx[c][c];
        if (f === 0) continue;
        for (let k = c; k <= n; k++) Mx[r][k] -= f * Mx[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = Mx[r][n];
      for (let k = r + 1; k < n; k++) s -= Mx[r][k] * x[k];
      x[r] = s / Mx[r][r];
    }
    return x;
  };
  M.invert = function (A) {
    const n = A.length, cols = [];
    for (let j = 0; j < n; j++) {
      const e = new Array(n).fill(0); e[j] = 1;
      const x = M.solveLinear(A, e);
      if (!x) return null;
      cols.push(x);
    }
    return A.map((_, i) => cols.map((c) => c[i]));
  };
  /** 牛顿-拉夫逊（数值雅可比）。F(x) 返回残差数组（与 x 同维）。 */
  M.newton = function (F, x0, o) {
    o = Object.assign({ tol: 1e-10, maxIter: 40, h: 1e-7 }, o || {});
    let x = x0.slice();
    let f = F(x), err = Math.max.apply(null, f.map(Math.abs));
    for (let it = 0; it < o.maxIter; it++) {
      if (err < o.tol) return { x, ok: true, iter: it, err };
      const n = x.length, J = [];
      for (let i = 0; i < f.length; i++) J.push(new Array(n).fill(0));
      for (let j = 0; j < n; j++) {
        const hj = o.h * Math.max(1, Math.abs(x[j]));
        const xp = x.slice(); xp[j] += hj;
        const fp = F(xp);
        for (let i = 0; i < f.length; i++) J[i][j] = (fp[i] - f[i]) / hj;
      }
      const dx = M.solveLinear(J, f.map((v) => -v));
      if (!dx) return { x, ok: false, iter: it, err, singular: true };
      x = x.map((v, i) => v + dx[i]);
      f = F(x);
      err = Math.max.apply(null, f.map(Math.abs));
    }
    return { x, ok: err < o.tol * 100, iter: o.maxIter, err };
  };
  /** 经典四阶龙格-库塔：f(t, y) 返回 dy/dt 数组 */
  M.rk4 = function (f, t, y, hh) {
    const k1 = f(t, y);
    const k2 = f(t + hh / 2, y.map((v, i) => v + (hh / 2) * k1[i]));
    const k3 = f(t + hh / 2, y.map((v, i) => v + (hh / 2) * k2[i]));
    const k4 = f(t + hh, y.map((v, i) => v + hh * k3[i]));
    return y.map((v, i) => v + (hh / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  };
  /** 最小二乘直线拟合 y = k x + b */
  M.linfit = function (xs, ys) {
    const n = xs.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
    for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
    const d = n * sxx - sx * sx;
    const k = d ? (n * sxy - sx * sy) / d : 0;
    const b = (sy - k * sx) / (n || 1);
    const ssTot = syy - (sy * sy) / (n || 1);
    let ssRes = 0;
    for (let i = 0; i < n; i++) { const e = ys[i] - (k * xs[i] + b); ssRes += e * e; }
    return { k, b, r2: ssTot > 0 ? 1 - ssRes / ssTot : 1 };
  };
  /** 多项式拟合，返回系数 [c0, c1, ..., cn]（低次在前） */
  M.polyfit = function (xs, ys, order) {
    const m = order + 1, A = [], b = [];
    for (let i = 0; i < m; i++) {
      A.push(new Array(m).fill(0)); b.push(0);
    }
    for (let k = 0; k < xs.length; k++) {
      const p = [1];
      for (let i = 1; i < 2 * m; i++) p.push(p[i - 1] * xs[k]);
      for (let i = 0; i < m; i++) { b[i] += p[i] * ys[k]; for (let j = 0; j < m; j++) A[i][j] += p[i + j]; }
    }
    return M.solveLinear(A, b) || new Array(m).fill(0);
  };
  M.polyval = (c, x) => c.reduceRight((acc, ci) => acc * x + ci, 0);
  /** 线性插值（xs 升序，超界取端点值） */
  M.interp1 = function (xs, ys, x) {
    const n = xs.length;
    if (!n) return NaN;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (xs[mid] <= x) lo = mid; else hi = mid; }
    const t = (x - xs[lo]) / (xs[hi] - xs[lo] || 1);
    return ys[lo] + (ys[hi] - ys[lo]) * t;
  };
  M.deriv = function (xs, ys) {
    const n = xs.length, d = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      d[i] = (ys[b] - ys[a]) / (xs[b] - xs[a] || 1);
    }
    return d;
  };
  /** ADAMS 风格 STEP 函数（三次多项式平滑过渡）：x≤x0→h0，x≥x1→h1 */
  M.step = function (x, x0, h0, x1, h1) {
    if (x <= x0) return h0;
    if (x >= x1) return h1;
    const s = (x - x0) / (x1 - x0);
    return h0 + (h1 - h0) * s * s * (3 - 2 * s);
  };
  M.niceNum = function (range, round) {
    const exp = Math.floor(Math.log10(range || 1));
    const f = range / Math.pow(10, exp);
    let nf;
    if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
    else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return nf * Math.pow(10, exp);
  };
  M.niceTicks = function (min, max, count) {
    if (!(max > min)) { max = min + 1; }
    const range = M.niceNum(max - min, false);
    const step = M.niceNum(range / Math.max(1, (count || 6) - 1), true);
    const start = Math.ceil(min / step - 1e-9) * step;
    const ticks = [];
    for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Math.abs(v) < step * 1e-9 ? 0 : v);
    return { ticks, step };
  };

  /* ------------------------------------------------------------------ 2D 画布与动画循环 */
  /** 创建自适应 DPR 的 2D 画布：o = {height, draw(api)}；api.draw 在尺寸/主题变化时自动调用 */
  Course.canvas2d = function (container, o) {
    o = o || {};
    const el = $(container);
    const cv = h('canvas');
    cv.style.display = 'block';
    cv.style.width = '100%';
    el.appendChild(cv);
    const ctx = cv.getContext('2d');
    const api = { el, canvas: cv, ctx, w: 0, h: 0, dpr: 1, draw: o.draw || null };
    function resize() {
      const w = el.clientWidth;
      const hh = o.height || el.clientHeight || 300;
      if (!w) return;
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      if (api.w === w && api.h === hh && api.dpr === dpr) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(hh * dpr);
      cv.style.height = hh + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      api.w = w; api.h = hh; api.dpr = dpr;
      if (api.draw) api.draw(api);
    }
    api.resize = resize;
    api.redraw = () => { if (api.draw && api.w) api.draw(api); };
    api.clear = function (bg) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height); } else ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.restore();
    };
    if (global.ResizeObserver) new ResizeObserver(resize).observe(el);
    global.addEventListener('java-course-theme', () => api.redraw());
    resize();
    return api;
  };
  /** requestAnimationFrame 循环；el 不在视口内时暂停。fn(dt, t) */
  Course.loop = function (fn, el) {
    let running = false, last = 0, t = 0, visible = true;
    function tick(now) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (visible && !document.hidden) {
        t += dt;
        try { fn(dt, t); } catch (e) { running = false; console.error(e); Course.errors.push(String(e)); return; }
      }
      requestAnimationFrame(tick);
    }
    if (el && global.IntersectionObserver) {
      new IntersectionObserver((es) => { visible = es[es.length - 1].isIntersecting; }).observe($(el));
    }
    return {
      start() { if (running) return this; running = true; last = 0; requestAnimationFrame(tick); return this; },
      stop() { running = false; return this; },
      reset() { t = 0; return this; },
      get running() { return running; },
      get t() { return t; },
    };
  };

  /* ------------------------------------------------------------------ 2D 曲线绘图 */
  const PALETTE = ['#2f6fed', '#e8590c', '#2b8a3e', '#c2255c', '#7048e8', '#0c8599', '#e67700', '#5c677d'];
  Course.COLORS = PALETTE;
  /**
   * new Course.Plot(container, {
   *   height, title, xLabel, yLabel, xRange:[a,b]|null, yRange:[a,b]|null, equal:false, legend:true, grid:true, crosshair:true,
   *   series:[{name, color, data:[[x,y],...] 或 {x:[],y:[]}, width, dash:[6,4], points:false|半径, visible, fill:false}],
   *   vlines:[{x,color,dash,label}], hlines:[{y,...}], markers:[{x,y,color,r,label}], bands:[{x0,x1,color}|{y0,y1,color}], texts:[{x,y,text,color,align}]
   * })
   */
  class Plot {
    constructor(container, o) {
      this.el = $(container);
      this.o = Object.assign({
        height: 260, title: '', xLabel: '', yLabel: '', xRange: null, yRange: null, equal: false,
        legend: true, grid: true, crosshair: true, pad: { l: 60, r: 16, t: 18, b: 42 },
        series: [], vlines: [], hlines: [], markers: [], bands: [], texts: [], xTickFormat: null, yTickFormat: null,
      }, o || {});
      this.wrap = h('div', { class: 'vmd-plot' });
      this.cv = h('canvas');
      this.tip = h('div', { class: 'plot-tip' });
      this.leg = h('div', { class: 'plot-legend' });
      this.wrap.append(this.cv, this.tip);
      if (this.o.legend) this.wrap.appendChild(this.leg);
      this.el.appendChild(this.wrap);
      this.ctx = this.cv.getContext('2d');
      this.mouse = null;
      this._raf = 0;
      if (global.ResizeObserver) new ResizeObserver(() => this.render()).observe(this.wrap);
      global.addEventListener('java-course-theme', () => this.render());
      this.cv.addEventListener('mousemove', (e) => {
        const r = this.cv.getBoundingClientRect();
        this.mouse = [e.clientX - r.left, e.clientY - r.top];
        this._dirty();
      });
      this.cv.addEventListener('mouseleave', () => { this.mouse = null; this.tip.style.display = 'none'; this._dirty(); });
      this._buildLegend();
      this.render();
    }
    setSeries(series) { this.o.series = series || []; this._buildLegend(); this.render(); return this; }
    setData(i, data) { if (this.o.series[i]) { this.o.series[i].data = data; this._dirty(); } return this; }
    set(opts) { Object.assign(this.o, opts || {}); if (opts && opts.series) this._buildLegend(); this.render(); return this; }
    addPoint(i, x, y, max) {
      const s = this.o.series[i];
      if (!s) return this;
      if (!Array.isArray(s.data)) s.data = this._pts(s.data);
      s.data.push([x, y]);
      if (max && s.data.length > max) s.data.splice(0, s.data.length - max);
      this._dirty();
      return this;
    }
    clear() { this.o.series.forEach((s) => { s.data = []; }); this.render(); return this; }
    _dirty() { if (this._raf) return; this._raf = requestAnimationFrame(() => { this._raf = 0; this.render(); }); }
    _pts(d) {
      if (!d) return [];
      if (Array.isArray(d)) return d;
      if (d.x && d.y) { const r = []; const n = Math.min(d.x.length, d.y.length); for (let i = 0; i < n; i++) r.push([d.x[i], d.y[i]]); return r; }
      return [];
    }
    _buildLegend() {
      if (!this.o.legend) return;
      this.leg.innerHTML = '';
      this.o.series.forEach((s, i) => {
        if (!s.name) return;
        const col = s.color || PALETTE[i % PALETTE.length];
        const it = h('span', { class: s.visible === false ? 'off' : '' }, [h('i', { style: { background: col } }), s.name]);
        it.addEventListener('click', () => { s.visible = s.visible === false; it.classList.toggle('off', s.visible === false); this.render(); });
        this.leg.appendChild(it);
      });
    }
    _ranges(pw, ph) {
      const o = this.o;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      const acc = (x, y) => {
        if (isFinite(x)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
        if (isFinite(y)) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
      };
      o.series.forEach((s) => { if (s.visible === false) return; this._pts(s.data).forEach((p) => acc(p[0], p[1])); });
      (o.markers || []).forEach((m) => acc(m.x, m.y));
      if (!isFinite(x0)) { x0 = 0; x1 = 1; }
      if (!isFinite(y0)) { y0 = 0; y1 = 1; }
      if (o.yZero) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
      if (x1 - x0 < 1e-12) { const d = Math.abs(x0) * 0.1 || 1; x0 -= d; x1 += d; }
      if (y1 - y0 < 1e-12) { const d = Math.abs(y0) * 0.1 || 1; y0 -= d; y1 += d; }
      if (!o.xRange) { /* x 方向不留白 */ }
      if (!o.yRange) { const py = (y1 - y0) * 0.06; y0 -= py; y1 += py; }
      if (o.xRange) { x0 = o.xRange[0]; x1 = o.xRange[1]; }
      if (o.yRange) { y0 = o.yRange[0]; y1 = o.yRange[1]; }
      if (o.equal) {
        const sx = (x1 - x0) / pw, sy = (y1 - y0) / ph;
        if (sx > sy) { const c = (y0 + y1) / 2, half = (sx * ph) / 2; y0 = c - half; y1 = c + half; }
        else { const c = (x0 + x1) / 2, half = (sy * pw) / 2; x0 = c - half; x1 = c + half; }
      }
      return { x0, x1, y0, y1 };
    }
    render() {
      const W = this.wrap.clientWidth;
      if (!W) return;
      const o = this.o, H = o.height, dpr = Math.min(global.devicePixelRatio || 1, 2);
      if (this.cv.width !== Math.round(W * dpr) || this.cv.height !== Math.round(H * dpr)) {
        this.cv.width = Math.round(W * dpr);
        this.cv.height = Math.round(H * dpr);
        this.cv.style.height = H + 'px';
      }
      const ctx = this.ctx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const C = {
        bg: Course.cssVar('--plot-bg') || '#fff', grid: Course.cssVar('--plot-grid') || '#eee',
        axis: Course.cssVar('--plot-axis') || '#555', text: Course.cssVar('--text') || '#222', muted: Course.cssVar('--muted') || '#888',
      };
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);
      const P = o.pad, pw = Math.max(10, W - P.l - P.r), ph = Math.max(10, H - P.t - P.b);
      const R = this._ranges(pw, ph);
      this._R = R; this._P = P; this._pw = pw; this._ph = ph;
      const X = (x) => P.l + ((x - R.x0) / (R.x1 - R.x0)) * pw;
      const Y = (y) => P.t + ph - ((y - R.y0) / (R.y1 - R.y0)) * ph;
      this.X = X; this.Y = Y;
      const xt = M.niceTicks(R.x0, R.x1, Math.max(3, Math.round(pw / 90)));
      const yt = M.niceTicks(R.y0, R.y1, Math.max(3, Math.round(ph / 50)));
      const dec = (step) => Math.max(0, Math.min(6, -Math.floor(Math.log10(step) + 1e-9)));
      const fx = o.xTickFormat || ((v) => v.toFixed(dec(xt.step)));
      const fy = o.yTickFormat || ((v) => v.toFixed(dec(yt.step)));
      ctx.font = '12px ' + (Course.cssVar('--font') || 'sans-serif');
      ctx.lineWidth = 1;
      // 网格与刻度
      ctx.strokeStyle = C.grid;
      ctx.fillStyle = C.muted;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      xt.ticks.forEach((v) => {
        const x = Math.round(X(v)) + 0.5;
        if (o.grid) { ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, P.t + ph); ctx.stroke(); }
        ctx.fillText(fx(v), x, P.t + ph + 5);
      });
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      yt.ticks.forEach((v) => {
        const y = Math.round(Y(v)) + 0.5;
        if (o.grid) { ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(P.l + pw, y); ctx.stroke(); }
        ctx.fillText(fy(v), P.l - 6, y);
      });
      // 零线
      ctx.strokeStyle = C.axis;
      ctx.globalAlpha = 0.55;
      if (R.y0 < 0 && R.y1 > 0) { const y = Math.round(Y(0)) + 0.5; ctx.beginPath(); ctx.moveTo(P.l, y); ctx.lineTo(P.l + pw, y); ctx.stroke(); }
      if (R.x0 < 0 && R.x1 > 0) { const x = Math.round(X(0)) + 0.5; ctx.beginPath(); ctx.moveTo(x, P.t); ctx.lineTo(x, P.t + ph); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.strokeRect(P.l + 0.5, P.t + 0.5, pw, ph);
      // 轴标签
      ctx.fillStyle = C.text;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      if (o.xLabel) ctx.fillText(o.xLabel, P.l + pw / 2, H - 4);
      if (o.yLabel) { ctx.save(); ctx.translate(13, P.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText(o.yLabel, 0, 0); ctx.restore(); }
      if (o.title) { ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = 'bold 12.5px ' + (Course.cssVar('--font') || 'sans-serif'); ctx.fillText(o.title, P.l + 6, P.t + 4); ctx.font = '12px ' + (Course.cssVar('--font') || 'sans-serif'); }
      // 裁剪绘图区
      ctx.save();
      ctx.beginPath(); ctx.rect(P.l, P.t, pw, ph); ctx.clip();
      (o.bands || []).forEach((b) => {
        ctx.fillStyle = b.color || 'rgba(47,111,237,0.10)';
        if (b.x0 !== undefined) ctx.fillRect(X(b.x0), P.t, X(b.x1) - X(b.x0), ph);
        else ctx.fillRect(P.l, Y(b.y1), pw, Y(b.y0) - Y(b.y1));
      });
      const drawRef = (isV, it) => {
        ctx.strokeStyle = it.color || C.axis;
        ctx.setLineDash(it.dash || [5, 4]);
        ctx.lineWidth = it.width || 1.2;
        ctx.beginPath();
        if (isV) { ctx.moveTo(X(it.x), P.t); ctx.lineTo(X(it.x), P.t + ph); } else { ctx.moveTo(P.l, Y(it.y)); ctx.lineTo(P.l + pw, Y(it.y)); }
        ctx.stroke();
        ctx.setLineDash([]);
        if (it.label) {
          ctx.fillStyle = it.color || C.axis;
          ctx.textBaseline = 'top';
          if (isV) { ctx.textAlign = 'left'; ctx.fillText(it.label, X(it.x) + 4, P.t + 4); } else { ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(it.label, P.l + pw - 4, Y(it.y) - 2); }
        }
      };
      (o.vlines || []).forEach((v) => drawRef(true, v));
      (o.hlines || []).forEach((v) => drawRef(false, v));
      o.series.forEach((s, i) => {
        if (s.visible === false) return;
        const pts = this._pts(s.data);
        if (!pts.length) return;
        const col = s.color || PALETTE[i % PALETTE.length];
        ctx.strokeStyle = col;
        ctx.lineWidth = s.width || 2;
        ctx.setLineDash(s.dash || []);
        if (s.line !== false) {
          ctx.beginPath();
          let pen = false;
          for (const p of pts) {
            if (!isFinite(p[0]) || !isFinite(p[1])) { pen = false; continue; }
            const x = X(p[0]), y = Y(p[1]);
            if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y);
          }
          ctx.stroke();
          if (s.fill) {
            ctx.lineTo(X(pts[pts.length - 1][0]), Y(Math.max(R.y0, 0)));
            ctx.lineTo(X(pts[0][0]), Y(Math.max(R.y0, 0)));
            ctx.closePath();
            ctx.globalAlpha = 0.12; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1;
          }
        }
        ctx.setLineDash([]);
        if (s.points) {
          const r = typeof s.points === 'number' ? s.points : 2.5;
          ctx.fillStyle = col;
          for (const p of pts) { if (!isFinite(p[1])) continue; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), r, 0, Math.PI * 2); ctx.fill(); }
        }
      });
      (o.markers || []).forEach((m) => {
        ctx.fillStyle = m.color || '#e8590c';
        ctx.strokeStyle = C.bg;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(X(m.x), Y(m.y), m.r || 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (m.label) { ctx.fillStyle = m.color || C.text; ctx.textAlign = m.align || 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(m.label, X(m.x) + (m.align === 'right' ? -7 : 7), Y(m.y) - 4); }
      });
      (o.texts || []).forEach((t) => {
        ctx.fillStyle = t.color || C.text;
        ctx.textAlign = t.align || 'left';
        ctx.textBaseline = t.baseline || 'middle';
        ctx.fillText(t.text, X(t.x), Y(t.y));
      });
      ctx.restore();
      // 十字光标与提示
      if (o.crosshair && this.mouse) this._drawCross(C);
    }
    _drawCross(C) {
      const [mx, my] = this.mouse, P = this._P, ctx = this.ctx;
      if (mx < P.l || mx > P.l + this._pw || my < P.t || my > P.t + this._ph) { this.tip.style.display = 'none'; return; }
      ctx.strokeStyle = C.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(mx + 0.5, P.t); ctx.lineTo(mx + 0.5, P.t + this._ph); ctx.stroke(); ctx.setLineDash([]);
      const rows = [];
      this.o.series.forEach((s, i) => {
        if (s.visible === false) return;
        const pts = this._pts(s.data);
        if (!pts.length) return;
        let best = null, bd = Infinity;
        for (const p of pts) {
          if (!isFinite(p[0]) || !isFinite(p[1])) continue;
          const dx = this.X(p[0]) - mx, dy = (this.Y(p[1]) - my) * 0.35;
          const d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = p; }
        }
        if (!best) return;
        const col = s.color || PALETTE[i % PALETTE.length];
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(this.X(best[0]), this.Y(best[1]), 3.5, 0, Math.PI * 2); ctx.fill();
        rows.push('<span style="color:' + col + '">■</span> ' + (s.name || ('序列' + (i + 1))) + '：(' + Course.fmt(best[0], 3) + ', ' + Course.fmt(best[1], 3) + ')');
      });
      if (!rows.length) { this.tip.style.display = 'none'; return; }
      this.tip.innerHTML = rows.join('<br>');
      this.tip.style.display = 'block';
      const tw = this.tip.offsetWidth, W = this.wrap.clientWidth;
      this.tip.style.left = (mx + 14 + tw > W ? mx - tw - 12 : mx + 14) + 'px';
      this.tip.style.top = Math.max(4, my - 10) + 'px';
    }
  }
  Course.Plot = Plot;

  /* ------------------------------------------------------------------ 3D 辅助（three.js r147，Z 轴向上，单位 m） */
  const T3 = (Course.three = {});
  T3.available = () => typeof global.THREE !== 'undefined';
  let _webgl = null;
  T3.webgl = function () {
    if (_webgl !== null) return _webgl;
    try { const c = document.createElement('canvas'); _webgl = !!(global.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { _webgl = false; }
    return _webgl;
  };
  /** [x,y,z] 或 Vector3 → 新 Vector3 */
  T3.v = (p) => (p && p.isVector3 ? p.clone() : new THREE.Vector3(p ? p[0] : 0, p ? p[1] : 0, p ? p[2] : 0));
  /** 毫米数组 → 米制 Vector3 */
  T3.mm = (p) => new THREE.Vector3(p[0] / 1000, p[1] / 1000, p[2] / 1000);
  const GEO = {};
  const geo = (k, f) => GEO[k] || (GEO[k] = f());
  const unitCyl = () => geo('cyl', () => new THREE.CylinderGeometry(1, 1, 1, 20, 1));
  const unitCone = () => geo('cone', () => new THREE.ConeGeometry(1, 1, 20, 1));
  const unitSphere = () => geo('sph', () => new THREE.SphereGeometry(1, 24, 16));
  let _Y;
  const YAX = () => _Y || (_Y = new THREE.Vector3(0, 1, 0));

  /** 材质：o = {opacity, metalness, roughness, emissive, side, wireframe} */
  T3.mat = function (color, o) {
    o = o || {};
    const m = new THREE.MeshStandardMaterial({
      color: color === undefined ? 0x8a94a6 : color,
      metalness: o.metalness !== undefined ? o.metalness : 0.15,
      roughness: o.roughness !== undefined ? o.roughness : 0.55,
      transparent: o.opacity !== undefined && o.opacity < 1,
      opacity: o.opacity !== undefined ? o.opacity : 1,
      side: o.side || THREE.FrontSide,
      wireframe: !!o.wireframe,
    });
    if (o.emissive !== undefined) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.emissiveIntensity !== undefined ? o.emissiveIntensity : 0.25; }
    if (o.opacity !== undefined && o.opacity < 1) m.depthWrite = o.depthWrite !== undefined ? o.depthWrite : false;
    return m;
  };
  function setCyl(m, p, q, r) {
    const d = new THREE.Vector3().subVectors(q, p);
    const L = d.length();
    m.position.copy(p).addScaledVector(d, 0.5);
    if (L < 1e-9) { m.scale.set(r, 1e-6, r); return; }
    m.quaternion.setFromUnitVectors(YAX(), d.multiplyScalar(1 / L));
    m.scale.set(r, L, r);
  }
  T3._setCyl = setCyl;

  /** 连杆（两点间圆柱）：返回 Mesh，mesh.setEnds(p, q) 更新 */
  T3.link = function (a, b, o) {
    o = Object.assign({ radius: 0.012, color: 0x8a94a6 }, o || {});
    const m = new THREE.Mesh(unitCyl(), T3.mat(o.color, o));
    m.userData.r = o.radius;
    m.setEnds = function (p, q) { setCyl(m, T3.v(p), T3.v(q), m.userData.r); return m; };
    m.setColor = (c) => { m.material.color.set(c); return m; };
    m.setEnds(a || [0, 0, 0], b || [0, 0, 0.1]);
    return m;
  };
  /** 球（铰点/硬点）：mesh.setPos(p) */
  T3.joint = function (p, o) {
    o = Object.assign({ radius: 0.02, color: 0xe8590c }, o || {});
    const m = new THREE.Mesh(unitSphere(), T3.mat(o.color, o));
    m.scale.setScalar(o.radius);
    m.setPos = (q) => { m.position.copy(T3.v(q)); return m; };
    m.setColor = (c) => { m.material.color.set(c); return m; };
    m.setPos(p || [0, 0, 0]);
    return m;
  };
  /** 粗箭头：g.setVec(origin, vec)；o = {color, radius, head, headRadius, scale, min} */
  T3.arrow = function (origin, vec, o) {
    o = Object.assign({ color: 0xe8590c, radius: 0.01, head: 0.07, headRadius: 0.026, scale: 1, min: 1e-4 }, o || {});
    const g = new THREE.Group();
    const mat = T3.mat(o.color, { emissive: o.color, emissiveIntensity: 0.2 });
    const shaft = new THREE.Mesh(unitCyl(), mat);
    const head = new THREE.Mesh(unitCone(), mat);
    g.add(shaft, head);
    g.setVec = function (org, v) {
      const p = T3.v(org), d = T3.v(v).multiplyScalar(o.scale);
      const L = d.length();
      if (L < o.min) { g.visible = false; return g; }
      g.visible = true;
      const dir = d.clone().divideScalar(L);
      const hl = Math.min(o.head, L * 0.45), sl = L - hl;
      setCyl(shaft, p, p.clone().addScaledVector(dir, sl), o.radius);
      head.position.copy(p).addScaledVector(dir, sl + hl / 2);
      head.quaternion.setFromUnitVectors(YAX(), dir);
      head.scale.set(o.headRadius, hl, o.headRadius);
      return g;
    };
    g.setColor = (c) => { mat.color.set(c); mat.emissive.set(c); return g; };
    g.setVec(origin || [0, 0, 0], vec || [0, 0, 0.1]);
    return g;
  };
  function roundRect(ctx, x, y, w, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + hh - r); ctx.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh);
    ctx.lineTo(x + r, y + hh); ctx.quadraticCurveTo(x, y + hh, x, y + hh - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  /** 文字精灵（始终面向相机）：sp.setText(t)；o = {color, bg, size(世界高度 m), depthTest} */
  T3.label = function (text, o) {
    o = Object.assign({ color: '#1d2330', bg: 'rgba(255,255,255,0.85)', size: 0.06, depthTest: false, bold: true }, o || {});
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    const mat = new THREE.SpriteMaterial({ depthTest: o.depthTest, transparent: true });
    const sp = new THREE.Sprite(mat);
    sp.renderOrder = 999;
    let tex = null, lastW = 0, lastH = 0;
    sp.setText = function (t) {
      const font = (o.bold ? 'bold ' : '') + '44px "Microsoft YaHei", "PingFang SC", sans-serif';
      const lines = String(t).split('\n');
      ctx.font = font;
      const pad = 14, lh = 54;
      const w = Math.ceil(Math.max.apply(null, lines.map((l) => ctx.measureText(l).width)) + pad * 2);
      const hh = lh * lines.length + pad;
      if (w !== lastW || hh !== lastH) {
        cv.width = w; cv.height = hh; lastW = w; lastH = hh;
        if (tex) tex.dispose();
        tex = new THREE.CanvasTexture(cv);
        tex.encoding = THREE.sRGBEncoding;
        tex.minFilter = THREE.LinearFilter;
        mat.map = tex;
        mat.needsUpdate = true;
      }
      ctx.clearRect(0, 0, w, hh);
      ctx.font = font;
      if (o.bg) { ctx.fillStyle = o.bg; roundRect(ctx, 0, 0, w, hh, 12); ctx.fill(); }
      ctx.fillStyle = o.color;
      ctx.textBaseline = 'middle';
      lines.forEach((l, i) => ctx.fillText(l, pad, pad / 2 + lh * (i + 0.5)));
      tex.needsUpdate = true;
      sp.scale.set((o.size * w) / lh, (o.size * hh) / lh, 1);
      return sp;
    };
    sp.setText(text);
    return sp;
  };
  /** 坐标轴（X 红 / Y 绿 / Z 蓝 + 字母标签） */
  T3.axes = function (size, o) {
    o = Object.assign({ labels: true, radius: size * 0.012, names: ['X', 'Y', 'Z'] }, o || {});
    const g = new THREE.Group();
    const cols = [0xe03131, 0x2f9e44, 0x1c7ed6];
    const dirs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    dirs.forEach((d, i) => {
      g.add(T3.arrow([0, 0, 0], d.map((v) => v * size), { color: cols[i], radius: o.radius, head: size * 0.16, headRadius: o.radius * 2.6 }));
      if (o.labels) {
        const lb = T3.label(o.names[i], { color: '#' + cols[i].toString(16).padStart(6, '0'), bg: null, size: size * 0.16 });
        lb.position.set(d[0] * size * 1.14, d[1] * size * 1.14, d[2] * size * 1.14);
        g.add(lb);
      }
    });
    return g;
  };
  /** XY 平面网格（地面） */
  T3.grid = function (size, step, o) {
    o = Object.assign({ color1: 0x7f8aa0, color2: 0xa7b0c2, opacity: 0.45 }, o || {});
    const n = Math.max(1, Math.round(size / step));
    const g = new THREE.GridHelper(size, n, o.color1, o.color2);
    g.rotation.x = Math.PI / 2;
    g.material.transparent = true;
    g.material.opacity = o.opacity;
    g.material.depthWrite = false;
    return g;
  };
  T3.box = function (size, o) {
    o = Object.assign({ color: 0x8a94a6, edges: false }, o || {});
    const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), T3.mat(o.color, o));
    if (o.edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: o.edgeColor || 0x334155, transparent: true, opacity: 0.6 })));
    return m;
  };
  /** 折线：line.setPoints(points)；o = {color, dashed, dash, gap, opacity} */
  T3.line = function (points, o) {
    o = Object.assign({ color: 0x5c677d, dashed: false, dash: 0.05, gap: 0.03, opacity: 1 }, o || {});
    const g = new THREE.BufferGeometry();
    const matO = { color: o.color, transparent: o.opacity < 1, opacity: o.opacity };
    const mat = o.dashed ? new THREE.LineDashedMaterial(Object.assign(matO, { dashSize: o.dash, gapSize: o.gap })) : new THREE.LineBasicMaterial(matO);
    const line = new THREE.Line(g, mat);
    line.setPoints = function (pts) {
      const arr = new Float32Array(Math.max(pts.length, 1) * 3);
      pts.forEach((p, i) => { const v = T3.v(p); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; });
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      g.setDrawRange(0, pts.length);
      g.computeBoundingSphere();
      if (o.dashed) line.computeLineDistances();
      return line;
    };
    line.setPoints(points || []);
    return line;
  };
  /** 粗路径（静态）：TubeGeometry */
  T3.path = function (points, o) {
    o = Object.assign({ radius: 0.02, color: 0x2f6fed, segments: 200 }, o || {});
    const curve = new THREE.CatmullRomCurve3(points.map((p) => T3.v(p)));
    return new THREE.Mesh(new THREE.TubeGeometry(curve, o.segments, o.radius, 8, false), T3.mat(o.color, o));
  };
  /** 车轮（旋转轴 = 局部 Y 轴）：w.spin(角度rad) 使轮辋绕 Y 转动；o = {radius, width, color, rim} */
  T3.wheel = function (o) {
    o = Object.assign({ radius: 0.32, width: 0.225, color: 0x2b2f36, rim: 0xc3cad6, rimRatio: 0.6, marker: true, opacity: 1 }, o || {});
    const g = new THREE.Group();
    const spin = new THREE.Group();
    g.add(spin);
    const R = o.radius, W = o.width, r0 = R * o.rimRatio, c = Math.min(W * 0.22, R * 0.1);
    const pts = [new THREE.Vector2(r0, -W / 2 + 0.002)];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(R - c + c * Math.cos(a), -W / 2 + c + c * Math.sin(a))); }
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(R - c + c * Math.cos(a), W / 2 - c + c * Math.sin(a))); }
    pts.push(new THREE.Vector2(r0, W / 2 - 0.002));
    const tire = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), T3.mat(o.color, { roughness: 0.92, metalness: 0, side: THREE.DoubleSide, opacity: o.opacity }));
    spin.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r0, r0, W * 0.72, 32), T3.mat(o.rim, { metalness: 0.45, roughness: 0.35, opacity: o.opacity }));
    spin.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.28, r0 * 0.28, W * 0.8, 16), T3.mat(0x7b8494, { metalness: 0.5, roughness: 0.4 }));
    spin.add(hub);
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(r0 * 0.16, W * 0.76, r0 * 0.92), T3.mat(0x9aa4b2, { metalness: 0.4, roughness: 0.4 }));
      const ang = (i / 5) * Math.PI * 2;
      sp.position.set(Math.sin(ang) * r0 * 0.5, 0, Math.cos(ang) * r0 * 0.5);
      sp.rotation.y = ang;
      spin.add(sp);
    }
    if (o.marker) {
      const mk = new THREE.Mesh(new THREE.BoxGeometry(R * 0.1, W * 1.01, R * 0.05), T3.mat(0xf8f9fa, { roughness: 0.6 }));
      mk.position.set(0, 0, R - R * 0.02);
      spin.add(mk);
    }
    g.spinGroup = spin;
    g.tire = tire;
    g.spin = (a) => { spin.rotation.y = a; return g; };
    return g;
  };
  /** 螺旋弹簧：s.setEnds(p, q)；o = {radius(簧径 m), wire, coils, color} */
  T3.spring = function (a, b, o) {
    o = Object.assign({ radius: 0.06, wire: 0.008, coils: 7, color: 0xd9480f }, o || {});
    class Helix extends THREE.Curve {
      getPoint(t, target) {
        const v = target || new THREE.Vector3();
        const ang = t * Math.PI * 2 * o.coils;
        return v.set(Math.cos(ang) * o.radius, t - 0.5, Math.sin(ang) * o.radius);
      }
    }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new Helix(), o.coils * 24, o.wire, 6, false), T3.mat(o.color, { metalness: 0.3, roughness: 0.45 }));
    m.setEnds = function (p, q) {
      const P = T3.v(p), Q = T3.v(q), d = new THREE.Vector3().subVectors(Q, P), L = d.length();
      m.position.copy(P).addScaledVector(d, 0.5);
      if (L > 1e-9) m.quaternion.setFromUnitVectors(YAX(), d.clone().divideScalar(L));
      m.scale.set(1, Math.max(L, 1e-6), 1);
      return m;
    };
    m.setEnds(a || [0, 0, 0], b || [0, 0, 0.3]);
    return m;
  };
  /** 减振器（缸筒 + 活塞杆）：d.setEnds(下端, 上端) */
  T3.damper = function (a, b, o) {
    o = Object.assign({ radius: 0.022, rodRadius: 0.009, bodyRatio: 0.55, color: 0x495057, rodColor: 0xced4da }, o || {});
    const g = new THREE.Group();
    const body = new THREE.Mesh(unitCyl(), T3.mat(o.color, { metalness: 0.4 }));
    const rod = new THREE.Mesh(unitCyl(), T3.mat(o.rodColor, { metalness: 0.7, roughness: 0.25 }));
    g.add(body, rod);
    g.setEnds = function (p, q) {
      const P = T3.v(p), Q = T3.v(q), mid = P.clone().lerp(Q, o.bodyRatio);
      setCyl(body, P, mid, o.radius);
      setCyl(rod, mid, Q, o.rodRadius);
      return g;
    };
    g.setEnds(a || [0, 0, 0], b || [0, 0, 0.4]);
    return g;
  };
  /** 衬套（短圆柱，axis 为轴向）：o = {radius, length, color} */
  T3.bushing = function (p, axis, o) {
    o = Object.assign({ radius: 0.03, length: 0.05, color: 0x343a40 }, o || {});
    const m = new THREE.Mesh(unitCyl(), T3.mat(o.color, { roughness: 0.9 }));
    m.setPose = function (q, ax) {
      const P = T3.v(q), A = T3.v(ax || [1, 0, 0]).normalize();
      setCyl(m, P.clone().addScaledVector(A, -o.length / 2), P.clone().addScaledVector(A, o.length / 2), o.radius);
      return m;
    };
    m.setPose(p || [0, 0, 0], axis);
    return m;
  };
  /** 质心标记（黑白相间球） */
  T3.cgMarker = function (radius) {
    const g = new THREE.SphereGeometry(radius || 0.06, 32, 24).toNonIndexed();
    const pos = g.attributes.position, cols = [];
    for (let i = 0; i < pos.count; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const k = cx * cy * cz >= 0 ? 0.08 : 0.97;
      for (let j = 0; j < 3; j++) cols.push(k, k, k);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }));
    m.renderOrder = 5;
    return m;
  };
  /** 简化车身（侧轮廓拉伸，原点 = 轴距中点地面）：o = {wheelbase, width, color, opacity, edges} */
  T3.carBody = function (o) {
    o = Object.assign({ wheelbase: 2.8, width: 1.8, color: 0x3b6fd8, opacity: 0.3, edges: true, rw: 0.32 }, o || {});
    const L2 = o.wheelbase / 2, sx = o.wheelbase / 2.8;
    const s = new THREE.Shape();
    const P = (x, z) => [x * sx, z];
    const arch = (xa) => {
      const r = o.rw + 0.07, zc = o.rw;
      const pts = [];
      pts.push([xa - r, 0.2]);
      for (let i = 0; i <= 16; i++) { const a = Math.PI - (i / 16) * Math.PI; pts.push([xa + r * Math.cos(a), zc + r * Math.sin(a)]); }
      pts.push([xa + r, 0.2]);
      return pts;
    };
    const outline = [P(-2.36, 0.24)]
      .concat(arch(-L2)).concat(arch(L2))
      .concat([P(2.34, 0.24), P(2.42, 0.56), P(2.28, 0.8), P(0.95, 1.0), P(0.22, 1.43), P(-0.85, 1.42), P(-1.6, 1.03), P(-2.28, 0.98), P(-2.42, 0.62)]);
    outline.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: o.width, bevelEnabled: false, curveSegments: 4 });
    g.rotateX(Math.PI / 2);
    g.translate(0, o.width / 2, 0);
    const grp = new THREE.Group();
    const mesh = new THREE.Mesh(g, T3.mat(o.color, { opacity: o.opacity, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.2 }));
    grp.add(mesh);
    if (o.edges) grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), new THREE.LineBasicMaterial({ color: o.edgeColor || 0x1f3a75, transparent: true, opacity: 0.55 })));
    grp.mesh = mesh;
    return grp;
  };
  /**
   * 简化整车（ISO：X 前、Y 左、Z 上；原点 = 轴距中点地面）：
   * const car = Course.three.vehicle({L, tf, tr, rw, a, hcg});
   * car.setPose(X, Y, yaw) / car.setRollPitch(roll, pitch)（绕质心，ISO 正向：右侧下沉为正侧倾、点头为正俯仰）
   * car.setSteer(左前角, 右前角) / car.spin(角度) / car.wheels.fl|fr|rl|rr = {hub, steer, wheel}
   */
  T3.vehicle = function (o) {
    o = Object.assign({ L: 2.8, tf: 1.58, tr: 1.58, rw: 0.32, tireW: 0.225, a: 1.2, hcg: 0.55, bodyColor: 0x3b6fd8, opacity: 0.3, showCG: true }, o || {});
    const root = new THREE.Group();
    const sprung = new THREE.Group();
    const xcg = o.L / 2 - o.a;
    sprung.position.set(xcg, 0, o.hcg);
    const body = T3.carBody({ wheelbase: o.L, width: Math.max(o.tf, o.tr) + 0.24, color: o.bodyColor, opacity: o.opacity, rw: o.rw });
    body.position.set(-xcg, 0, -o.hcg);
    sprung.add(body);
    root.add(sprung);
    let cg = null;
    if (o.showCG) { cg = T3.cgMarker(0.07); sprung.add(cg); }
    const mk = (x, y) => {
      const hub = new THREE.Group();
      hub.position.set(x, y, o.rw);
      const steer = new THREE.Group();
      hub.add(steer);
      const w = T3.wheel({ radius: o.rw, width: o.tireW });
      if (y < 0) w.scale.y = -1;
      steer.add(w);
      root.add(hub);
      return { hub, steer, wheel: w };
    };
    const W = { fl: mk(o.L / 2, o.tf / 2), fr: mk(o.L / 2, -o.tf / 2), rl: mk(-o.L / 2, o.tr / 2), rr: mk(-o.L / 2, -o.tr / 2) };
    return {
      group: root, sprung, body, wheels: W, cg, opts: o,
      setPose(X, Y, yaw) { root.position.set(X, Y, 0); root.rotation.z = yaw || 0; return this; },
      setRollPitch(roll, pitch) { sprung.rotation.set(roll || 0, pitch || 0, 0); return this; },
      setSteer(dl, dr) { W.fl.steer.rotation.z = dl || 0; W.fr.steer.rotation.z = dr === undefined ? dl || 0 : dr; return this; },
      spin(a) { for (const k in W) W[k].wheel.spin(a); return this; },
      setWheelTravel(k, dz) { const w = W[k]; if (w) w.hub.position.z = o.rw + (dz || 0); return this; },
    };
  };
  T3.dispose = function (obj) {
    obj.traverse((c) => {
      if (c.geometry && !Object.values(GEO).includes(c.geometry)) c.geometry.dispose();
      if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
  };

  /**
   * 3D 视图：const v = Course.three.viewer(container, {
   *   camera:{pos:[x,y,z], target:[x,y,z], fov}, grid:{size, step}|false, axes:尺寸|false,
   *   toolbar:true, views:['iso','front','left','top','home'], hint:true, overlay:false, background:null
   * })
   * 返回：{ok, scene, camera, renderer, controls, root, add(...objs), onFrame(fn(dt,t)), setView(name), resetView(),
   *        htmlLabel(html, pos, {attach}), enablePick(objs, onPick, onHover), overlay(HTML 元素), el }
   */
  T3.viewer = function (container, o) {
    o = Object.assign({ grid: { size: 10, step: 0.5 }, axes: 0.5, toolbar: true, views: ['iso', 'front', 'left', 'top', 'home'], hint: true, overlay: false, background: null, controls: true, antialias: true }, o || {});
    o.camera = Object.assign({ pos: [4, -5, 3], target: [0, 0, 0.4], fov: 40, near: 0.01, far: 500 }, o.camera || {});
    const el = $(container);
    el.classList.add('vmd-3d');
    const noop = () => api;
    const api = { ok: false, el, scene: null, camera: null, renderer: null, controls: null, root: null, overlay: null, frameFns: [], labels: [], visible: true, time: 0 };
    api.add = noop; api.onFrame = noop; api.setView = noop; api.resetView = noop;
    api.htmlLabel = () => ({ el: h('div'), setText() { return this; }, setPos() { return this; }, show() { return this; } });
    api.enablePick = noop;
    if (!T3.available()) {
      el.appendChild(h('div', { class: 'v3d-fallback', html: '未能加载 3D 库（assets/lib/three.min.js）。<br>请保持教程文件夹结构完整后刷新。' }));
      return api;
    }
    const scene = new THREE.Scene();
    api.scene = scene;
    api.root = new THREE.Group();
    scene.add(api.root);
    const cam = new THREE.PerspectiveCamera(o.camera.fov, 1, o.camera.near, o.camera.far);
    cam.up.set(0, 0, 1);
    cam.position.set(o.camera.pos[0], o.camera.pos[1], o.camera.pos[2]);
    api.camera = cam;
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.8);
    hemi.position.set(0, 0, 1);
    const dl = new THREE.DirectionalLight(0xffffff, 0.75);
    dl.position.set(3, -4, 6);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dl2.position.set(-4, 3, 2);
    scene.add(hemi, dl, dl2);
    if (o.grid) { api.grid = T3.grid(o.grid.size || 10, o.grid.step || 0.5); scene.add(api.grid); }
    if (o.axes) { api.axes = T3.axes(o.axes); scene.add(api.axes); }
    api.add = (...objs) => { objs.forEach((ob) => api.root.add(ob)); return api; };
    api.onFrame = (fn) => { api.frameFns.push(fn); return api; };
    const target = new THREE.Vector3(o.camera.target[0], o.camera.target[1], o.camera.target[2]);
    api.home = { pos: cam.position.clone(), target: target.clone() };
    if (!T3.webgl()) {
      el.appendChild(h('div', { class: 'v3d-fallback', html: '当前浏览器未启用 WebGL，无法显示 3D 视图。<br>建议使用新版 Edge / Chrome 并开启硬件加速。' }));
      return api;
    }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: o.antialias, alpha: false });
    } catch (e) {
      el.appendChild(h('div', { class: 'v3d-fallback', html: 'WebGL 初始化失败：' + String(e.message || e) }));
      return api;
    }
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    el.appendChild(renderer.domElement);
    api.renderer = renderer;
    api.ok = true;
    const setBg = () => { scene.background = new THREE.Color(o.background || Course.cssVar('--three-bg') || '#eaf0f7'); };
    setBg();
    global.addEventListener('java-course-theme', setBg);
    let controls = null;
    if (o.controls && THREE.OrbitControls) {
      controls = new THREE.OrbitControls(cam, renderer.domElement);
      controls.target.copy(target);
      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.screenSpacePanning = true;
      controls.enableZoom = false;
      renderer.domElement.addEventListener('pointerdown', () => { controls.enableZoom = true; });
      el.addEventListener('pointerleave', () => { controls.enableZoom = false; });
      controls.update();
      api.controls = controls;
    } else cam.lookAt(target);
    const getTarget = () => (controls ? controls.target : target);
    const VIEWS = { iso: [1, -1.3, 0.75], front: [1, 0, 0.08], rear: [-1, 0, 0.08], left: [0, 1, 0.08], right: [0, -1, 0.08], top: [-0.002, 0, 1] };
    api.setView = function (name) {
      if (name === 'home') return api.resetView();
      const d = VIEWS[name];
      if (!d) return api;
      const t = getTarget();
      const dist = cam.position.distanceTo(t);
      const dir = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      cam.position.copy(t).addScaledVector(dir, dist);
      cam.lookAt(t);
      if (controls) controls.update();
      return api;
    };
    api.resetView = function () {
      cam.position.copy(api.home.pos);
      if (controls) { controls.target.copy(api.home.target); controls.update(); } else cam.lookAt(api.home.target);
      return api;
    };
    api.lookAt = function (pos, tgt) {
      cam.position.copy(T3.v(pos));
      if (controls) { controls.target.copy(T3.v(tgt)); controls.update(); } else cam.lookAt(T3.v(tgt));
      return api;
    };
    if (o.toolbar) {
      const names = { iso: '轴测', front: '前视', rear: '后视', left: '左视', right: '右视', top: '俯视', home: '复位' };
      const tb = h('div', { class: 'v3d-toolbar' });
      o.views.forEach((k) => {
        const b = h('button', { type: 'button' }, names[k] || k);
        b.addEventListener('click', () => api.setView(k));
        tb.appendChild(b);
      });
      el.appendChild(tb);
      api.toolbar = tb;
    }
    if (o.hint) el.appendChild(h('div', { class: 'v3d-hint' }, '左键旋转 · 右键平移 · 点击后滚轮缩放'));
    if (o.overlay) { api.overlay = h('div', { class: 'v3d-overlay' }); el.appendChild(api.overlay); }
    // HTML 标签（每帧投影到屏幕）
    api.htmlLabel = function (html, pos, lo) {
      lo = lo || {};
      const lel = h('div', { class: 'v3d-label' + (lo.cls ? ' ' + lo.cls : ''), html: html });
      if (lo.color) lel.style.borderColor = lo.color;
      el.appendChild(lel);
      const lab = {
        el: lel, pos: T3.v(pos || [0, 0, 0]), attach: lo.attach || null, visible: true,
        setText(t) { if (lel._t !== t) { lel.innerHTML = t; lel._t = t; } return lab; },
        setPos(p) { lab.pos.copy(T3.v(p)); return lab; },
        show(b) { lab.visible = !!b; lel.style.display = b ? '' : 'none'; return lab; },
      };
      api.labels.push(lab);
      return lab;
    };
    const _v = new THREE.Vector3();
    function updateLabels() {
      const w = el.clientWidth, hh = el.clientHeight;
      for (const lab of api.labels) {
        if (!lab.visible) continue;
        _v.copy(lab.pos);
        if (lab.attach) lab.attach.localToWorld(_v);
        _v.project(cam);
        if (_v.z > 1 || _v.z < -1) { lab.el.style.display = 'none'; continue; }
        lab.el.style.display = '';
        lab.el.style.transform = 'translate(' + ((_v.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-_v.y * 0.5 + 0.5) * hh).toFixed(1) + 'px) translate(-50%, -125%)';
      }
    }
    // 拾取
    api.enablePick = function (objs, onPick, onHover) {
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      let down = null;
      const hit = (e) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, cam);
        const list = typeof objs === 'function' ? objs() : objs;
        const xs = ray.intersectObjects(list, true);
        if (!xs.length) return null;
        let ob = xs[0].object;
        while (ob && !list.includes(ob)) ob = ob.parent;
        return { object: ob || xs[0].object, point: xs[0].point, hit: xs[0] };
      };
      renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
      renderer.domElement.addEventListener('pointerup', (e) => {
        if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
        const r = hit(e);
        if (onPick) onPick(r, e);
      });
      if (onHover) {
        renderer.domElement.addEventListener('pointermove', (e) => { if (e.buttons) return; onHover(hit(e), e); });
      }
      return api;
    };
    // 尺寸
    const resize = () => {
      const w = el.clientWidth, hh = el.clientHeight;
      if (!w || !hh) return;
      renderer.setSize(w, hh, false);
      cam.aspect = w / hh;
      cam.updateProjectionMatrix();
    };
    if (global.ResizeObserver) new ResizeObserver(resize).observe(el);
    resize();
    if (global.IntersectionObserver) new IntersectionObserver((es) => { api.visible = es[es.length - 1].isIntersecting; }).observe(el);
    let last = performance.now();
    function tick(now) {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!api.visible || document.hidden) return;
      api.time += dt;
      for (const f of api.frameFns) {
        if (f._broken) continue;
        try { f(dt, api.time); } catch (e) { f._broken = true; console.error('[Course 3D onFrame]', e); Course.errors.push(String(e && e.stack || e)); }
      }
      if (controls) controls.update();
      renderer.render(scene, cam);
      if (api.labels.length) updateLabels();
    }
    requestAnimationFrame(tick);
    return api;
  };
})(typeof window !== 'undefined' ? window : globalThis);
