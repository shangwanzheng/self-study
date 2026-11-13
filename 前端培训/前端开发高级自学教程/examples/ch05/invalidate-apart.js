function readHttpLayer(order) {
  return {
    htmlMaxAgeSec: order.htmlMaxAgeSec,
    assetMaxAgeSec: order.assetMaxAgeSec
  };
}

function dropMemory(cache, key) {
  cache.drop(key);
}
