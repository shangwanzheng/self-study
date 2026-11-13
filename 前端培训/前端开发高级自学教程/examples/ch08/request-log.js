var order = { httpOk: 200, businessCodeFail: 40001 };

function businessLog(kind) {
  if (kind === 'tls' || kind === 'mixed') {
    return { present: '没有', http: null, code: null };
  }
  return { present: '有', http: order.httpOk, code: order.businessCodeFail };
}

console.log(businessLog('tls').present);
console.log(businessLog('tls').code);
console.log(businessLog('mixed').present);
console.log(businessLog('code').present);
console.log(businessLog('code').http);
console.log(businessLog('code').code);
