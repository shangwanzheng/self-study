var clauseNames = ['考勤', '请假', '报销', '差旅'];
var limitYuan = 200;
var edges = [{ from: '超了', clauseNo: 3 }];

function follow(mode) {
  if (mode === '按词「上周」') {
    return {
      clauseNo: 1,
      name: clauseNames[0],
      limitYuan: null
    };
  }
  var edge = edges[0];
  return {
    clauseNo: edge.clauseNo,
    name: clauseNames[edge.clauseNo - 1],
    limitYuan: limitYuan
  };
}

console.log(follow('按词「上周」').name);
console.log(follow('按图谱').name, follow('按图谱').limitYuan);
