// 链式：只有向前的边，观察之后没有路回到规划
const chain = ['plan', 'act', 'observe', 'answer'];

function nextInChain(node) {
  const i = chain.indexOf(node);
  return chain[i + 1] || null;
}

console.log(nextInChain('observe')); // answer，回不到 plan
