var agent = Course.data.agent;
var indexQuery = agent.query.slice();
var askQuery = agent.query.slice();
var sameSet = indexQuery.join(',') === askQuery.join(',');
