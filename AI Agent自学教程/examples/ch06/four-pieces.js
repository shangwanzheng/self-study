var agent = Course.data.agent;
var pieces = agent.clauseNames.map(function (name, i) {
  return { chunk: i + 1, name: name, chars: agent.chunkChars };
});
