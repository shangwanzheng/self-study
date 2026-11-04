// 未确认不出最终回答：只认 confirmed === true
function finalAnswer(state) {
  if (state.status === 'waitHuman' || state.confirmed !== true) {
    return '';
  }
  return '报销上限 ' + state.observation.limitYuan + ' 元，这单超出 ' + state.overYuan + ' 元。';
}

const waiting = { status: 'waitHuman', confirmed: false, overYuan: 150, observation: { limitYuan: 200 } };
console.log(JSON.stringify(finalAnswer(waiting))); // ""
