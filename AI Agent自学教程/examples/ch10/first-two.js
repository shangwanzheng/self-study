function firstTwo(agent) {
  function dot(u, v) {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * v[i];
    return s;
  }
  function norm(u) {
    return Math.sqrt(dot(u, u));
  }
  const qn = norm(agent.query);
  const ranked = agent.clauses.map(function (v, i) {
    const n = qn * norm(v);
    return { clause: i + 1, score: n ? dot(agent.query, v) / n : 0 };
  }).sort(function (a, b) { return b.score - a.score; });
  const picked = ranked.slice(0, agent.topK);
  return {
    clauses: [picked[0].clause, picked[1].clause],
    limitFrom: agent.clauseNo,
    limitYuan: agent.limitYuan
  };
}
