// 回环不放宽上限：与第 4 章同一套四步，第 5 步不发起
// 1 规划；2 行动并观察；3 算出超出并等待确认；4 确认后回答
const maxSteps = 4;

function nextStep(state) {
  if (state.step >= maxSteps) {
    return { ...state, status: 'stopped' };
  }
  return { ...state, step: state.step + 1, status: 'running' };
}

console.log(nextStep({ step: 3 }).step);   // 4
console.log(nextStep({ step: 4 }).status); // stopped
