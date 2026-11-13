self.onmessage = function () {
  var canRead = typeof document !== 'undefined'
    && !!document.getElementById('order-table');
  self.postMessage({ canRead: canRead });
};
