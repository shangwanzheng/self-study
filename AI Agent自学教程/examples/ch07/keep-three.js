function keepThree(notes, memoryKeep) {
  var ranked = notes.slice().sort(function (a, b) {
    return b.importance - a.importance;
  });
  return ranked.slice(0, memoryKeep);
}
