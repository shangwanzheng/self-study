function cacheMaxAgeSec(order, kind) {
  if (kind === 'html') return order.htmlMaxAgeSec;
  if (kind === 'asset') return order.assetMaxAgeSec;
  return null;
}
