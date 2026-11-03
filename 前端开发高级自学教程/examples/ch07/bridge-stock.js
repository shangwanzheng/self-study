var route = '/orders';
var browserTimeoutMs = 3000;
var stock = 8;

function acceptThisStock(message, requestId, elapsedMs) {
  if (!message || message.domain !== route) return false;
  if (message.requestId !== requestId) return false;
  if (elapsedMs > browserTimeoutMs) return false;
  return message.stock === stock;
}

var requestId = '1';
console.log(acceptThisStock({ domain: '/orders', requestId: '1', stock: 8 }, requestId, 3000));
console.log(acceptThisStock({ domain: '/orders', requestId: '1', stock: 8 }, requestId, 3001));
console.log(acceptThisStock({ domain: '/orders', requestId: '2', stock: 8 }, requestId, 100));
console.log(acceptThisStock({ domain: '/other', requestId: '1', stock: 8 }, requestId, 100));
