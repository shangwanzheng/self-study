const limitYuan = 200;
const overYuan = 150;

function reply(limit, over) {
  return '上限 ' + limit + ' 元，超出 ' + over + ' 元';
}

const answer = reply(limitYuan, overYuan);
const capOnly = '上限 ' + limitYuan + ' 元';
