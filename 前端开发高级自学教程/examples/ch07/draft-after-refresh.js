var storageKey = 'order.draft';

// 独立浏览器：刷新后 localStorage 还在。
// WebView：存储以宿主文档为准。这里这一档返回 false，真实宿主可能不同。
function draftRemainsAfterRefresh(hostKind) {
  if (hostKind === 'browser') return true;
  return false;
}

console.log(storageKey);
console.log(draftRemainsAfterRefresh('browser'));
console.log(draftRemainsAfterRefresh('webview'));
