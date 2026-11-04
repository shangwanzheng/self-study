/* AI Agent 自学教程 · 档案助理的共用计算。无 DOM。 */
(function (global) {
  'use strict';
  const Course = global.Course;
  const agent = {
    name: '档案助理',
    ask: '报销上限是多少',
    sentence: '上周报销超了：上限 200 元，这单填了 350 元。',
    limitYuan: 200,
    claimedYuan: 350,
    overYuan: 150,
    clauseNo: 3,
    clauseCount: 4,
    chunkChars: 80,
    handbookChars: 320,
    embedDim: 4,
    topK: 2,
    maxSteps: 4,
    memoryKeep: 3,
    contextChars: 120,
    skillCount: 2,
    skillLoaded: 1,
    toolName: 'lookupClause',
    query: [3, 1, 0, 0],
    clauses: [
      [0, 1, 0, 0],
      [1, 0, 1, 0],
      [3, 1, 0, 0],
      [0, 0, 1, 1]
    ],
    clauseNames: ['考勤', '请假', '报销', '差旅']
  };

  function dot(u, v) {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * v[i];
    return s;
  }
  function norm(u) {
    return Math.sqrt(dot(u, u));
  }
  function cosine(u, v) {
    const n = norm(u) * norm(v);
    if (!n) return 0;
    return dot(u, v) / n;
  }
  function scores() {
    return agent.clauses.map(function (v, i) {
      return { clause: i + 1, name: agent.clauseNames[i], score: cosine(agent.query, v) };
    });
  }
  function topK() {
    return scores().slice().sort(function (a, b) { return b.score - a.score; }).slice(0, agent.topK);
  }

  Course.data = { agent: agent };
  Course.agentMath = {
    dot: dot,
    norm: norm,
    cosine: cosine,
    overYuan: function () { return agent.claimedYuan - agent.limitYuan; },
    chunkCount: function () { return agent.handbookChars / agent.chunkChars; },
    scores: scores,
    topK: topK,
    fitsContext: function (chars) { return chars <= agent.contextChars; }
  };
})(window);
