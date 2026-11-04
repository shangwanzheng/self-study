// 回到规划后先算超出；超出就转入等人，不往回答走
function planAfterObserve(state, claimedYuan) {
  const overYuan = claimedYuan - state.observation.limitYuan;
  const next = { ...state, step: state.step + 1, overYuan: overYuan };
  if (overYuan > 0) {
    return { ...next, status: 'waitHuman', confirmed: false };
  }
  return { ...next, status: 'answer' };
}

const s = planAfterObserve({ step: 2, observation: { limitYuan: 200 } }, 350);
console.log(s.step, s.status, s.overYuan); // 3 waitHuman 150
