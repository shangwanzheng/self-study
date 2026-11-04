/* 车辆多体动力学交互教程 · 共享计算模型 vmd-models.js
 * 纯计算、无 DOM 依赖（可在 Node 中测试）。坐标统一 ISO 8855：X 向前、Y 向左、Z 向上。
 * 内容：课程示例车参数 / 五连杆运动学+静力学 / 简化魔术公式轮胎 / 线性二自由度 / 非线性双轨+侧倾整车 / 预瞄驾驶员 / 工况路径与指标
 */
(function (global) {
  'use strict';
  const VMD = (global.VMD = global.VMD || {});
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, G = 9.81;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => Math.sqrt(dot(a, a));
  const unit = (a) => { const n = norm(a) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  const mv = (R, v) => [dot(R[0], v), dot(R[1], v), dot(R[2], v)];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function rodrigues(th) {
    const a = norm(th);
    if (a < 1e-12) return [[1, -th[2], th[1]], [th[2], 1, -th[0]], [-th[1], th[0], 1]];
    const x = th[0] / a, y = th[1] / a, z = th[2] / a, c = Math.cos(a), s = Math.sin(a), C = 1 - c;
    return [
      [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
      [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
      [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
    ];
  }
  function solveLinear(A, b) {
    const n = b.length, Mx = A.map((r, i) => r.slice().concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(Mx[r][c]) > Math.abs(Mx[p][c])) p = r;
      if (Math.abs(Mx[p][c]) < 1e-14) return null;
      if (p !== c) { const t = Mx[c]; Mx[c] = Mx[p]; Mx[p] = t; }
      for (let r = c + 1; r < n; r++) { const f = Mx[r][c] / Mx[c][c]; for (let k = c; k <= n; k++) Mx[r][k] -= f * Mx[c][k]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = Mx[r][n]; for (let k = r + 1; k < n; k++) s -= Mx[r][k] * x[k]; x[r] = s / Mx[r][r]; }
    return x;
  }

  /* ================================================================== 课程共享数据 */
  VMD.data = VMD.data || {};
  /** 课程示例车（C 级三厢轿车，前置前驱）。全教程统一引用，保证各章数字一致。 */
  VMD.data.refCar = {
    name: '课程示例车（C 级三厢轿车，前置前驱）',
    m: 1600, ms: 1420, muf: 95, mur: 85,        // 整车 / 簧上 / 前轴非簧载 / 后轴非簧载质量 kg
    Iz: 2600, Ixs: 550, Iy: 2700,               // 横摆、簧上侧倾（绕自身质心）、俯仰转动惯量 kg·m²
    L: 2.8, a: 1.2, b: 1.6, h: 0.55,            // 轴距、质心到前轴/后轴距离、质心高度 m
    tf: 1.58, tr: 1.58,                         // 前/后轮距 m
    hrf: 0.08, hrr: 0.12,                       // 前/后侧倾中心高度 m
    Kphif: 60000, Kphir: 35000,                 // 前/后侧倾角刚度（含稳定杆）N·m/rad
    Cphif: 3500, Cphir: 2500,                   // 前/后侧倾阻尼 N·m·s/rad
    rw: 0.32, tireW: 0.225,                     // 轮胎滚动半径、胎宽 m
    steerRatio: 16,                             // 转向系角传动比
    Cf: 92000, Cr: 115000,                      // 线性二自由度模型用前/后轴“等效”侧偏刚度 N/rad（正值）
    CdA: 0.68, rho: 1.2,                        // 风阻面积 m²、空气密度 kg/m³
    wheelRateF: 23000, wheelRateR: 23500,       // 单侧轮心刚度 N/m
    mu: 1.0,
  };
  /** 课程示例：左后五连杆悬架硬点（mm，原点 = 后轴中心在地面的投影，ISO 坐标） */
  VMD.data.fiveLinkHP = {
    note: '左后五连杆示例硬点（教学用，非任何量产车数据）',
    wheelCenter: [0, 790, 320],
    tireRadius: 320, tireWidth: 225,
    links: [
      { key: 'UF', name: '上前连杆', inner: [180, 430, 470], outer: [40, 700, 470], color: 0x2f6fed },
      { key: 'UR', name: '上后连杆', inner: [-230, 450, 462], outer: [-70, 700, 465], color: 0x7048e8 },
      { key: 'LF', name: '下前连杆（推力杆）', inner: [330, 420, 217], outer: [110, 740, 190], color: 0x0c8599 },
      { key: 'LR', name: '下后连杆（弹簧连杆）', inner: [-60, 360, 212], outer: [-40, 750, 180], color: 0x2b8a3e },
      { key: 'TOE', name: '前束连杆', inner: [-210, 380, 300], outer: [-190, 720, 280], color: 0xe8590c },
    ],
    strut: { name: '弹簧减振支柱（静力学示例用的简化）', lower: [-30, 700, 250], upper: [-50, 620, 660] },
  };

  /* ================================================================== 五连杆悬架 */
  VMD.susp = VMD.susp || {};
  /**
   * 五连杆运动学：转向节 6 个位姿未知量（平移 t + 绕设计轮心的旋转向量 θ），
   * 5 个连杆长度约束 + 1 个轮心高度驱动约束，牛顿-拉夫逊求解。
   * const fl = new VMD.susp.FiveLink(hp); const st = fl.solve(轮跳mm, {toeShift: 前束杆内点横向位移mm});
   * st = {ok, iter, wc, cp, spin, toe(°,前束为正), camber(°,顶部向外为正), outer[5], inner[5], strutLower, strutUpper, dX, dY, dYcp}
   */
  class FiveLink {
    constructor(hp) {
      this.hp = clone(hp || VMD.data.fiveLinkHP);
      this.reset();
    }
    reset() {
      const hp = this.hp;
      this.c0 = hp.wheelCenter.slice();
      this.L = hp.links.map((l) => norm(sub(l.outer, l.inner)));
      this.toeIdx = Math.max(0, hp.links.findIndex((l) => l.key === 'TOE'));
      this.x = [0, 0, 0, 0, 0, 0];
      this.design = this._state(this.x, 0, 0);
      this.x = [0, 0, 0, 0, 0, 0];
      return this;
    }
    setHardpoint(i, end, p) { this.hp.links[i][end] = p.slice(); return this.reset(); }
    _G(x, R, p0) { return add(add(mv(R, sub(p0, this.c0)), this.c0), [x[0], x[1], x[2]]); }
    _inner(i, toeShift) { const q = this.hp.links[i].inner; return i === this.toeIdx && toeShift ? [q[0], q[1] + toeShift, q[2]] : q; }
    _F(x, travel, toeShift) {
      const R = rodrigues([x[3], x[4], x[5]]);
      const r = this.hp.links.map((l, i) => {
        const d = sub(this._G(x, R, l.outer), this._inner(i, toeShift));
        return (dot(d, d) - this.L[i] * this.L[i]) / (2 * this.L[i]);
      });
      r.push(x[2] - travel);
      return r;
    }
    _newton(x0, travel, toeShift) {
      let x = x0.slice();
      for (let it = 0; it < 40; it++) {
        const f = this._F(x, travel, toeShift);
        let err = 0;
        for (const v of f) err = Math.max(err, Math.abs(v));
        if (err < 1e-9) return { x, ok: true, iter: it, err };
        const J = [];
        for (let i = 0; i < 6; i++) J.push([0, 0, 0, 0, 0, 0]);
        for (let j = 0; j < 6; j++) {
          const hj = j < 3 ? 1e-5 : 1e-7;
          const xp = x.slice(); xp[j] += hj;
          const fp = this._F(xp, travel, toeShift);
          for (let i = 0; i < 6; i++) J[i][j] = (fp[i] - f[i]) / hj;
        }
        const dx = solveLinear(J, f.map((v) => -v));
        if (!dx) return { x, ok: false, iter: it, err, singular: true };
        x = x.map((v, i) => v + dx[i]);
        if (!x.every(isFinite)) return { x: x0.slice(), ok: false, iter: it, err: Infinity };
      }
      return { x, ok: false, iter: 40, err: Infinity };
    }
    /** 求解给定轮跳（mm，上跳为正）与前束杆内点横移（mm）下的位姿；以上次解为初值（连续化） */
    solve(travel, opts) {
      const toeShift = (opts && opts.toeShift) || 0;
      let res = this._newton(this.x, travel, toeShift);
      if (!res.ok) {
        let x = [0, 0, 0, 0, 0, 0];
        const n = 10;
        for (let k = 1; k <= n; k++) {
          res = this._newton(x, (travel * k) / n, (toeShift * k) / n);
          if (!res.ok) break;
          x = res.x;
        }
      }
      if (res.ok) this.x = res.x;
      const st = this._state(res.ok ? res.x : this.x, travel, toeShift);
      st.ok = res.ok;
      st.iter = res.iter;
      return st;
    }
    _state(x, travel, toeShift) {
      const R = rodrigues([x[3], x[4], x[5]]);
      const hp = this.hp;
      const wc = this._G(x, R, this.c0);
      const s = mv(R, [0, 1, 0]);
      const toe = Math.atan2(s[0], s[1]) * R2D;
      const camber = -Math.asin(Math.max(-1, Math.min(1, s[2]))) * R2D;
      const dn = [0, 0, -1];
      const down = unit(sub(dn, scl(s, dot(dn, s))));
      const cp = add(wc, scl(down, hp.tireRadius));
      const st = {
        x: x.slice(), R, wc, spin: s, toe, camber, cp, travel, toeShift,
        outer: hp.links.map((l) => this._G(x, R, l.outer)),
        inner: hp.links.map((l, i) => this._inner(i, toeShift).slice()),
        strutLower: hp.strut ? this._G(x, R, hp.strut.lower) : null,
        strutUpper: hp.strut ? hp.strut.upper.slice() : null,
      };
      if (this.design) {
        st.dX = wc[0] - this.design.wc[0];
        st.dY = wc[1] - this.design.wc[1];
        st.dYcp = cp[1] - this.design.cp[1];
        st.dXcp = cp[0] - this.design.cp[0];
      }
      return st;
    }
    /** 轮跳扫描：从 0 向两侧连续求解，返回 {travel[], toe[], camber[], dY[], dYcp[], dX[], ok} */
    sweep(from, to, step, opts) {
      const save = this.x.slice();
      const ups = [], downs = [];
      this.x = [0, 0, 0, 0, 0, 0];
      for (let z = 0; z <= to + 1e-9; z += step) ups.push(this.solve(z, opts));
      this.x = [0, 0, 0, 0, 0, 0];
      for (let z = -step; z >= from - 1e-9; z -= step) downs.push(this.solve(z, opts));
      this.x = save;
      const all = downs.reverse().concat(ups);
      return {
        travel: all.map((s) => s.travel), toe: all.map((s) => s.toe), camber: all.map((s) => s.camber),
        dY: all.map((s) => s.dY), dYcp: all.map((s) => s.dYcp), dX: all.map((s) => s.dX),
        ok: all.every((s) => s.ok), states: all,
      };
    }
    /** 两个相邻位姿 → 瞬时螺旋轴 {point(mm), dir, omega, pitch} */
    static screwAxis(s1, s2) {
      const dR = [0, 1, 2].map((i) => [0, 1, 2].map((j) => dot(s2.R[i], [s1.R[j][0], s1.R[j][1], s1.R[j][2]])));
      const w = [(dR[2][1] - dR[1][2]) / 2, (dR[0][2] - dR[2][0]) / 2, (dR[1][0] - dR[0][1]) / 2];
      const v = sub(s2.wc, s1.wc);
      const w2 = dot(w, w);
      if (w2 < 1e-18) return null;
      let dir = scl(w, 1 / Math.sqrt(w2));
      if (dir[2] < 0) dir = scl(dir, -1);
      const point = add(s1.wc, scl(cross(w, v), 1 / w2));
      return { point, dir, omega: Math.sqrt(w2), pitch: dot(w, v) / w2 };
    }
    /** 虚拟主销：固定轮跳，前束杆内点微小横移时转向节的瞬时转动轴 */
    kingpin(travel, dShift) {
      const d = dShift || 0.5;
      const save = this.x.slice();
      const a = this.solve(travel, { toeShift: -d });
      const b = this.solve(travel, { toeShift: d });
      this.x = save;
      const ax = FiveLink.screwAxis(a, b);
      if (!ax) return null;
      const n = ax.dir, p = ax.point;
      const tg = -p[2] / n[2];
      const ground = add(p, scl(n, tg));
      const cp = this.solve(travel).cp;
      this.x = save;
      return Object.assign(ax, {
        ground,
        kpi: Math.atan2(-n[1], n[2]) * R2D,          // 主销内倾角（左轮，顶部向车内倾为正）
        caster: Math.atan2(-n[0], n[2]) * R2D,       // 主销后倾角（顶部向后为正）
        scrub: cp[1] - ground[1],                    // 主销偏移距 mm（地面交点在接地点内侧为正）
        trail: ground[0] - cp[0],                    // 主销拖距 mm（地面交点在接地点前方为正）
      });
    }
    /**
     * 静力学：5 根二力杆 + 1 根支柱（共 6 个轴力）与外载平衡（转向节自由体）。
     * F = 外力 [N]（作用于 at 点，mm，默认接地点），Mo = 外力矩 [N·m]。
     * 返回 forces[6]（N，正 = 拉、负 = 压；前 5 个对应 links，最后 1 个为支柱）。
     */
    linkForces(st, F, at, Mo) {
      const P = [], U = [];
      st.outer.forEach((p, i) => { P.push(p); U.push(unit(sub(st.inner[i], p))); });
      if (!st.strutLower) return null;
      P.push(st.strutLower);
      U.push(unit(sub(st.strutUpper, st.strutLower)));
      const c = st.wc;
      const A = [[], [], [], [], [], []];
      for (let k = 0; k < 6; k++) {
        const r = scl(sub(P[k], c), 1e-3);
        const m = cross(r, U[k]);
        for (let i = 0; i < 3; i++) { A[i][k] = U[k][i]; A[i + 3][k] = m[i]; }
      }
      const ap = scl(sub(at || st.cp, c), 1e-3);
      const mF = cross(ap, F);
      const M0 = Mo || [0, 0, 0];
      const rhs = [-F[0], -F[1], -F[2], -(mF[0] + M0[0]), -(mF[1] + M0[1]), -(mF[2] + M0[2])];
      const f = solveLinear(A, rhs);
      return f ? { forces: f, dirs: U, points: P } : null;
    }
  }
  VMD.susp.FiveLink = FiveLink;

  /* ================================================================== 轮胎（简化魔术公式） */
  VMD.tire = VMD.tire || {};
  /** 魔术公式基本形：y = D sin(C atan(Bx − E(Bx − atan(Bx)))) */
  VMD.tire.mf = (x, B, C, D, E) => D * Math.sin(C * Math.atan(B * x - E * (B * x - Math.atan(B * x))));
  /**
   * 简化 MF 轮胎（教学用，参数形式参照 Pacejka MF 的结构，但大幅简化）：
   * 侧偏刚度 Kyα(Fz) = kScale·cKy1·Fz0·sin(2·atan(Fz/(cKy2·Fz0)))；摩擦系数 μ(Fz) = μ0·(1 + dmu·dfz)，dfz=(Fz−Fz0)/Fz0
   * 侧偏角 α 的符号约定：α 与 Fy 同号（Fy = Kyα·α，小角度），单位 rad。
   */
  class Tire {
    constructor(p) {
      this.p = Object.assign({ Fz0: 4000, mu: 1.0, dmu: -0.08, Cy: 1.3, Ey: -0.6, cKy1: 21.1, cKy2: 2.0, kScale: 1, Cx: 1.65, Ex: 0.1, cKx: 18, relax: 0.45 }, p || {});
    }
    Ky(Fz) { const p = this.p; return p.kScale * p.cKy1 * p.Fz0 * Math.sin(2 * Math.atan(Math.max(Fz, 0) / (p.cKy2 * p.Fz0))); }
    muAt(Fz, muRoad) { const p = this.p; return (muRoad === undefined ? 1 : muRoad) * p.mu * Math.max(0.3, 1 + p.dmu * (Fz - p.Fz0) / p.Fz0); }
    /** 纯侧偏侧向力；Dmax 为联合工况下可用侧向附着上限 */
    fy(alpha, Fz, muRoad, Dmax) {
      if (Fz <= 1) return 0;
      const D0 = this.muAt(Fz, muRoad) * Fz;
      const D = Dmax === undefined ? D0 : Math.max(0, Math.min(D0, Dmax));
      const B = this.Ky(Fz) / (this.p.Cy * D0);
      return VMD.tire.mf(alpha, B, this.p.Cy, D, this.p.Ey);
    }
    /** 纯纵滑纵向力（κ 为滑移率，驱动为正） */
    fx(kappa, Fz, muRoad) {
      if (Fz <= 1) return 0;
      const D = this.muAt(Fz, muRoad) * Fz;
      const B = (this.p.cKx * Fz) / (this.p.Cx * D);
      return VMD.tire.mf(kappa, B, this.p.Cx, D, this.p.Ex);
    }
    /** 峰值侧偏角（数值搜索），rad */
    peakAlpha(Fz) {
      let best = 0, bv = 0;
      for (let a = 0; a <= 0.5; a += 0.0005) { const v = this.fy(a, Fz); if (v > bv) { bv = v; best = a; } }
      return best;
    }
  }
  VMD.tire.Tire = Tire;

  /* ================================================================== 车辆模型 */
  VMD.veh = VMD.veh || {};
  /** 线性二自由度（单轨）模型。状态 x = [vy, r]，输入前轮转角 δ(rad)，Cf/Cr 为正值等效侧偏刚度。 */
  class Bicycle {
    constructor(p) {
      const rc = VMD.data.refCar;
      this.p = Object.assign({ m: rc.m, Iz: rc.Iz, a: rc.a, b: rc.b, Cf: rc.Cf, Cr: rc.Cr, u: 20 }, p || {});
    }
    get L() { return this.p.a + this.p.b; }
    /** 稳定性因数 K（s²/m²），K>0 不足转向 */
    K() { const p = this.p, L = this.L; return (p.m / (L * L)) * (p.b / p.Cf - p.a / p.Cr); }
    /** 不足转向度（前轮转角，deg/g） */
    Kus() { return this.K() * this.L * G * R2D; }
    uch() { const K = this.K(); return K > 0 ? 1 / Math.sqrt(K) : Infinity; }
    ucr() { const K = this.K(); return K < 0 ? Math.sqrt(-1 / K) : Infinity; }
    A(u) {
      const p = this.p; u = u || p.u;
      return [
        [-(p.Cf + p.Cr) / (p.m * u), -(p.a * p.Cf - p.b * p.Cr) / (p.m * u) - u],
        [-(p.a * p.Cf - p.b * p.Cr) / (p.Iz * u), -(p.a * p.a * p.Cf + p.b * p.b * p.Cr) / (p.Iz * u)],
      ];
    }
    B() { const p = this.p; return [p.Cf / p.m, (p.a * p.Cf) / p.Iz]; }
    deriv(x, delta, u) {
      const A = this.A(u), B = this.B();
      return [A[0][0] * x[0] + A[0][1] * x[1] + B[0] * delta, A[1][0] * x[0] + A[1][1] * x[1] + B[1] * delta];
    }
    /** 稳态响应（每 1 rad 前轮转角或给定 δ） */
    steady(delta, u) {
      const p = this.p; u = u || p.u;
      const L = this.L, K = this.K(), den = 1 + K * u * u;
      const r = ((u / L) / den) * delta;
      const beta = ((p.b / L - (p.m * p.a * u * u) / (L * L * p.Cr)) / den) * delta;
      return { r, beta, ay: u * r, R: Math.abs(r) > 1e-12 ? u / r : Infinity, gain: u / L / den };
    }
    /** 特征值 → 固有频率、阻尼比 */
    modal(u) {
      const A = this.A(u), tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
      const disc = tr * tr - 4 * det;
      const wn = det > 0 ? Math.sqrt(det) : NaN;
      return { wn, fn: wn / (2 * Math.PI), zeta: det > 0 ? -tr / (2 * wn) : NaN, stable: tr < 0 && det > 0, re: tr / 2, im: disc < 0 ? Math.sqrt(-disc) / 2 : 0, disc };
    }
    /** 频率响应 r/δ（f 单位 Hz）→ {mag ((rad/s)/rad), phase (deg)}；可选输出 ay/δ */
    freq(f, u, out) {
      const A = this.A(u), B = this.B(), w = 2 * Math.PI * f;
      // (jωI − A)^{-1} B，2×2 复数求逆
      const a11 = [-A[0][0], w], a12 = [-A[0][1], 0], a21 = [-A[1][0], 0], a22 = [-A[1][1], w];
      const cm = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
      const cs = (x, y) => [x[0] - y[0], x[1] - y[1]];
      const cd = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
      const det = cs(cm(a11, a22), cm(a12, a21));
      const b1 = [B[0], 0], b2 = [B[1], 0];
      const vy = cd(cs(cm(a22, b1), cm(a12, b2)), det);
      const r = cd(cs(cm(a11, b2), cm(a21, b1)), det);
      let z = r;
      if (out === 'ay') { const uu = u || this.p.u; z = [w * -vy[1] + uu * r[0], w * vy[0] + uu * r[1]]; } // ay = v̇y + u r
      return { mag: Math.hypot(z[0], z[1]), phase: Math.atan2(z[1], z[0]) * R2D };
    }
    /** 时域仿真：deltaFn(t)→δ(rad)；返回 {t[], vy[], r[], beta[], ay[], delta[]} */
    simulate(deltaFn, T, dt, u) {
      u = u || this.p.u; dt = dt || 0.005;
      let x = [0, 0];
      const out = { t: [], vy: [], r: [], beta: [], ay: [], delta: [] };
      for (let t = 0; t <= T + 1e-9; t += dt) {
        const d = deltaFn(t);
        const dx = this.deriv(x, d, u);
        out.t.push(t); out.vy.push(x[0]); out.r.push(x[1]); out.beta.push(x[0] / u); out.ay.push(dx[0] + u * x[1]); out.delta.push(d);
        const f = (tt, y) => this.deriv(y, deltaFn(tt), u);
        const k1 = f(t, x), k2 = f(t + dt / 2, [x[0] + (dt / 2) * k1[0], x[1] + (dt / 2) * k1[1]]);
        const k3 = f(t + dt / 2, [x[0] + (dt / 2) * k2[0], x[1] + (dt / 2) * k2[1]]), k4 = f(t + dt, [x[0] + dt * k3[0], x[1] + dt * k3[1]]);
        x = [x[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), x[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
      }
      return out;
    }
  }
  VMD.veh.Bicycle = Bicycle;

  /**
   * 非线性整车模型（平面双轨 + 簧上质量侧倾，教学用“半物理”模型）：
   *  - 状态：X, Y, ψ, vx, vy, r, φ, φ̇（+ 4 个轮胎侧偏角的一阶松弛）
   *  - 垂向载荷：静载 + 纵向载荷转移 + 前/后轴横向载荷转移（侧倾刚度分配 + 侧倾中心几何 + 非簧载质量）
   *  - 轮胎：简化魔术公式，摩擦椭圆限制联合工况
   *  - K&C 等效：侧向力柔顺转向 cfComp/crComp（deg/kN）、侧倾转向 efRoll/erRoll（deg/deg）；正值均为不足转向方向
   * 用法：const car = new VMD.veh.Vehicle({...}); car.reset(速度m/s); car.step(dt, {sw: 方向盘转角deg, Fx: 总纵向力N, mu}); car.out
   */
  class Vehicle {
    constructor(p) {
      const rc = VMD.data.refCar;
      this.p = Object.assign({}, rc, {
        cfComp: 0.3, crComp: 0.05, efRoll: 0.12, erRoll: 0.04,
        relaxation: true, driveSplit: 1.0, brakeSplit: 0.68, muRoad: 1.0, tireF: {}, tireR: {}, maxSW: 720,
      }, p || {});
      this.tF = new Tire(this.p.tireF);
      this.tR = new Tire(this.p.tireR);
      this._derive();
      this.reset(20);
    }
    _derive() {
      const p = this.p;
      const mu = p.muf + p.mur;
      p.hs = (p.m * p.h - mu * p.rw) / p.ms;
      p.hra = p.hrf * (p.b / p.L) + p.hrr * (p.a / p.L);
      p.harm = p.hs - p.hra;
      p.Ixr = p.Ixs + p.ms * p.harm * p.harm;
      p.wpos = [[p.a, p.tf / 2], [p.a, -p.tf / 2], [-p.b, p.tr / 2], [-p.b, -p.tr / 2]];
      p.Fz0 = [p.m * G * p.b / p.L / 2, p.m * G * p.b / p.L / 2, p.m * G * p.a / p.L / 2, p.m * G * p.a / p.L / 2];
    }
    set(params) { Object.assign(this.p, params || {}); if (params && params.tireF) this.tF = new Tire(this.p.tireF); if (params && params.tireR) this.tR = new Tire(this.p.tireR); this._derive(); return this; }
    reset(v0, pose) {
      const ps = pose || {};
      this.t = 0;
      this.y = [ps.X || 0, ps.Y || 0, ps.psi || 0, v0 === undefined ? 20 : v0, 0, 0, 0, 0, 0, 0, 0, 0];
      this.ax = 0; this.ay = 0;
      this.FyPrev = [0, 0, 0, 0];
      this.sw = 0;
      this._eval(this.y, { sw: 0, Fx: 0 }, true);
      return this;
    }
    /** 由当前状态 + 冻结量计算导数；commit=true 时写出 this.out */
    _eval(y, inp, commit) {
      const p = this.p;
      const vx = Math.max(y[3], 0.5), vy = y[4], r = y[5], phi = y[6], pr = y[7];
      const muRoad = inp.mu !== undefined ? inp.mu : p.muRoad;
      const dRoad = (Math.max(-p.maxSW, Math.min(p.maxSW, inp.sw || 0)) * D2R) / p.steerRatio;
      // 垂向载荷（冻结上一步加速度，避免代数环）
      const dFxl = (p.m * this.ax * p.h) / p.L;
      const dFf = (p.Kphif * phi + p.Cphif * pr + p.ms * (p.b / p.L) * this.ay * p.hrf + p.muf * this.ay * p.rw) / p.tf;
      const dFr = (p.Kphir * phi + p.Cphir * pr + p.ms * (p.a / p.L) * this.ay * p.hrr + p.mur * this.ay * p.rw) / p.tr;
      const Fz = [p.Fz0[0] - dFxl / 2 - dFf, p.Fz0[1] - dFxl / 2 + dFf, p.Fz0[2] + dFxl / 2 - dFr, p.Fz0[3] + dFxl / 2 + dFr].map((v) => Math.max(0, v));
      // 纵向力分配
      const Fx = inp.Fx || 0;
      const fFront = Fx >= 0 ? p.driveSplit : p.brakeSplit;
      const FxW = [fFront / 2, fFront / 2, (1 - fFront) / 2, (1 - fFront) / 2].map((k, i) => {
        const lim = 0.98 * (i < 2 ? this.tF : this.tR).muAt(Fz[i], muRoad) * Fz[i];
        return Math.max(-lim, Math.min(lim, k * Fx));
      });
      const cf = p.cfComp * D2R / 1000, cr = p.crComp * D2R / 1000;
      const ef = p.efRoll, er = p.erRoll;
      const delta = [
        dRoad - ef * phi - cf * this.FyPrev[0], dRoad - ef * phi - cf * this.FyPrev[1],
        er * phi + cr * this.FyPrev[2], er * phi + cr * this.FyPrev[3],
      ];
      let sFx = 0, sFy = 0, Mz = 0;
      const dy = new Array(12).fill(0);
      const alpha = [], Fy = [], aSS = [];
      for (let i = 0; i < 4; i++) {
        const xi = p.wpos[i][0], yi = p.wpos[i][1];
        const vxi = vx - r * yi, vyi = vy + r * xi;
        const ass = delta[i] - Math.atan2(vyi, Math.max(vxi, 0.5));
        aSS.push(ass);
        const al = p.relaxation ? y[8 + i] : ass;
        alpha.push(al);
        const tire = i < 2 ? this.tF : this.tR;
        const D0 = tire.muAt(Fz[i], muRoad) * Fz[i];
        const fy = tire.fy(al, Fz[i], muRoad, Math.sqrt(Math.max(0, D0 * D0 - FxW[i] * FxW[i])));
        Fy.push(fy);
        const c = Math.cos(delta[i]), s = Math.sin(delta[i]);
        const fxb = FxW[i] * c - fy * s, fyb = FxW[i] * s + fy * c;
        sFx += fxb; sFy += fyb; Mz += xi * fyb - yi * fxb;
        if (p.relaxation) dy[8 + i] = (Math.hypot(vxi, vyi) / tire.p.relax) * (ass - al);
      }
      const drag = 0.5 * p.rho * p.CdA * vx * vx;
      const ax = (sFx - drag) / p.m, ay = sFy / p.m;
      const psi = y[2];
      dy[0] = vx * Math.cos(psi) - vy * Math.sin(psi);
      dy[1] = vx * Math.sin(psi) + vy * Math.cos(psi);
      dy[2] = r;
      dy[3] = ax + r * vy;
      dy[4] = ay - r * vx;
      dy[5] = Mz / p.Iz;
      dy[6] = pr;
      dy[7] = (p.ms * ay * p.harm + p.ms * G * p.harm * Math.sin(phi) - (p.Kphif + p.Kphir) * phi - (p.Cphif + p.Cphir) * pr) / p.Ixr;
      if (commit) {
        this.out = {
          t: this.t, X: y[0], Y: y[1], psi, vx, vy, r, beta: Math.atan2(vy, vx), ax, ay, phi, phiDot: pr,
          Fz, Fx: FxW, Fy, alpha, alphaSS: aSS, delta, dRoad, sw: inp.sw || 0, sFy, Mz,
          rollGradient: null,
        };
        this._accel = [ax, ay];
        this._Fy = Fy;
      }
      return dy;
    }
    /** 积分一步（RK4）。inp = {sw: 方向盘转角 deg（左转为正）, Fx: 总纵向力 N（驱动正、制动负）, mu: 路面附着} */
    step(dt, inp) {
      inp = inp || {};
      const y = this.y;
      const f = (yy) => this._eval(yy, inp, false);
      const k1 = f(y);
      const k2 = f(y.map((v, i) => v + (dt / 2) * k1[i]));
      const k3 = f(y.map((v, i) => v + (dt / 2) * k2[i]));
      const k4 = f(y.map((v, i) => v + dt * k3[i]));
      this.y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
      if (this.y[3] < 0.5) this.y[3] = 0.5;
      this.t += dt;
      this._eval(this.y, inp, true);
      this.ax = this._accel[0];
      this.ay = this._accel[1];
      this.FyPrev = this._Fy.slice();
      return this.out;
    }
  }
  VMD.veh.Vehicle = Vehicle;

  /** 速度 PI 控制器 → 总纵向力 N */
  class SpeedPI {
    constructor(o) { this.o = Object.assign({ kp: 0.8, ki: 0.15, m: VMD.data.refCar.m, maxAcc: 4, maxDec: 8 }, o || {}); this.i = 0; }
    reset() { this.i = 0; return this; }
    force(vTarget, vx, dt) {
      const o = this.o, e = vTarget - vx;
      this.i = Math.max(-5, Math.min(5, this.i + e * dt));
      const acc = Math.max(-o.maxDec, Math.min(o.maxAcc, o.kp * e + o.ki * this.i));
      return o.m * acc;
    }
  }
  VMD.veh.SpeedPI = SpeedPI;

  /**
   * 单点预瞄驾驶员（纯追踪 Pure Pursuit + 一阶神经肌肉滞后）：
   * const drv = new VMD.veh.PreviewDriver({path:[[X,Y],...], Tp:预瞄时间s, Lmin, tau, ratio, L, Kcomp:稳定性因数补偿})
   * const d = drv.update(car.out, dt) → {sw(deg), target:[X,Y], ey(横向偏差 m)}
   */
  class PreviewDriver {
    constructor(o) {
      this.o = Object.assign({ path: [], Tp: 0.9, Lmin: 4, tau: 0.12, ratio: VMD.data.refCar.steerRatio, L: VMD.data.refCar.L, Kcomp: 0.0014, gain: 1, maxSW: 540 }, o || {});
      this.setPath(this.o.path);
    }
    setPath(path) {
      this.path = path || [];
      this.s = [0];
      for (let i = 1; i < this.path.length; i++) this.s.push(this.s[i - 1] + Math.hypot(this.path[i][0] - this.path[i - 1][0], this.path[i][1] - this.path[i - 1][1]));
      this.idx = 0; this.sw = 0;
      return this;
    }
    reset() { this.idx = 0; this.sw = 0; return this; }
    update(st, dt) {
      const P = this.path, o = this.o;
      if (P.length < 2) return { sw: 0, target: [st.X, st.Y], ey: 0 };
      let best = this.idx, bd = Infinity;
      for (let i = Math.max(0, this.idx - 5); i < Math.min(P.length, this.idx + 400); i++) {
        const d = (P[i][0] - st.X) ** 2 + (P[i][1] - st.Y) ** 2;
        if (d < bd) { bd = d; best = i; }
      }
      this.idx = best;
      const c = Math.cos(st.psi), s = Math.sin(st.psi);
      const toLocal = (q) => [(q[0] - st.X) * c + (q[1] - st.Y) * s, -(q[0] - st.X) * s + (q[1] - st.Y) * c];
      const ey = toLocal(P[best])[1];
      const Ld = Math.max(o.Lmin, o.Tp * st.vx);
      let j = best;
      while (j < P.length - 1 && this.s[j] - this.s[best] < Ld) j++;
      const tgt = P[j];
      const loc = toLocal(tgt);
      const eta = Math.atan2(loc[1], Math.max(loc[0], 0.1));
      const dist = Math.max(0.5, Math.hypot(loc[0], loc[1]));
      const dRoad = Math.atan((o.L * 2 * Math.sin(eta)) / dist) * (1 + o.Kcomp * st.vx * st.vx) * o.gain;
      const cmd = Math.max(-o.maxSW, Math.min(o.maxSW, dRoad * R2D * o.ratio));
      this.sw += ((cmd - this.sw) * Math.min(1, dt / Math.max(o.tau, 1e-3)));
      return { sw: this.sw, target: tgt, ey, idx: best };
    }
  }
  VMD.veh.PreviewDriver = PreviewDriver;

  /**
   * ISO 3888-1 双移线（示意几何，尺寸以标准原文为准）。w = 车宽 m。
   * 返回 {path:[[x,y],...]（参考中心线）, cones:[{x,y,side}], lanes:[{x0,x1,yc,width}]}
   */
  VMD.veh.dlcISO3888_1 = function (w, opts) {
    w = w || 1.8;
    const o = Object.assign({ lead: 30, tail: 40, ds: 0.25 }, opts || {});
    const lanes = [
      { x0: 0, x1: 15, width: 1.1 * w + 0.25 },
      { x0: 45, x1: 70, width: 1.2 * w + 0.25 },
      { x0: 95, x1: 125, width: 1.3 * w + 0.25 },
    ];
    // 教学简化：第 2 段车道中心线相对第 1、3 段横移 3.5 m
    lanes[0].yc = 0;
    lanes[1].yc = 3.5;
    lanes[2].yc = 0;
    const yAt = (x) => {
      if (x <= 15) return 0;
      if (x < 45) { const s = (x - 15) / 30; return lanes[1].yc * (0.5 - 0.5 * Math.cos(Math.PI * s)); }
      if (x <= 70) return lanes[1].yc;
      if (x < 95) { const s = (x - 70) / 25; return lanes[1].yc * (0.5 + 0.5 * Math.cos(Math.PI * s)); }
      return 0;
    };
    const path = [];
    for (let x = -o.lead; x <= 125 + o.tail; x += o.ds) path.push([x, yAt(x)]);
    const cones = [];
    lanes.forEach((ln) => {
      const n = Math.max(3, Math.round((ln.x1 - ln.x0) / 5) + 1);
      for (let k = 0; k < n; k++) {
        const x = ln.x0 + ((ln.x1 - ln.x0) * k) / (n - 1);
        cones.push({ x, y: ln.yc + ln.width / 2, side: 'L' }, { x, y: ln.yc - ln.width / 2, side: 'R' });
      }
    });
    return { path, cones, lanes, yAt };
  };

  /**
   * 阶跃响应指标（参照 ISO 7401 的定义思路）：t50 = 输入达到 50% 的时刻
   * 返回 {steady, peak, tResp(到 90% 稳态的响应时间), tPeak(峰值响应时间), overshoot(%)}
   */
  VMD.veh.stepMetrics = function (t, y, t50, tSteadyFrom) {
    const n = t.length;
    const i0 = t.findIndex((v) => v >= (tSteadyFrom !== undefined ? tSteadyFrom : t[n - 1] - 1));
    let s = 0, c = 0;
    for (let i = Math.max(0, i0); i < n; i++) { s += y[i]; c++; }
    const steady = c ? s / c : NaN;
    const sg = steady >= 0 ? 1 : -1;
    let peak = -Infinity, ip = 0;
    for (let i = 0; i < n; i++) if (sg * y[i] > peak) { peak = sg * y[i]; ip = i; }
    peak *= sg;
    let i90 = y.findIndex((v) => sg * v >= 0.9 * sg * steady);
    return {
      steady, peak,
      tResp: i90 >= 0 ? t[i90] - t50 : NaN,
      tPeak: t[ip] - t50,
      overshoot: steady ? ((peak - steady) / steady) * 100 : NaN,
    };
  };
  VMD.veh.G = G;
})(typeof window !== 'undefined' ? window : globalThis);
