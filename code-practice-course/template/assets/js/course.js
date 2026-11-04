/* language: javascript */
/* 骨架注册表。正式课复制后改成这门课的章节，并删掉「先跑通一行」。 */
(function () {
  "use strict";

  var Course = window.Course = {
    language: "javascript",
    CHAPTERS: [
      { id: 'ch01', no: 1, stage: 1, file: 'ch01_run.html', title: '先跑通一行', short: '跑通', desc: '运行结果印出 ok' }
    ],
    STAGES: [
      { id: 1, title: '目标' },
      { id: 2, title: '四件套' },
      { id: 3, title: '先写清楚' },
      { id: 4, title: '项目' },
      { id: 5, title: '协作与收束' }
    ],
    errors: [],
    initChapter: initChapter,
    ui: { flow: flow, quiz: quiz }
  };

  function initChapter(id) {
    renderSidebar(document.getElementById("sidebar"), id);
    var pagers = document.querySelectorAll(".pager");
    for (var i = 0; i < pagers.length; i++) renderPager(pagers[i], id);
    var mounts = document.querySelectorAll(".js-run");
    for (var j = 0; j < mounts.length; j++) wireRun(mounts[j]);
    if (!findChapter(id)) Course.errors.push("未知章节 " + id);
  }

  function findChapter(id) {
    for (var i = 0; i < Course.CHAPTERS.length; i++) {
      if (Course.CHAPTERS[i].id === id) return Course.CHAPTERS[i];
    }
    return null;
  }

  function renderSidebar(sidebar, id) {
    if (!sidebar) return;
    sidebar.innerHTML = "";
    var home = document.createElement("a");
    home.href = "index.html";
    home.textContent = "目录";
    home.className = "side-home";
    sidebar.appendChild(home);
    Course.STAGES.forEach(function (stage) {
      var items = Course.CHAPTERS.filter(function (chapter) { return chapter.stage === stage.id; });
      if (!items.length) return;
      var heading = document.createElement("p");
      heading.className = "side-stage";
      heading.textContent = stage.title;
      sidebar.appendChild(heading);
      items.forEach(function (chapter) {
        var link = document.createElement("a");
        link.href = chapter.file;
        link.textContent = chapter.no + ". " + chapter.short;
        if (chapter.id === id) link.className = "is-current";
        sidebar.appendChild(link);
      });
    });
  }

  function renderPager(pager, id) {
    pager.innerHTML = "";
    var index = -1;
    for (var i = 0; i < Course.CHAPTERS.length; i++) {
      if (Course.CHAPTERS[i].id === id) index = i;
    }
    pager.appendChild(pagerLink(index > 0 ? Course.CHAPTERS[index - 1] : null, "上一章"));
    pager.appendChild(pagerLink(index >= 0 && index < Course.CHAPTERS.length - 1 ? Course.CHAPTERS[index + 1] : null, "下一章"));
  }

  function pagerLink(chapter, label) {
    var wrap = document.createElement("span");
    if (!chapter) {
      wrap.textContent = label + "：没有了";
      return wrap;
    }
    wrap.textContent = label + "：";
    var link = document.createElement("a");
    link.href = chapter.file;
    link.textContent = chapter.no + ". " + chapter.short;
    wrap.appendChild(link);
    return wrap;
  }

  function wireRun(mount) {
    if (mount.getAttribute("data-wired") === "1") return;
    mount.setAttribute("data-wired", "1");
    var box = document.getElementById(mount.getAttribute("data-code"));
    var button = document.createElement("button");
    button.type = "button";
    button.className = "run-btn";
    button.textContent = "运行";
    var label = document.createElement("p");
    label.className = "run-label";
    label.textContent = "运行结果";
    var out = document.createElement("pre");
    out.className = "run-out is-idle";
    mount.appendChild(button);
    mount.insertAdjacentElement("afterend", out);
    out.insertAdjacentElement("beforebegin", label);
    button.addEventListener("click", function () {
      out.classList.remove("is-idle");
      if (!box) {
        out.textContent = "找不到代码框";
        return;
      }
      try {
        var lines = [];
        var fn = new Function("console", box.value);
        fn({
          log: function () {
            var parts = [];
            for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i]));
            lines.push(parts.join(" "));
          }
        });
        out.textContent = lines.length ? lines.join("\n") : "（没有输出）";
      } catch (err) {
        out.textContent = String(err && err.message ? err.message : err);
      }
    });
  }

  function flow(mountId, steps) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = "";
    mount.classList.add("flow");
    steps.forEach(function (step, index) {
      if (index) {
        var arrow = document.createElement("div");
        arrow.className = "flow-arrow";
        arrow.textContent = "↓";
        mount.appendChild(arrow);
      }
      if (step.t === "decision") {
        var node = document.createElement("div");
        node.className = "flow-decision";
        var caption = document.createElement("span");
        caption.textContent = step.text;
        node.appendChild(caption);
        mount.appendChild(node);
        var branch = document.createElement("div");
        branch.className = "flow-branch";
        var yes = document.createElement("p");
        yes.textContent = "是：" + (step.yes || "");
        var no = document.createElement("p");
        no.textContent = "否：" + (step.no || "");
        branch.appendChild(yes);
        branch.appendChild(no);
        mount.appendChild(branch);
      } else {
        var action = document.createElement("div");
        action.className = "flow-action";
        action.textContent = step.text;
        mount.appendChild(action);
      }
    });
  }

  function quiz(mountId, items) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    var form = document.createElement("form");
    items.forEach(function (item, qi) {
      var field = document.createElement("fieldset");
      var legend = document.createElement("legend");
      legend.textContent = (qi + 1) + ". " + item.q;
      field.appendChild(legend);
      var multi = item.answer.length > 1;
      item.options.forEach(function (option, oi) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        input.type = multi ? "checkbox" : "radio";
        input.name = "q" + qi;
        input.value = String(oi);
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + option));
        field.appendChild(label);
      });
      var why = document.createElement("p");
      why.className = "why";
      why.hidden = true;
      field.appendChild(why);
      form.appendChild(field);
    });
    var score = document.createElement("p");
    score.className = "quiz-score";
    var button = document.createElement("button");
    button.type = "submit";
    button.textContent = "提交";
    form.appendChild(button);
    form.appendChild(score);
    var done = false;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (done) return;
      done = true;
      button.disabled = true;
      var correct = 0;
      items.forEach(function (item, qi) {
        var picked = [];
        var inputs = form.querySelectorAll('input[name="q' + qi + '"]:checked');
        for (var i = 0; i < inputs.length; i++) picked.push(Number(inputs[i].value));
        var ok = sameSet(picked, item.answer);
        if (ok) correct += 1;
        var why = form.querySelectorAll(".why")[qi];
        why.hidden = false;
        why.textContent = (ok ? "对。" : "这次没选对。") + item.why;
      });
      score.textContent = "答对 " + correct + " / " + items.length;
    });
    mount.appendChild(form);
  }

  function sameSet(left, right) {
    if (left.length !== right.length) return false;
    var a = left.slice().sort().join(",");
    var b = right.slice().sort().join(",");
    return a === b;
  }
})();
