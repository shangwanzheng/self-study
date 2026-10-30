/* 教学订单基准算例。纯计算，无 DOM。 */
(function (global) {
  'use strict';
  const Course = (global.Course = global.Course || {});
  const order = {
    name: '教学订单',
    userId: 10001,
    userIdText: '10001',
    snowflakeText: '9007199254740993',
    snowflakeRoundedText: '9007199254740992',
    amountYuan: 199.5,
    amountFen: 19950,
    stock: 8,
    page: 1,
    size: 20,
    poolCore: 4,
    poolMax: 8,
    queueCapacity: 100,
    connectTimeoutMs: 500,
    readTimeoutMs: 2000,
    browserTimeoutMs: 3000,
    listN: 10000,
    hashCap: 16,
    loadFactor: 0.75,
    qpsTeach: 50,
    heapXmsMb: 256,
    heapXmxMb: 512,
    jdk: 17
  };
  Course.data = { order: order };
  Course.orderMath = {
    hashThreshold: function (o) {
      o = o || order;
      return o.hashCap * o.loadFactor;
    },
    rejectTaskNo: function (o) {
      o = o || order;
      return o.poolCore + o.queueCapacity + (o.poolMax - o.poolCore) + 1;
    }
  };
})(typeof window !== 'undefined' ? window : this);
