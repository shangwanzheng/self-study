function whereOrderData(shape) {
  if (shape === 'MPA') {
    return {
      where: '服务端那一次',
      which: '这次导航的文档请求，表写进 HTML',
      table: '有',
      sameOpen: '是'
    };
  }
  if (shape === 'SPA') {
    return {
      where: '浏览器这一次请求',
      which: '拿到壳之后请求 /api/orders',
      table: '没有',
      sameOpen: '否'
    };
  }
  if (shape === 'SSR') {
    return {
      where: '服务端那一次',
      which: '打开时渲染 /orders',
      table: '有',
      sameOpen: '是'
    };
  }
  if (shape === 'SSG') {
    return {
      where: '服务端那一次',
      which: '构建时写入，不是打开时',
      table: '有',
      sameOpen: '否'
    };
  }
  return null;
}

console.log('SSR', whereOrderData('SSR').which);
console.log('SSG', whereOrderData('SSG').which);
