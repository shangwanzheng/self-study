const maxSteps = 4;

function beginStep(n) {
  if (n > maxSteps) return { step: n, started: false, reading: '停止' };
  return { step: n, started: true, reading: '进行' };
}

const at4 = beginStep(4);
const at5 = beginStep(5);
