function createRequestCache() {
  var box = {};
  return {
    key: function (order, page) {
      return order.apiPath + '?page=' + page + '&size=' + order.size;
    },
    get: function (key) { return box[key]; },
    set: function (key, rows) { box[key] = rows; },
    drop: function (key) { delete box[key]; }
  };
}
