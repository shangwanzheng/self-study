const ask = '报销上限是多少';
const called = {};

function lookupClause(askText) {
  if (called[askText]) return { calledAgain: true };
  called[askText] = true;
  if (askText === ask) return { calledAgain: false, limitYuan: 200 };
  return { calledAgain: false, limitYuan: null };
}

const first = lookupClause(ask);
const second = lookupClause(ask);
