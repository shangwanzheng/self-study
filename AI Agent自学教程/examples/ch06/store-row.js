var agent = Course.data.agent;
var rows = agent.clauses.map(function (vector, i) {
  return { chunk: i + 1, dim: vector.length, vector: vector.slice() };
});
