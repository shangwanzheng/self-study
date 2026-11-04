// 人工确认是外部输入，写回状态后才进入第 4 步回答；确认本身不是模型调用
function confirmByHuman(state) {
  return { ...state, confirmed: true, status: 'answer', step: state.step + 1 };
}

function finalAnswer(state) {
  if (state.status === 'waitHuman' || state.confirmed !== true) {
    return '';
  }
  return '报销上限 ' + state.observation.limitYuan + ' 元，这单超出 ' + state.overYuan + ' 元。';
}

const waiting = { step: 3, status: 'waitHuman', confirmed: false, overYuan: 150, observation: { limitYuan: 200 } };
const done = confirmByHuman(waiting);
console.log(done.step, finalAnswer(done)); // 4 报销上限 200 元，这单超出 150 元。
