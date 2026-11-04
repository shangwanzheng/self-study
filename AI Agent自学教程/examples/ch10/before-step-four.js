function beforeStepFour(agent) {
  const overYuan = agent.claimedYuan - agent.limitYuan;
  return {
    aboutTo: agent.maxSteps,
    maxSteps: agent.maxSteps,
    overYuan: overYuan,
    hold: overYuan > 0,
    fifthStep: agent.maxSteps + 1,
    startFifth: false
  };
}
