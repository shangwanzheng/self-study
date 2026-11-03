function commitList(order, cache, key, status, code, nextRows) {
  if (status === order.httpOk && code === order.businessCodeOk) {
    cache.set(key, nextRows);
    return nextRows;
  }
  return cache.get(key);
}
