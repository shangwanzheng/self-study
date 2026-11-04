/* 第 1 章 · 读取全课唯一档案。金额只读 Course.data.agent，超出只调用 Course.agentMath.overYuan。 */
function readDossier() {
  var A = Course.data.agent;
  var over = Course.agentMath.overYuan();
  return {
    sentence: A.sentence,
    limitYuan: A.limitYuan,
    claimedYuan: A.claimedYuan,
    overYuan: over,
    toolName: A.toolName,
    clauseNo: A.clauseNo
  };
}
