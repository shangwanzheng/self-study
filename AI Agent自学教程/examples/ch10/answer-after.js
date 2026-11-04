function answerAfterConfirm(agent) {
  const text = '上限' + agent.limitYuan + '元，超出' + agent.overYuan + '元。';
  return {
    text: text,
    wroteLimit: text.indexOf(String(agent.limitYuan)) !== -1,
    wroteOver: text.indexOf(String(agent.overYuan)) !== -1
  };
}
