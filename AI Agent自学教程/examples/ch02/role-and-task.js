var role = '档案助理。按规章回答。';
var task = '从「上周报销超了：上限 200 元，这单填了 350 元。」抽出 limitYuan、claimedYuan、overYuan 三个整数。缺一个就停。';

function promptParts() {
  return { role: role, task: task };
}

console.log(promptParts().role);
console.log(promptParts().task);
