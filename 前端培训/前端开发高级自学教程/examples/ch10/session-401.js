function handleResponse(res, order, refreshOnce, replay) {
  if (res.status === 401) {
    return refreshOnce().then(replay);
  }
  var httpOk = res.status === order.httpOk;
  var bizOk = res.code === order.businessCodeOk;
  if (httpOk && bizOk) {
    return { ok: true, showList: true };
  }
  return { ok: false, showList: false, code: res.code };
}
