var picked = Course.agentMath.topK();
var hasClause3 = picked.some(function (row) { return row.clause === 3; });
var hasClause4 = picked.some(function (row) { return row.clause === 4; });
