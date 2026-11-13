function networkKind(sizeText, status) {
  if (sizeText === '(memory cache)') return '内存缓存';
  if (sizeText === '(disk cache)') return '磁盘缓存';
  if (status === 304) return '协商缓存';
  return '重新下载';
}

console.log(networkKind('(memory cache)', 200));
console.log(networkKind('(disk cache)', 200));
console.log(networkKind('0.3 kB', 304));
console.log(networkKind('180 kB', 200));
