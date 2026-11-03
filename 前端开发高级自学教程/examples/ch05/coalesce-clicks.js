function createLoader() {
  var inflight = {};
  var sent = 0;
  return {
    sent: function () { return sent; },
    load: function (order, page, send) {
      var key = order.apiPath + '?page=' + page + '&size=' + order.size;
      if (inflight[key]) return inflight[key];
      sent += 1;
      var task = send(key).then(function (body) {
        delete inflight[key];
        return body;
      }, function (err) {
        delete inflight[key];
        throw err;
      });
      inflight[key] = task;
      return task;
    }
  };
}
