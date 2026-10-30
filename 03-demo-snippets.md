# 对照 Demo 与 DevTools 联调录屏脚本

> **90 分钟课**：只做 [00 幻灯 19](./00-90min-slides.md) —— Network 走一条请求，看一眼 Size 是否 disk cache。最多贴 Demo A 的 TS 段。下面三段对照不必进课堂。

---

## Demo A · 异步：请求后更新列表

**教学点**：回调 / CompletableFuture / async-await；前端更新靠 `setState`。

### C++（伪代码）

```cpp
void ProjectPanel::reload() {
  http_->get("/api/projects", [this](Result r) {
    if (!r.ok) { showError(r.msg); return; }
    model_->setItems(parseProjects(r.body));
  });
}
```

### Java

```java
public CompletableFuture<Void> reload() {
  return client.get("/api/projects")
      .thenAccept(list -> ui.setItems(list))
      .exceptionally(ex -> { ui.toast(ex.getMessage()); return null; });
}
```

### TypeScript（本仓风格）

```ts
async function reload(setList: (v: Project[]) => void) {
  try {
    const res = await request.get('/api/projects'); // 拦截器已要求 code===200
    setList(res.data);
  } catch (e: any) {
    alertMessage.error({ content: e?.msg ?? '加载失败' });
  }
}
```

**口播**：三端都是「发请求 → 稍后再更新 UI」；前端禁止在回调外假设数据已到。

---

## Demo B · UI：Qt 改控件 vs React 声明式

**教学点**：命令式改属性 vs `UI = f(state)`。

### C++ Qt（伪）

```cpp
void onLoaded(int n) {
  statusLabel_->setText(QString("共 %1 项").arg(n));
  refreshBtn_->setEnabled(true);
}
```

### React（本仓风格）

```tsx
function ProjectHeader({ count }: { count: number }) {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <span>共 {count} 项</span>
      <button disabled={loading} onClick={() => setLoading(true)}>刷新</button>
    </>
  );
}
```

**口播**：Qt 是「找到控件改它」；React 是「改 state，函数再跑一遍生成新 UI 描述」。

---

## Demo C · 横切：Filter vs axios 拦截器

**教学点**：鉴权头、业务码、401 —— 与本仓 [`src/utils/request/request.ts`](../../src/utils/request/request.ts) 对齐。

### Java Filter（示意）

```java
public void doFilter(req, res, chain) {
  String auth = req.getHeader("Authorization");
  if (!jwt.valid(auth)) { res.setStatus(401); return; }
  chain.doFilter(req, res);
}
```

### 本仓 axios（精简对照，非逐字拷贝）

```ts
// 请求：塞 Bearer
config.headers.Authorization = token && `Bearer ${token}`;

// 响应：业务码
if (data.code === 401) { alertModal.warning({ title: '账号登录已过期', onOk: goLogin }); }
else if (data.code === 200) return data;
else return Promise.reject(data);
```

### C++ 统一封装（伪）

```cpp
Response call(Request req) {
  req.headers["Authorization"] = "Bearer " + token_;
  auto res = transport_.send(req);
  if (res.bizCode == 401) { onLogout(); }
  return res;
}
```

**口播**：拦截器 = 全局 Filter；本仓成功条件是 **`code === 200`**，不要只看 HTTP 状态。

---

## DevTools 联调录屏脚本（讲师课前录 3～5 分钟）

无法在仓库内嵌入真实视频；按下表自行录制，课堂播放。

### 素材 1 · 正常成功请求（约 60s）

1. `npm start`，登录进入工作台或任意列表页  
2. F12 → **Network** → 勾选 Preserve log  
3. 触发一次列表刷新  
4. 点开一条 XHR/Fetch：  
   - Request Headers 指出 `Authorization: Bearer …`  
   - Response 指出 `{ code: 200, data: … }`  
5. 口播：拦截器在 `code===200` 时把 `data` 交给页面

### 素材 2 · 业务失败 `code !== 200`（约 60s）

1. 用 Mock、断点或后端配合返回例如 `{ code: 50001, msg: "…" }` 且 HTTP 仍 200  
2. Network 里看到 HTTP 200，但 Console/页面 toast 报错  
3. 口播：**坑点** —— HTTP 成功 ≠ 业务成功；对照 Java 全局 `Result` 包装

### 素材 3 · 401 / 登录过期（约 90s）

1. Application → Local Storage / 本仓 Token 存储处，删改 token，或等过期  
2. 再点一个需登录接口  
3. 观察：弹窗「账号登录已过期」或跳转登录；Network 里 401 或 body.code=401  
4. 若在 CS 嵌入环境：说明会走 `CsAppManager` 登出，与纯浏览器分流

### 可选素材 · CORS 失败（给 Java 看）

1. 临时让 API 域与页面域不一致且无 CORS 头  
2. Console 出现 CORS 红字；Network 可能只有 OPTIONS 或 (failed)  
3. 口播：后端日志可能已有请求，前端却像「没发出」——查响应头与网关

---

## 录屏口播逐字稿（可粘贴到提词器）

> 我们打开 Network。这条请求头里有 Bearer，和 Java 的鉴权 Filter 是一对。  
> 响应体先看 code：200 才进页面逻辑；其它 code 在拦截器里被 reject，页面用 catch 或全局提示。  
> 如果只看 HTTP 状态，会误判 —— 这是前后端联调第一纪律。  
> 401 时前端清 token 并跳登录，和 C++ 客户端收到「会话失效」后清本地凭证是同一类问题。

---

## 课堂演示检查清单

- [ ] Demo A/B/C 幻灯各一页，或投影本文件  
- [ ] 三段录屏可播，失败态至少覆盖「业务 code」与「401」各一次  
- [ ] 学员机器能开 DevTools（公司安全策略允许）  
- [ ] 指出本仓文件：`src/utils/request/request.ts`、`src/index.tsx`
