function loadSkills(agent) {
  const names = [agent.clauseNames[agent.clauseNo - 1], agent.clauseNames[agent.clauseCount - 1]];
  const loaded = names.slice(0, agent.skillLoaded);
  return {
    skillCount: agent.skillCount,
    skillLoaded: loaded.length,
    loaded: loaded,
    leftOut: names.slice(loaded.length)
  };
}
