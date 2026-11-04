/** 开发服务器上的假接口。HTTP 都是 200，成功与否看 JSON 里的 code。 */
const employees = [
  {
    id: 'e1',
    name: '周宁',
    age: 28,
    active: true,
    tags: ['平台'],
    status: '在职',
    dept: '客户端',
  },
  {
    id: 'e2',
    name: '李想',
    age: 31,
    active: true,
    tags: ['服务', '联调'],
    status: '在职',
  },
  {
    id: 'e3',
    name: '陈默',
    age: 26,
    active: false,
    tags: [],
    status: '离职',
    dept: null,
  },
];

function send(res, body) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function mockApi(req, res, next) {
  const pathname = (req.url || '').split('?')[0];
  if (!pathname.startsWith('/api')) {
    next();
    return;
  }

  const route = pathname.slice('/api'.length);

  if (req.method === 'GET' && route === '/employees') {
    send(res, { code: 200, data: employees });
    return;
  }

  if (req.method === 'GET' && route === '/fail') {
    send(res, { code: 500, data: null, msg: '业务失败' });
    return;
  }

  if (req.method === 'POST' && route === '/employees') {
    readBody(req)
      .then((payload) => {
        const created = { ...payload, id: `e${Date.now()}` };
        employees.unshift(created);
        send(res, { code: 200, data: created });
      })
      .catch(() => send(res, { code: 400, data: null, msg: '请求体无法解析' }));
    return;
  }

  const removed = route.match(/^\/employees\/([^/]+)$/);
  if (req.method === 'DELETE' && removed) {
    const index = employees.findIndex((item) => item.id === removed[1]);
    if (index >= 0) employees.splice(index, 1);
    send(res, { code: 200, data: true });
    return;
  }

  send(res, { code: 404, data: null, msg: '没有这个接口' });
}

module.exports = { mockApi };
