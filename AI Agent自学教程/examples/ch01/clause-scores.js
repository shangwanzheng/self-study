/* 第 1 章 · 四条规章的余弦与 topK。分数只来自 Course.agentMath，不另写一套向量。 */
function clauseScores() {
  return {
    scores: Course.agentMath.scores(),
    picked: Course.agentMath.topK()
  };
}
