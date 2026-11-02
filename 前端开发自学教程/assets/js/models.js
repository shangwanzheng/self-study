/* 教学订单页基准算例。纯计算，无 DOM。
 * 与《Java服务开发自学教程》共用同一笔订单的 id、金额、分页和超时。
 * 雪花 id 只以字符串存放，禁止写成 JS 数字字面量。
 */
(function (global) {
  'use strict';
  const Course = (global.Course = global.Course || {});
  const order = {
    name: '教学订单页',
    userIdText: '10001',
    snowflakeText: '9007199254740993',
    snowflakeRoundedText: '9007199254740992',
    maxSafeText: '9007199254740991',
    amountYuan: 199.5,
    amountFen: 19950,
    stock: 8,
    page: 1,
    size: 20,
    listN: 10000,
    connectTimeoutMs: 500,
    readTimeoutMs: 2000,
    browserTimeoutMs: 3000,
    qpsTeach: 50,
    route: '/orders',
    apiPath: '/api/orders',
    pageOrigin: 'http://localhost:5173',
    apiOrigin: 'http://localhost:8080',
    businessCodeOk: 0,
    businessCodeFail: 40001,
    httpOk: 200,
    frameBudgetMs: 16.7,
    longTaskMs: 50,
    rowHeightPx: 48,
    viewportRows: 12,
    bundleMainKb: 180,
    bundleVendorKb: 420,
    bundleRouteKb: 40,
    htmlMaxAgeSec: 60,
    assetMaxAgeSec: 31536000,
    storageKey: 'order.draft',
    cookieName: 'sid',
    nodeMajor: 20,
    semverLocked: '1.4.2',
    semverUnlocked: '1.5.0',
    clsShiftPx: 48,
    secretName: 'ORDER_API_SECRET'
  };

  function pageCount(o) {
    o = o || order;
    return Math.ceil(o.listN / o.size);
  }
  function visiblePx(o) {
    o = o || order;
    return o.viewportRows * o.rowHeightPx;
  }
  function fullListPx(o) {
    o = o || order;
    return o.listN * o.rowHeightPx;
  }
  function firstScreenKb(o) {
    o = o || order;
    return o.bundleMainKb + o.bundleVendorKb;
  }
  function yuanText(fen) {
    const n = fen === undefined ? order.amountFen : fen;
    const sign = n < 0 ? '-' : '';
    const v = Math.abs(Math.trunc(n));
    const whole = Math.floor(v / 100);
    const frac = String(v % 100).padStart(2, '0');
    return sign + whole + '.' + frac;
  }
  function jsonNumberRoundTrip(text) {
    return JSON.stringify(JSON.parse(text));
  }
  function isSafeId(text) {
    const n = Number(text);
    return Number.isSafeInteger(n) && String(n) === text;
  }
  function compareCost(n) {
    const x = Math.max(1, n);
    return { linear: x, nLogN: x * Math.log2(x) };
  }

  Course.data = { order: order };
  Course.orderMath = {
    pageCount: pageCount,
    visiblePx: visiblePx,
    fullListPx: fullListPx,
    firstScreenKb: firstScreenKb,
    yuanText: yuanText,
    jsonNumberRoundTrip: jsonNumberRoundTrip,
    isSafeId: isSafeId,
    compareCost: compareCost
  };
})(typeof window !== 'undefined' ? window : this);
