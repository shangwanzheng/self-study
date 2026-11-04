// 观察写进检查点：上限 200 元来自 lookupClause 的结果
// store 只是教学替身；真实持久化在服务端，用所选框架文档规定的检查点接口
function saveCheckpoint(store, threadId, state) {
  store[threadId] = JSON.stringify(state);
}

const store = {};
saveCheckpoint(store, 'demo-thread', {
  step: 2,
  status: 'observed',
  observation: { tool: 'lookupClause', clauseNo: 3, limitYuan: 200 }
});

console.log(store['demo-thread']);
