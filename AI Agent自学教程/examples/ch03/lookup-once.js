const agent = Course.data.agent;

function lookupClause(ask) {
  if (ask === '差旅') {
    return {
      clauseNo: agent.clauseCount,
      name: agent.clauseNames[agent.clauseCount - 1],
      limitYuan: null
    };
  }
  if (ask === agent.ask) {
    return {
      clauseNo: agent.clauseNo,
      name: agent.clauseNames[agent.clauseNo - 1],
      limitYuan: agent.limitYuan
    };
  }
  return { clauseNo: null, name: null, limitYuan: null };
}

function answerOnce(question) {
  const choice = { name: agent.toolName, parameters: { ask: question } };
  const observation = lookupClause(choice.parameters.ask);
  return { callCount: 1, choice: choice, observation: observation };
}

const once = answerOnce(agent.ask);
// once.callCount 是 1。同一问句不再调用第二次。
// ask 为「报销上限是多少」时，clauseNo 是 3，name 是报销，limitYuan 是 200。
// ask 为「差旅」时，clauseNo 是 4，name 是差旅，limitYuan 为空。
// agent.claimedYuan 是 350，不在 observation 里。
// agent.overYuan 是 150，这次工具不计算它。
// 循环留到第 4 章。这里不按 maxSteps 继续发起。
