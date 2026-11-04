function lookupOnce(agent) {
  return {
    tool: agent.toolName,
    calls: 1,
    clauseNo: agent.clauseNo,
    name: agent.clauseNames[agent.clauseNo - 1],
    limitYuan: agent.limitYuan
  };
}
