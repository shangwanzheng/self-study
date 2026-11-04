function sharedLimit(agent, eachWrites) {
  const roles = ['查档的', '核对的'];
  return {
    roles: roles,
    copies: eachWrites ? roles.length : 1,
    limitYuan: agent.limitYuan
  };
}
