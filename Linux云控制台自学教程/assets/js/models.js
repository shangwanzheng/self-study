/* Linux 云控制台自学教程 · 纯计算，无 DOM。
 * 全课数字只放在 baseline 里。章节只调用这里的函数。
 */
(function (global) {
  'use strict';
  const Course = (global.Course = global.Course || {});
  const B = {
    name: 'web-demo',
    id: 'i-demo0001',
    region: 'cn-demo-1',
    zone: 'cn-demo-1a',
    image: 'Ubuntu 22.04 LTS',
    user: 'ubuntu',
    vcpu: 2,
    memGiB: 4,
    sysDiskGiB: 40,
    sysDev: '/dev/vda',
    dataDev: '/dev/vdb',
    dataBlockGiB: 100,
    dataFsGiB: 20,
    dataMount: '/data',
    privateIp: '10.0.1.15',
    privatePrefix: 24,
    publicIp: '203.0.113.15',
    adminIp: '198.51.100.20',
    adminPrefix: 32,
    sg: 'sg-web-demo',
    keyName: 'demo-key',
    sshPort: 22,
    httpPort: 80,
    home: '/home/ubuntu',
    sshDir: '/home/ubuntu/.ssh',
    authKeys: '/home/ubuntu/.ssh/authorized_keys',
    nginxConf: '/etc/nginx/nginx.conf',
    webRoot: '/var/www/html/index.html',
    errorLog: '/var/log/nginx/error.log',
    unit: 'nginx',
    pkg: 'nginx',
    host: 'web-demo',
    bind: '0.0.0.0',
    loopback: '127.0.0.1',
    suggestDir: 0o700,
    suggestKey: 0o600
  };

  const commands = {
    ssh: 'ssh -i demo-key.pem ubuntu@203.0.113.15',
    install: 'sudo apt-get install -y nginx',
    start: 'sudo systemctl start nginx',
    status: 'systemctl status nginx',
    ss: 'ss -ltn',
    df: 'df -h /data',
    resize: 'sudo resize2fs /dev/vdb',
    journal: 'journalctl -u nginx -n 20 --no-pager',
    ufw: 'sudo ufw status'
  };

  function groupOrOtherWritable(mode) {
    return (mode & 0o022) !== 0;
  }

  /** sshd StrictModes：属主必须是登录用户，目录和 authorized_keys 都不能对组或其他人可写。 */
  function sshAccepts(dirMode, keyMode, ownerIsUser) {
    if (!ownerIsUser) return { ok: false, reason: '属主不是 ubuntu' };
    if ((dirMode & 0o500) !== 0o500) return { ok: false, reason: '属主进不了 .ssh' };
    if (groupOrOtherWritable(dirMode)) return { ok: false, reason: '.ssh 对组或其他人可写' };
    if ((keyMode & 0o400) !== 0o400) return { ok: false, reason: '属主读不了 authorized_keys' };
    if (groupOrOtherWritable(keyMode)) return { ok: false, reason: 'authorized_keys 对组或其他人可写' };
    return { ok: true, reason: 'sshd 接受这把密钥' };
  }

  /** 本章不把文件权限算进登录；permOk 由调用方传入。 */
  function loginOk(opts) {
    if (!opts || opts.user !== B.user) return { ok: false, reason: '用户名不是 ubuntu' };
    if (!opts.keyBound) return { ok: false, reason: '密钥 demo-key 未绑定到这台实例' };
    if (!opts.sg22) return { ok: false, reason: '安全组未放行 TCP 22' };
    if (!opts.permOk) return { ok: false, reason: '服务器上的密钥文件权限被 sshd 拒绝' };
    return { ok: true, reason: '可以登录' };
  }

  function normalize(path) {
    const parts = [];
    String(path).split('/').forEach((seg) => {
      if (seg === '' || seg === '.') return;
      if (seg === '..') { parts.pop(); return; }
      parts.push(seg);
    });
    return '/' + parts.join('/');
  }

  function resolve(cwd, input) {
    const text = String(input || '');
    if (!text) return normalize(cwd || '/');
    if (text.charAt(0) === '/') return normalize(text);
    const base = String(cwd || '/').replace(/\/$/, '');
    return normalize(base + '/' + text);
  }

  /**
   * 公网访问 TCP 80。
   * 安全组或已启用的 ufw 没放行：连不上。
   * 两道门都过了但没有进程，或进程只听 127.0.0.1：连接被拒绝。
   */
  function reach80(opts) {
    const o = opts || {};
    if (!o.sg80) return { result: 'timeout', label: '连不上', reason: '安全组 sg-web-demo 未放行 TCP 80' };
    if (o.ufwActive && !o.ufwAllow80) return { result: 'timeout', label: '连不上', reason: 'ufw 已启用且未放行 TCP 80' };
    if (!o.listening) return { result: 'refused', label: '连接被拒绝', reason: '两道门都放行，但没有进程监听 80' };
    if (o.bind !== B.bind) return { result: 'refused', label: '连接被拒绝', reason: '进程只听 127.0.0.1，公网到不了' };
    return { result: 'open', label: '打得开', reason: '安全组、ufw 和 0.0.0.0:80 都成立' };
  }

  /** 实例在跑，也不等于 80 端口有进程在听。 */
  function httpListen(opts) {
    const o = opts || {};
    if (!o.installed) return { ok: false, step: '未安装', detail: '镜像里没有 nginx' };
    if (!o.active) return { ok: false, step: '未运行', detail: '包在，但 nginx 不是 active' };
    if (!o.listening) return { ok: false, step: '未监听', detail: '服务是 active，但没有套接字听 80' };
    if (o.bind !== B.bind) return { ok: false, step: '只听本机', detail: '听在 127.0.0.1，公网访问会被拒绝' };
    return { ok: true, step: '在听', detail: '0.0.0.0:80' };
  }

  function canWriteEtc(user, useSudo) {
    if (user === 'root') return { ok: true, reason: 'root 可以直接写 /etc/nginx/nginx.conf' };
    if (user === B.user && useSudo) return { ok: true, reason: 'ubuntu 通过 sudo 可以写' };
    if (user === B.user) return { ok: false, reason: 'ubuntu 没有 sudo 时写不了 /etc' };
    return { ok: false, reason: '不是这台实例的登录用户' };
  }

  function dfDataGiB(resized) {
    return resized ? B.dataBlockGiB : B.dataFsGiB;
  }

  /**
   * 走通章用的四种现象。不引入基准以外的端口和地址。
   * symptom: ssh | refused | timeout | disk
   */
  function evidence(symptom) {
    if (symptom === 'ssh') {
      return {
        title: 'ssh 连不上',
        where: '安全组 sg-web-demo 的 TCP 22，来源是否仍是 198.51.100.20/32；用户名是否是 ubuntu；密钥文件权限是否被 sshd 接受',
        command: commands.ssh
      };
    }
    if (symptom === 'timeout') {
      return {
        title: '网页一直转',
        where: '安全组是否放行 TCP 80；若 ufw 已启用，是否放行 80',
        command: commands.ufw
      };
    }
    if (symptom === 'refused') {
      return {
        title: '网页连接被拒绝',
        where: 'nginx 是否 active，以及是否听在 0.0.0.0:80',
        command: commands.journal
      };
    }
    if (symptom === 'disk') {
      return {
        title: '控制台已是 100 GiB，df 仍是 20 GiB',
        where: '/dev/vdb 的文件系统还没变大',
        command: commands.resize
      };
    }
    return { title: '未知现象', where: '', command: '' };
  }

  Course.linux = {
    baseline: B,
    commands: commands,
    sshAccepts: sshAccepts,
    loginOk: loginOk,
    resolve: resolve,
    reach80: reach80,
    httpListen: httpListen,
    canWriteEtc: canWriteEtc,
    dfDataGiB: dfDataGiB,
    evidence: evidence
  };
})(typeof window !== 'undefined' ? window : globalThis);
