// 刷新后从检查点读回观察，原样使用，不改写上限
function loadCheckpoint(store, threadId) {
  const raw = store[threadId];
  return raw ? JSON.parse(raw) : null;
}

const saved = {
  'demo-thread': '{"step":2,"status":"observed","observation":{"tool":"lookupClause","clauseNo":3,"limitYuan":200}}'
};

const restored = loadCheckpoint(saved, 'demo-thread');
console.log(restored.observation.limitYuan); // 200

const lost = loadCheckpoint({}, 'demo-thread');
console.log(lost); // null：没有检查点，这次观察就没了
