function memoryThree(agent) {
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
  const items = [
    '第' + agent.clauseNo + '条' + agent.clauseNames[agent.clauseNo - 1] + '上限' + agent.limitYuan + '元',
    '这单' + agent.claimedYuan + '元超出' + agent.overYuan + '元',
    '前' + agent.topK + '片为第' + ranked[0].clause + '条与第' + ranked[1].clause + '条'
  ];
  const text = items.join('。') + '。';
  return {
    keep: items.length,
    chars: text.length,
    fits: items.length === agent.memoryKeep && text.length <= agent.contextChars,
    text: text
  };
}
