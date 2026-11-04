var skillCount = 2;
var skillLoaded = 1;
var skillNames = ['报销', '差旅'];

function loadSkills(mode) {
  if (mode === '两个都读') {
    return {
      found: skillCount,
      loaded: skillCount,
      names: skillNames.slice()
    };
  }
  return {
    found: skillCount,
    loaded: skillLoaded,
    names: skillNames.slice(0, skillLoaded)
  };
}

console.log(loadSkills('先读 1 个').loaded, loadSkills('先读 1 个').names.join('、'));
console.log(loadSkills('两个都读').loaded, loadSkills('两个都读').names.join('、'));
