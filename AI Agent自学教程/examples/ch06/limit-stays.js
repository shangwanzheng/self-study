var agent = Course.data.agent;
var picked = Course.agentMath.topK();
var limitYuan = picked[0].clause === agent.clauseNo ? agent.limitYuan : null;
