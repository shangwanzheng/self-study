var cookieName = 'sid';
var storageKey = 'order.draft';

// 键是 sid：采用当前 cookie，不返回旧的 memorySid。
// 键是 order.draft：登录态不动。函数里没有把 sid 写回 cookie。
function sidAfterStorage(event, memorySid, cookieSid) {
  if (event && event.key === cookieName) return cookieSid;
  return memorySid;
}

var fromSid = sidAfterStorage({ key: cookieName }, 'old-sid', 'new-sid');
var fromDraft = sidAfterStorage({ key: storageKey }, 'old-sid', 'new-sid');
console.log(fromSid);
console.log(fromSid === 'old-sid');
console.log(fromDraft);
