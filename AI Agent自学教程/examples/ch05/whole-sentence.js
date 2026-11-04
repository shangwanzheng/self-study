const agent = Course.data.agent;
const ask = agent.ask;
const query = agent.query;
// ask 是整句「报销上限是多少」，对应向量 query。
// 单字「报」没有单独的向量。检索用的是句向量这一套。
