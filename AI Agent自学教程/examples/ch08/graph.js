// 有环：观察之后可以回到规划
const edges = {
  plan: ['act', 'waitHuman', 'answer'],
  act: ['observe'],
  observe: ['plan'],
  waitHuman: ['answer'],
  answer: []
};

console.log(edges.observe); // [ 'plan' ]
