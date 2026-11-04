function gateAnswer(agent, confirmed) {
  if (!confirmed) return { answered: false, text: '' };
  return {
    answered: true,
    text: '上限' + agent.limitYuan + '元，超出' + agent.overYuan + '元。'
  };
}
