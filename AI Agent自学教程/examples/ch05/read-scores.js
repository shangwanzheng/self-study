const rows = Course.agentMath.scores();
let nearest = rows[0];
rows.forEach(function (row) {
  if (row.score > nearest.score) nearest = row;
});
// nearest.clause 为 3，nearest.name 为报销。
// nearest.score 来自 scores()，这一条的余弦是 1。
