/* 第 1 章 · 上限从哪块来。点亮哪一块都可以问；给出上限的只有工具，规划只负责先查再答。 */
function whereLimit(part) {
  var A = Course.data.agent;
  return {
    asked: '上限从哪块来',
    lit: part,
    from: '工具',
    givesLimit: part === '工具',
    plan: '先查再答',
    toolName: A.toolName,
    limitYuan: A.limitYuan,
    clauseNo: A.clauseNo
  };
}
