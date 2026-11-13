function createRefreshOnce(sendRefresh) {
  var inflight = null;
  return function refreshOnce() {
    if (inflight) return inflight;
    inflight = Promise.resolve()
      .then(function () { return sendRefresh(); })
      .then(function (session) {
        inflight = null;
        return session;
      }, function (err) {
        inflight = null;
        throw err;
      });
    return inflight;
  };
}
