const agent = Course.data.agent;
const toolSpec = {
  name: agent.toolName,
  parameters: {
    ask: '要查的问句，字符串'
  },
  returns: {
    clauseNo: '命中条目的序号',
    name: '条目名',
    limitYuan: '这一条的报销上限，单位是元；该条没有上限时为空'
  }
};
// name 来自 agent.toolName，就是 lookupClause。
// 说明书只写名字、参数和返回。某一家接口的私有字段以该家文档原文为准。
