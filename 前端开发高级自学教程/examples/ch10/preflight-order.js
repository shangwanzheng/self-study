function releaseCheck(order) {
  return {
    entryMaxAgeSec: order.htmlMaxAgeSec,
    assetMaxAgeSec: order.assetMaxAgeSec,
    httpOk: order.httpOk,
    businessCodeOk: order.businessCodeOk,
    businessCodeFail: order.businessCodeFail,
    amountFen: order.amountFen,
    connectTimeoutMs: order.connectTimeoutMs,
    readTimeoutMs: order.readTimeoutMs,
    browserTimeoutMs: order.browserTimeoutMs
  };
}
