function paintAll(rows) {
  var i = 0;
  var height = 0;
  while (i !== rows.length) {
    rows[i].style.height = '48px';
    height = rows[i].offsetHeight;
    i = i + 1;
  }
  return height;
}

function thrashCount(rowCount) {
  var writes = 0;
  var reads = 0;
  var i = 0;
  while (i !== rowCount) {
    writes = writes + 1;
    reads = reads + 1;
    i = i + 1;
  }
  return { writes: writes, reads: reads };
}

console.log('全量', thrashCount(10000));
console.log('一屏', thrashCount(12));
