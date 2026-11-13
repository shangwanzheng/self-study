var listN = 10000;
var viewportRows = 12;
var rowHeightPx = 48;

function listView(virtual) {
  if (virtual) {
    return {
      domRows: viewportRows,
      heightPx: viewportRows * rowHeightPx
    };
  }
  return {
    domRows: listN,
    heightPx: listN * rowHeightPx
  };
}

console.log('全量 DOM', listView(false));
console.log('虚拟列表', listView(true));
