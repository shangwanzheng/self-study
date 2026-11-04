const maxSteps = 4;
const claimedYuan = 350;
const ask = '报销上限是多少';
const toolName = 'lookupClause';

function lookupClause(askText) {
  if (askText === ask) return { limitYuan: 200 };
  return null;
}

const steps = [];
steps.push({ step: 1, thought: '想到要查规章' });
const observation = lookupClause(ask);
steps.push({ step: 2, action: toolName, observation: observation });
const limitYuan = observation.limitYuan;
const overYuan = claimedYuan - limitYuan;
steps.push({ step: 3, claimedYuan: claimedYuan, limitYuan: limitYuan, overYuan: overYuan });
steps.push({ step: 4, answer: '上限 ' + limitYuan + ' 元，超出 ' + overYuan + ' 元' });
const finished = steps.length === maxSteps;
