const agent = Course.data.agent;
const dim = agent.embedDim;
const query = agent.query;
const clauses = agent.clauses;
// dim 为 4。query 为 [3, 1, 0, 0]。
// 四条依次是 clauses[0] 到 clauses[3]。
