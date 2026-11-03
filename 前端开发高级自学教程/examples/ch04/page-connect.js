var worker = new SharedWorker('orders-shared.js');
worker.port.start();
worker.port.onmessage = function (e) {
  // e.data 来自 SharedWorker 里那一条连接的转发
};
worker.port.postMessage({ apiPath: '/api/orders', page: 1, size: 20 });
