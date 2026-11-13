function currentBridge(win) {
  return win.OrderBridge || null;
}

function currentSocket(win) {
  var bridge = currentBridge(win);
  if (!bridge) return null;
  return bridge.socket || null;
}

var hostWindow = {
  OrderBridge: { socket: { name: 'host-socket' } }
};
var pageMemory = { socket: { name: 'page-socket' } };

console.log(currentBridge(hostWindow) === hostWindow.OrderBridge);
console.log(currentSocket(hostWindow).name);
console.log(currentSocket(pageMemory));
