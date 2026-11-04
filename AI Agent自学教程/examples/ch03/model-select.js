const agent = Course.data.agent;
function modelSelects(question) {
  return {
    name: agent.toolName,
    parameters: { ask: question }
  };
}
const choice = modelSelects(agent.ask);
// choice.name 是 lookupClause。
// choice.parameters.ask 是「报销上限是多少」。
// 这里还没有 clauseNo，也没有 limitYuan。模型不读取规章文件。
