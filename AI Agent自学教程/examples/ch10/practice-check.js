function practiceCheck(agent, math) {
  return {
    limitYuan: agent.limitYuan,
    claimedYuan: agent.claimedYuan,
    overYuan: math.overYuan(),
    clauseNo: agent.clauseNo,
    topK: agent.topK,
    maxSteps: agent.maxSteps,
    memoryKeep: agent.memoryKeep,
    contextChars: agent.contextChars,
    skillCount: agent.skillCount,
    skillLoaded: agent.skillLoaded,
    handbookChars: agent.handbookChars,
    toolName: agent.toolName
  };
}
