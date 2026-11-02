/* 结构仿真交互式教程 · 共享计算模型 vmd-models.js
 * 纯计算、无 DOM 依赖（可在 Node 中测试）。默认单位制 mm–t–s：长度 mm、质量 t、时间 s、力 N、应力 MPa、能量 mJ（= N·mm）、密度 t/mm³。
 * 内容：单位制与教学材料 / 课程示例零件 / 稠密与带状线性代数、特征值 / 杆、梁、桁架 / 平面单元（T3、Q4、Q8；完全、减缩、选择减缩、非协调）与网格 /
 *       时间积分（中心差分、Newmark、HHT、广义-α）与谱分析 / 一维显式杆 / 材料本构 / 非线性路径跟踪 / 疲劳 / 薄壁管压溃 / 解析参考解。
 */
(function (global) {
  'use strict';
  const VMD = (global.VMD = global.VMD || {});
  const PI = Math.PI;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ================================================================== 单位制与教学材料 */
  VMD.data = VMD.data || {};
  /** 一致单位制：同一模型里所有量必须来自同一行（力、应力、能量、密度都是导出单位） */
  VMD.data.units = [
    { key: 'mm-t-s', name: 'mm–t–s（本教程默认）', length: 'mm', mass: 't（10³ kg）', time: 's', force: 'N', stress: 'MPa', energy: 'mJ（N·mm）', velocity: 'mm/s', density: '7.85e-9 t/mm³', E: '2.1e5 MPa', g: '9810 mm/s²', note: '隐式结构分析最常用；钢的密度最容易错写成 7.85e-6' },
    { key: 'm-kg-s', name: 'm–kg–s（SI）', length: 'm', mass: 'kg', time: 's', force: 'N', stress: 'Pa', energy: 'J', velocity: 'm/s', density: '7850 kg/m³', E: '2.1e11 Pa', g: '9.81 m/s²', note: '手算与多体软件常用；弹性模量数值高达 1e11' },
    { key: 'mm-kg-ms', name: 'mm–kg–ms', length: 'mm', mass: 'kg', time: 'ms', force: 'kN', stress: 'GPa', energy: 'J（kN·mm）', velocity: 'mm/ms（= m/s）', density: '7.85e-6 kg/mm³', E: '210 GPa', g: '9.81e-3 mm/ms²', note: '显式碰撞常用；力是 kN、应力是 GPa，速度数值等于 m/s' },
    { key: 'mm-g-ms', name: 'mm–g–ms', length: 'mm', mass: 'g', time: 'ms', force: 'N', stress: 'MPa', energy: 'mJ（N·mm）', velocity: 'mm/ms（= m/s）', density: '7.85e-3 g/mm³', E: '2.1e5 MPa', g: '9.81e-3 mm/ms²', note: '力和应力的数值与 mm–t–s 相同，时间却是 ms' },
  ];
  VMD.data.g = 9810; // mm/s²

  /** 教学材料（mm–t–s）。数值为教学取值，不对应任何具体牌号或供应商数据。 */
  VMD.data.materials = {
    steel: {
      key: 'steel', name: '通用结构钢（教学值）', E: 210000, nu: 0.3, rho: 7.85e-9, sy: 355, su: 510, elong: 0.22, alpha: 1.2e-5,
      H: 1500,                                        // 双线性近似的塑性硬化模量 MPa（屈服到抗拉强度的真应力斜率）
      swift: { K: 831, e0: 0.0089, n: 0.18 },         // 真应力 σ = K(ε0+εp)^n，σ(0)≈355 MPa，颈缩点 εp≈0.171、σ≈611 MPa
      cs: { D: 40.4, q: 5, note: 'Cowper–Symonds 低碳钢经典值（Jones《Structural Impact》），高强钢的率敏感性明显更低' },
      jc: { A: 355, B: 520, n: 0.40, C: 0.014, m: 1.0, eps0: 1, Tr: 293, Tm: 1793 },
      fat: { sf: 900, b: -0.09, ef: 0.45, c: -0.6, Kp: 1015, np: 0.15, Se: 245, Ne: 1e6 }, // 光滑试样、R=-1；Se 为 10^6 次对应幅值
    },
    alu: {
      key: 'alu', name: '6xxx 系铝合金 T6（教学值）', E: 70000, nu: 0.33, rho: 2.7e-9, sy: 250, su: 290, elong: 0.10, alpha: 2.3e-5,
      H: 900,
      cs: { D: 6500, q: 4, note: 'Jones 书中常引用的铝合金经典值；现代 6xxx 合金试验显示率敏感性很弱，以材料试验为准' },
      fat: { sf: 520, b: -0.1, note: '铝合金没有明显的疲劳极限，常取 5e8 次对应强度作设计值' },
    },
    rubber: {
      key: 'rubber', name: '天然橡胶 NR（教学值）', rho: 1.1e-9, mu: 1.0, E0: 3.0, C10: 0.4, C01: 0.1, K: 2000, nu: 0.49975,
      ogden: { mu: 1.0, alpha: 2.5 },
    },
    pcabs: { key: 'pcabs', name: 'PC/ABS 塑料（教学值）', E: 2300, nu: 0.38, rho: 1.15e-9, sy: 50, su: 55, elong: 0.5 },
    cfrp: { key: 'cfrp', name: '碳纤维/环氧单向带（教学值）', E1: 135000, E2: 10000, G12: 5000, nu12: 0.3, rho: 1.6e-9, Xt: 1500, Xc: 1200, Yt: 50, Yc: 200, S: 70 },
  };

  /* ================================================================== 课程示例零件（全教程统一引用） */
  const MAT = VMD.data.materials;
  VMD.data.parts = (function () {
    const st = MAT.steel, al = MAT.alu;
    // 悬臂梁：X 为梁轴，载荷沿 -Z（厚度 h 方向），宽度 b 沿 Y
    const cb = { key: 'cantilever', name: '课程悬臂梁', mat: 'steel', L: 200, b: 20, h: 10, P: 200 };
    cb.A = cb.b * cb.h;
    cb.I = (cb.b * Math.pow(cb.h, 3)) / 12;          // 1666.7 mm⁴（弱轴，载荷方向）
    cb.Is = (cb.h * Math.pow(cb.b, 3)) / 12;         // 6666.7 mm⁴（强轴）
    cb.EI = st.E * cb.I;
    cb.delta = (cb.P * Math.pow(cb.L, 3)) / (3 * cb.EI); // 1.524 mm
    cb.sigma = (cb.P * cb.L * (cb.h / 2)) / cb.I;     // 120 MPa（根部上下表面）
    cb.k = (3 * cb.EI) / Math.pow(cb.L, 3);            // 131.25 N/mm
    cb.mass = st.rho * cb.A * cb.L;                    // 3.14e-4 t = 0.314 kg
    const wBase = Math.sqrt(cb.EI / (st.rho * cb.A * Math.pow(cb.L, 4)));
    cb.betaL = [1.875104, 4.694091, 7.854757];
    cb.freq = cb.betaL.map((b) => (b * b * wBase) / (2 * PI)); // 208.9 / 1309 / 3665 Hz
    cb.Pcr = (PI * PI * cb.EI) / Math.pow(2 * cb.L, 2);  // 固定—自由压杆 21.6 kN
    cb.SF = st.sy / cb.sigma;
    cb.shearRatio = (3 * cb.EI) / ((5 / 6) * (st.E / (2 * (1 + st.nu))) * cb.A * cb.L * cb.L); // 剪切挠度/弯曲挠度 ≈ 0.2%

    // 带孔板：长 Lp 沿 X（受拉方向），宽 W 沿 Y，中心孔径 d，厚 t；四分之一模型 x∈[0,Lp/2]、y∈[0,W/2]
    const ph = { key: 'plateHole', name: '课程带孔板', mat: 'steel', W: 100, d: 20, t: 5, Lp: 200, F: 40000 };
    ph.sGross = ph.F / (ph.W * ph.t);                   // 80 MPa
    ph.sNet = ph.F / ((ph.W - ph.d) * ph.t);            // 100 MPa
    ph.KtNet = 2 + Math.pow(1 - ph.d / ph.W, 3);        // Heywood 近似 2.512
    ph.sPeak = ph.KtNet * ph.sNet;                      // 251 MPa
    ph.KtGross = ph.sPeak / ph.sGross;                  // 3.14
    ph.SF = st.sy / ph.sPeak;

    // 冲击杆：以 v0 撞击刚性墙（一维应力波）
    const br = { key: 'bar', name: '课程冲击杆', mat: 'steel', L: 500, A: 100, v0: 5000, le: 5 };
    br.c = Math.sqrt(st.E / st.rho);                    // 5.172e6 mm/s
    br.sigma = st.rho * br.c * br.v0;                   // 203 MPa
    br.tTransit = br.L / br.c;                          // 96.7 μs
    br.tContact = (2 * br.L) / br.c;                    // 193 μs
    br.dt = br.le / br.c;                               // 0.967 μs
    br.mass = st.rho * br.A * br.L;                     // 3.925e-4 t
    br.KE = 0.5 * br.mass * br.v0 * br.v0;              // 4906 mJ

    // 吸能方管：铝合金方管轴向压溃（Abramowicz–Jones 经验式）
    const ct = { key: 'crashTube', name: '课程吸能方管', mat: 'alu', C: 60, t: 2, L: 200, M: 0.1, V: 10000 };
    ct.sigma0 = (al.sy + al.su) / 2;                    // 流动应力 270 MPa
    ct.Pm = 13.06 * ct.sigma0 * Math.pow(ct.t, 5 / 3) * Math.pow(ct.C, 1 / 3); // 准静态平均压溃力 ≈ 43.8 kN
    ct.H = 0.99 * Math.pow(ct.t, 1 / 3) * Math.pow(ct.C, 2 / 3); // 半波长 ≈ 19.1 mm
    ct.KE = 0.5 * ct.M * ct.V * ct.V;                   // 5.0e6 mJ = 5 kJ
    ct.crush = ct.KE / ct.Pm;                           // ≈ 114 mm
    ct.mass = al.rho * 4 * ct.C * ct.t * ct.L;          // 2.59e-4 t
    ct.rate = (0.33 * ct.V) / ct.C;                     // ≈ 55 1/s
    ct.dynFactor = 1 + Math.pow(ct.rate / al.cs.D, 1 / al.cs.q); // ≈ 1.30（经典常数，偏大）
    ct.SEA = ct.KE / (ct.mass * (ct.crush / ct.L));     // mJ/t，按压溃段质量

    // 跌落件：0.5 kg 壳体从 1 m 跌落到刚性地面
    const dp = { key: 'drop', name: '课程跌落件', mat: 'pcabs', m: 0.5e-3, h: 1000 };
    dp.v = Math.sqrt(2 * VMD.data.g * dp.h);           // 4429 mm/s
    dp.KE = dp.m * VMD.data.g * dp.h;                   // 4905 mJ

    // 两杆扁拱桁架（Mises truss）：支座 x=±a，顶点高 h，顶点竖向力 P 向下
    const mt = { key: 'misesTruss', name: '课程两杆扁拱', mat: 'steel', a: 500, h: 25, A: 100, ks: 50 };
    mt.EA = st.E * mt.A;
    return { cantilever: cb, plateHole: ph, bar: br, crashTube: ct, drop: dp, misesTruss: mt };
  })();

  /* ================================================================== 线性代数 */
  const LA = (VMD.la = {});
  LA.zeros = (n, m) => { const r = []; for (let i = 0; i < n; i++) r.push(new Array(m === undefined ? n : m).fill(0)); return r; };
  LA.eye = (n) => { const A = LA.zeros(n); for (let i = 0; i < n; i++) A[i][i] = 1; return A; };
  LA.clone = (A) => A.map((r) => r.slice());
  LA.dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  LA.norm = (a) => Math.sqrt(LA.dot(a, a));
  LA.matVec = (A, x) => A.map((r) => LA.dot(r, x));
  LA.transpose = (A) => A[0].map((_, j) => A.map((r) => r[j]));
  LA.matMul = function (A, B) {
    const n = A.length, m = B[0].length, k = B.length, C = LA.zeros(n, m);
    for (let i = 0; i < n; i++) for (let p = 0; p < k; p++) { const a = A[i][p]; if (a === 0) continue; for (let j = 0; j < m; j++) C[i][j] += a * B[p][j]; }
    return C;
  };
  LA.sub = (A, keep) => keep.map((i) => keep.map((j) => A[i][j]));
  LA.subVec = (v, keep) => keep.map((i) => v[i]);
  LA.expand = (vr, keep, n) => { const v = new Array(n).fill(0); keep.forEach((k, i) => { v[k] = vr[i]; }); return v; };

  /** LU 分解（列主元），返回 {LU, piv, ok, minPivot, maxPivot}；奇异时 ok=false */
  LA.lu = function (A) {
    const n = A.length, LU = LA.clone(A), piv = [];
    let minP = Infinity, maxP = 0, ok = true;
    let scale = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) scale = Math.max(scale, Math.abs(A[i][j]));
    const tol = 1e-13 * (scale || 1);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(LU[r][c]) > Math.abs(LU[p][c])) p = r;
      piv.push(p);
      if (p !== c) { const t = LU[c]; LU[c] = LU[p]; LU[p] = t; }
      const d = LU[c][c];
      minP = Math.min(minP, Math.abs(d)); maxP = Math.max(maxP, Math.abs(d));
      if (Math.abs(d) <= tol) { ok = false; continue; }
      for (let r = c + 1; r < n; r++) {
        const f = (LU[r][c] /= d);
        if (f === 0) continue;
        for (let k = c + 1; k < n; k++) LU[r][k] -= f * LU[c][k];
      }
    }
    return { LU, piv, ok, minPivot: minP, maxPivot: maxP };
  };
  LA.luSolve = function (F, b) {
    const n = b.length, LU = F.LU, x = b.slice();
    for (let c = 0; c < n; c++) { const p = F.piv[c]; if (p !== c) { const t = x[c]; x[c] = x[p]; x[p] = t; } }
    for (let i = 0; i < n; i++) { let s = x[i]; for (let k = 0; k < i; k++) s -= LU[i][k] * x[k]; x[i] = s; }
    for (let i = n - 1; i >= 0; i--) { let s = x[i]; for (let k = i + 1; k < n; k++) s -= LU[i][k] * x[k]; x[i] = s / LU[i][i]; }
    return x;
  };
  /** 稠密求解 A x = b；奇异返回 null */
  LA.solve = function (A, b) { const F = LA.lu(A); return F.ok ? LA.luSolve(F, b) : null; };
  /** Cholesky：A = L Lᵀ；返回 {L, ok, failAt}（failAt 为首个非正主元的行号） */
  LA.cholesky = function (A) {
    const n = A.length, L = LA.zeros(n);
    for (let j = 0; j < n; j++) {
      let s = A[j][j];
      for (let k = 0; k < j; k++) s -= L[j][k] * L[j][k];
      if (!(s > 1e-14 * Math.abs(A[j][j] || 1))) return { L, ok: false, failAt: j, pivot: s };
      const d = Math.sqrt(s);
      L[j][j] = d;
      for (let i = j + 1; i < n; i++) {
        let t = A[i][j];
        for (let k = 0; k < j; k++) t -= L[i][k] * L[j][k];
        L[i][j] = t / d;
      }
    }
    return { L, ok: true, failAt: -1 };
  };
  /** 对称矩阵特征分解（循环 Jacobi）：返回 {values 升序, vectors: 与 values 对应的列向量数组} */
  LA.eigSym = function (A0) {
    const n = A0.length, A = LA.clone(A0), V = LA.eye(n);
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0, diag = 0;
      for (let i = 0; i < n; i++) { diag += A[i][i] * A[i][i]; for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j]; }
      if (off <= 1e-26 * (diag || 1)) break;
      for (let p = 0; p < n - 1; p++) {
        for (let q = p + 1; q < n; q++) {
          const apq = A[p][q];
          if (Math.abs(apq) < 1e-300) continue;
          const theta = (A[q][q] - A[p][p]) / (2 * apq);
          const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
          const c = 1 / Math.sqrt(t * t + 1), s = t * c;
          for (let k = 0; k < n; k++) {
            const akp = A[k][p], akq = A[k][q];
            A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq;
          }
          for (let k = 0; k < n; k++) {
            const apk = A[p][k], aqk = A[q][k];
            A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk;
          }
          for (let k = 0; k < n; k++) {
            const vkp = V[k][p], vkq = V[k][q];
            V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
          }
        }
      }
    }
    const idx = A.map((_, i) => i).sort((a, b) => A[a][a] - A[b][b]);
    return { values: idx.map((i) => A[i][i]), vectors: idx.map((i) => V.map((r) => r[i])) };
  };
  /** 广义特征值 K φ = λ M φ（M 对称正定）：返回 {values 升序, vectors（已按 φᵀMφ = 1 归一化）, ok} */
  LA.eigGen = function (K, M) {
    const ch = LA.cholesky(M);
    if (!ch.ok) return { ok: false, values: [], vectors: [], failAt: ch.failAt };
    const n = K.length, L = ch.L;
    const Linv = LA.zeros(n);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        let s = i === j ? 1 : 0;
        for (let k = 0; k < i; k++) s -= L[i][k] * Linv[k][j];
        Linv[i][j] = s / L[i][i];
      }
    }
    const A = LA.matMul(LA.matMul(Linv, K), LA.transpose(Linv));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const m = 0.5 * (A[i][j] + A[j][i]); A[i][j] = m; A[j][i] = m; }
    const e = LA.eigSym(A);
    const LinvT = LA.transpose(Linv);
    return { ok: true, values: e.values, vectors: e.vectors.map((y) => LA.matVec(LinvT, y)) };
  };
  /** 零能模式检查：返回 {count, values, vectors}（|λ| ≤ tol·max|λ| 视为零） */
  LA.zeroModes = function (K, tol) {
    const e = LA.eigSym(K), mx = Math.max.apply(null, e.values.map(Math.abs)) || 1, t = (tol || 1e-9) * mx;
    const idx = e.values.map((v, i) => i).filter((i) => Math.abs(e.values[i]) <= t);
    return { count: idx.length, values: e.values, vectors: idx.map((i) => e.vectors[i]) };
  };

  /** 对称带状矩阵 Uᵀ D U 分解（hb 为半带宽），用于平面单元网格的快速求解；可报告主元比与奇异自由度 */
  class BandSym {
    constructor(n, hb) { this.n = n; this.hb = hb; this.w = hb + 1; this.a = new Float64Array(n * (hb + 1)); }
    idx(i, j) { if (j < i) { const t = i; i = j; j = t; } return j - i > this.hb ? -1 : i * this.w + (j - i); }
    add(i, j, v) { if (j < i) return; const k = this.idx(i, j); if (k >= 0) this.a[k] += v; }
    get(i, j) { const k = this.idx(i, j); return k < 0 ? 0 : this.a[k]; }
    mulVec(x) {
      const n = this.n, hb = this.hb, a = this.a, w = this.w, y = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        y[i] += a[i * w] * x[i];
        const jm = Math.min(n - 1, i + hb);
        for (let j = i + 1; j <= jm; j++) { const v = a[i * w + j - i]; if (v === 0) continue; y[i] += v * x[j]; y[j] += v * x[i]; }
      }
      return y;
    }
    /** 原地分解；返回 {ok, singular:[自由度], minRatio（最小 d_i/K_ii）, negative（负主元个数）} */
    factor() {
      const n = this.n, hb = this.hb, w = this.w, a = this.a, d = new Float64Array(n), tmp = new Float64Array(hb + 1);
      const diag0 = new Float64Array(n);
      for (let i = 0; i < n; i++) diag0[i] = a[i * w];
      let minRatio = Infinity, neg = 0;
      const singular = [];
      for (let i = 0; i < n; i++) {
        const k0 = Math.max(0, i - hb);
        let s = a[i * w];
        for (let k = k0; k < i; k++) { const u = a[k * w + i - k]; tmp[k - k0] = u * d[k]; s -= u * tmp[k - k0]; }
        const ref = Math.abs(diag0[i]) || 1;
        if (Math.abs(s) <= 1e-10 * ref) { singular.push(i); s = ref * 1e-10 * (s < 0 ? -1 : 1) || 1e-30; }
        if (s < 0) neg++;
        d[i] = s;
        minRatio = Math.min(minRatio, Math.abs(s) / ref);
        a[i * w] = 1;
        const jm = Math.min(n - 1, i + hb);
        for (let j = i + 1; j <= jm; j++) {
          let t = a[i * w + j - i];
          const kk = Math.max(k0, j - hb);
          for (let k = kk; k < i; k++) t -= tmp[k - k0] * a[k * w + j - k];
          a[i * w + j - i] = t / s;
        }
      }
      this.d = d;
      return { ok: singular.length === 0, singular, minRatio, negative: neg };
    }
    solve(b) {
      const n = this.n, hb = this.hb, w = this.w, a = this.a, d = this.d, x = Float64Array.from(b);
      for (let i = 0; i < n; i++) { const k0 = Math.max(0, i - hb); let s = x[i]; for (let k = k0; k < i; k++) s -= a[k * w + i - k] * x[k]; x[i] = s; }
      for (let i = 0; i < n; i++) x[i] /= d[i];
      for (let i = n - 1; i >= 0; i--) { const jm = Math.min(n - 1, i + hb); let s = x[i]; for (let j = i + 1; j <= jm; j++) s -= a[i * w + j - i] * x[j]; x[i] = s; }
      return x;
    }
  }
  LA.BandSym = BandSym;

  /* ================================================================== 有限元：通用工具 */
  const FE = (VMD.fe = {});
  FE.lame = function (E, nu) {
    const G = E / (2 * (1 + nu)), K = E / (3 * (1 - 2 * nu)), lambda = (E * nu) / ((1 + nu) * (1 - 2 * nu));
    return { G, K, lambda, mu: G };
  };
  /** 波速（mm/s）：type = 'bar' 杆 | 'plate' 板壳（平面应力）| 'solid' 实体膨胀波 | 'shear' 剪切波 */
  FE.waveSpeed = function (m, type) {
    const E = m.E, nu = m.nu || 0, rho = m.rho;
    if (type === 'plate') return Math.sqrt(E / (rho * (1 - nu * nu)));
    if (type === 'solid') return Math.sqrt((E * (1 - nu)) / (rho * (1 + nu) * (1 - 2 * nu)));
    if (type === 'shear') return Math.sqrt(E / (2 * (1 + nu) * rho));
    return Math.sqrt(E / rho);
  };
  /** 单元稳定时间步（s）：le 为特征长度 mm */
  FE.dtCrit = (le, c) => le / c;

  /** 云图色表：name = 'rainbow'（CAE 常用蓝→红）| 'coolwarm'（发散：压蓝拉红）| 'viridis' | 'gray'；t∈[0,1]，bands>0 时离散成色带 */
  const CMAPS = {
    rainbow: [[0, 0, 255], [0, 170, 255], [0, 255, 200], [60, 255, 60], [200, 255, 0], [255, 200, 0], [255, 110, 0], [230, 0, 0]],
    coolwarm: [[59, 76, 192], [124, 159, 249], [192, 212, 245], [242, 203, 183], [238, 133, 105], [180, 4, 38]],
    viridis: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]],
    gray: [[40, 40, 40], [235, 235, 235]],
  };
  FE.cmap = function (t, name, bands) {
    const st = CMAPS[name] || CMAPS.rainbow;
    let x = clamp(isFinite(t) ? t : 0, 0, 1);
    if (bands && bands > 1) x = Math.min(bands - 1, Math.floor(x * bands)) / (bands - 1);
    const f = x * (st.length - 1), i = Math.min(st.length - 2, Math.floor(f)), r = f - i;
    const a = st[i], b = st[i + 1];
    return [Math.round(a[0] + (b[0] - a[0]) * r), Math.round(a[1] + (b[1] - a[1]) * r), Math.round(a[2] + (b[2] - a[2]) * r)];
  };
  FE.cmapCSS = (t, name, bands) => { const c = FE.cmap(t, name, bands); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
  FE.cmapNames = Object.keys(CMAPS);
  FE.norm01 = (v, lo, hi) => (hi > lo ? clamp((v - lo) / (hi - lo), 0, 1) : 0.5);
  FE.range = function (arr) {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < arr.length; i++) { const v = arr[i]; if (!isFinite(v)) continue; if (v < lo) lo = v; if (v > hi) hi = v; }
    if (!isFinite(lo)) { lo = 0; hi = 1; }
    return [lo, hi];
  };

  /* ================================================================== 一维单元：杆、梁、桁架 */
  /** 等截面杆分 n 段：返回 {K, M（一致或集中）, le, x} ；单位 N/mm 与 t */
  FE.bar1d = function (o) {
    const n = o.n, le = o.L / n, k = (o.E * o.A) / le, m = (o.rho || 0) * o.A * le, N = n + 1;
    const K = LA.zeros(N), M = LA.zeros(N);
    for (let e = 0; e < n; e++) {
      K[e][e] += k; K[e][e + 1] -= k; K[e + 1][e] -= k; K[e + 1][e + 1] += k;
      if (o.lumped) { M[e][e] += m / 2; M[e + 1][e + 1] += m / 2; }
      else { M[e][e] += m / 3; M[e][e + 1] += m / 6; M[e + 1][e] += m / 6; M[e + 1][e + 1] += m / 3; }
    }
    return { K, M, le, x: Array.from({ length: N }, (_, i) => i * le) };
  };

  /** 欧拉—伯努利梁单元（自由度 v1, θ1, v2, θ2）：刚度、一致质量、单位轴压几何刚度 */
  FE.beamElem = function (EI, rhoA, le) {
    const L = le, L2 = L * L, k = EI / (L2 * L), m = (rhoA * L) / 420, g = 1 / (30 * L);
    return {
      K: [[12 * k, 6 * L * k, -12 * k, 6 * L * k], [6 * L * k, 4 * L2 * k, -6 * L * k, 2 * L2 * k], [-12 * k, -6 * L * k, 12 * k, -6 * L * k], [6 * L * k, 2 * L2 * k, -6 * L * k, 4 * L2 * k]],
      M: [[156 * m, 22 * L * m, 54 * m, -13 * L * m], [22 * L * m, 4 * L2 * m, 13 * L * m, -3 * L2 * m], [54 * m, 13 * L * m, 156 * m, -22 * L * m], [-13 * L * m, -3 * L2 * m, -22 * L * m, 4 * L2 * m]],
      KG: [[36 * g, 3 * L * g, -36 * g, 3 * L * g], [3 * L * g, 4 * L2 * g, -3 * L * g, -L2 * g], [-36 * g, -3 * L * g, 36 * g, -3 * L * g], [3 * L * g, -L2 * g, -3 * L * g, 4 * L2 * g]],
    };
  };
  /**
   * 梁模型：o = {n, L, E, I, A, rho, bc:'cantilever'|'pinned'|'fixed-fixed'|'fixed-pinned'|'free', lumped}
   * 返回 {K, M, KG, free（保留的自由度）, Kr, Mr, KGr, nd, x, expand(vr)}；自由度顺序 [v0, θ0, v1, θ1, …]
   */
  FE.beam2d = function (o) {
    const n = o.n, le = o.L / n, nd = 2 * (n + 1), EI = o.E * o.I, rhoA = (o.rho || 0) * (o.A || 0);
    const K = LA.zeros(nd), M = LA.zeros(nd), KG = LA.zeros(nd);
    const el = FE.beamElem(EI, rhoA, le);
    const hrz = 420 / 312;
    for (let e = 0; e < n; e++) {
      const d = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        K[d[i]][d[j]] += el.K[i][j]; KG[d[i]][d[j]] += el.KG[i][j];
        if (!o.lumped) M[d[i]][d[j]] += el.M[i][j];
        else if (i === j) M[d[i]][d[i]] += el.M[i][i] * hrz;
      }
    }
    const last = 2 * n, bc = o.bc || 'cantilever';
    const fixed = { cantilever: [0, 1], pinned: [0, last], 'fixed-fixed': [0, 1, last, last + 1], 'fixed-pinned': [0, 1, last], free: [] }[bc] || [0, 1];
    const free = [];
    for (let i = 0; i < nd; i++) if (fixed.indexOf(i) < 0) free.push(i);
    return {
      K, M, KG, free, fixed, nd, le, n, bc, x: Array.from({ length: n + 1 }, (_, i) => i * le),
      Kr: LA.sub(K, free), Mr: LA.sub(M, free), KGr: LA.sub(KG, free),
      expand: (vr) => LA.expand(vr, free, nd),
    };
  };
  /** 梁模态：返回 {freq: Hz[], omega, shapes: 全自由度振型（质量归一化）} */
  FE.beamModes = function (model, nModes) {
    const e = LA.eigGen(model.Kr, model.Mr);
    const k = Math.min(nModes || 6, e.values.length);
    const vals = e.values.slice(0, k).map((v) => Math.max(0, v));
    return { omega: vals.map(Math.sqrt), freq: vals.map((v) => Math.sqrt(v) / (2 * PI)), shapes: e.vectors.slice(0, k).map(model.expand) };
  };
  /** 梁线性屈曲：(K − P·KG)φ = 0，返回 {Pcr: N[], shapes} */
  FE.beamBuckling = function (model, nModes) {
    const e = LA.eigGen(model.KGr, model.Kr); // KG φ = μ K φ，Pcr = 1/μ（取 μ 最大者）
    if (!e.ok) return { Pcr: [], shapes: [] };
    const order = e.values.map((v, i) => i).filter((i) => e.values[i] > 1e-20).sort((a, b) => e.values[b] - e.values[a]);
    const k = Math.min(nModes || 4, order.length);
    const Pcr = [], shapes = [];
    for (let j = 0; j < k; j++) {
      const i = order[j];
      Pcr.push(1 / e.values[i]);
      const v = model.expand(e.vectors[i]);
      let mx = 0; for (let q = 0; q < v.length; q += 2) mx = Math.max(mx, Math.abs(v[q]));
      shapes.push(v.map((x) => x / (mx || 1)));
    }
    return { Pcr, shapes };
  };
  /** 梁静力：loads = [[自由度, 力]]，返回全自由度位移 */
  FE.beamStatic = function (model, loads) {
    const f = new Array(model.nd).fill(0);
    (loads || []).forEach((l) => { f[l[0]] += l[1]; });
    const u = LA.solve(model.Kr, LA.subVec(f, model.free));
    return u ? model.expand(u) : null;
  };
  /**
   * 两节点铁木辛柯梁（线性插值 w、θ）：o = {n, L, E, nu, I, A, kappa, integ:'full'|'reduced'}，悬臂端受 P，返回端部挠度
   * 完全积分（剪切项 2 点高斯）会剪切自锁，减缩积分（1 点）可避免。
   */
  FE.timoshenkoTip = function (o) {
    const n = o.n, le = o.L / n, nd = 2 * (n + 1), G = o.E / (2 * (1 + o.nu)), ks = (o.kappa || 5 / 6) * G * o.A, EI = o.E * o.I;
    const K = LA.zeros(nd);
    const gp = o.integ === 'reduced' ? [[0.5, 1]] : [[0.5 - 0.5 / Math.sqrt(3), 0.5], [0.5 + 0.5 / Math.sqrt(3), 0.5]];
    for (let e = 0; e < n; e++) {
      const d = [2 * e, 2 * e + 1, 2 * e + 2, 2 * e + 3];
      const kb = [[0, 0, 0, 0], [0, EI / le, 0, -EI / le], [0, 0, 0, 0], [0, -EI / le, 0, EI / le]];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[d[i]][d[j]] += kb[i][j];
      gp.forEach(([xi, w]) => {
        const B = [-1 / le, -(1 - xi), 1 / le, -xi];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) K[d[i]][d[j]] += ks * B[i] * B[j] * le * w;
      });
    }
    const free = []; for (let i = 2; i < nd; i++) free.push(i);
    const f = new Array(nd).fill(0); f[2 * n] = o.P;
    const u = LA.solve(LA.sub(K, free), LA.subVec(f, free));
    return u ? u[u.length - 2] : NaN;
  };

  /**
   * 平面桁架（直接刚度法）：o = {nodes:[[x,y]], elems:[{n:[i,j], EA}], fixed:[[节点, 0|1]], loads:[[节点, 0|1, F]]}
   * 返回 {ok, u（2n）, N（轴力，拉为正）, reactions:[[节点,方向,R]], K（总刚）, Kr, free, zero（零能模式数）, mech（零能模式向量，全自由度）}
   */
  FE.truss2d = function (o) {
    const nn = o.nodes.length, nd = 2 * nn, K = LA.zeros(nd), f = new Array(nd).fill(0);
    const geo = o.elems.map((e) => {
      const a = o.nodes[e.n[0]], b = o.nodes[e.n[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      return { c: dx / L, s: dy / L, L, k: e.EA / L };
    });
    o.elems.forEach((e, i) => {
      const g = geo[i], d = [2 * e.n[0], 2 * e.n[0] + 1, 2 * e.n[1], 2 * e.n[1] + 1];
      const T = [-g.c, -g.s, g.c, g.s];
      for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) K[d[p]][d[q]] += g.k * T[p] * T[q];
    });
    (o.loads || []).forEach((l) => { f[2 * l[0] + l[1]] += l[2]; });
    const fixedDofs = (o.fixed || []).map((x) => 2 * x[0] + x[1]);
    const free = []; for (let i = 0; i < nd; i++) if (fixedDofs.indexOf(i) < 0) free.push(i);
    const Kr = LA.sub(K, free);
    const zm = free.length ? LA.zeroModes(Kr, 1e-9) : { count: 0, vectors: [] };
    const res = { ok: false, K, Kr, free, zero: zm.count, mech: zm.vectors.map((v) => LA.expand(v, free, nd)), geo };
    if (zm.count > 0) return res;
    const ur = LA.solve(Kr, LA.subVec(f, free));
    if (!ur) return res;
    const u = LA.expand(ur, free, nd);
    const Ku = LA.matVec(K, u);
    res.ok = true; res.u = u;
    res.N = o.elems.map((e, i) => { const g = geo[i]; const du = (u[2 * e.n[1]] - u[2 * e.n[0]]) * g.c + (u[2 * e.n[1] + 1] - u[2 * e.n[0] + 1]) * g.s; return g.k * du; });
    res.reactions = (o.fixed || []).map((x) => [x[0], x[1], Ku[2 * x[0] + x[1]] - f[2 * x[0] + x[1]]]);
    return res;
  };

  /* ================================================================== 平面单元（平面应力 / 平面应变） */
  const G2 = 1 / Math.sqrt(3), G3 = Math.sqrt(0.6);
  const GAUSS = {
    1: [[0, 0, 4]],
    2: [[-G2, -G2, 1], [G2, -G2, 1], [G2, G2, 1], [-G2, G2, 1]],
    3: (function () { const p = [-G3, 0, G3], w = [5 / 9, 8 / 9, 5 / 9], r = []; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) r.push([p[i], p[j], w[i] * w[j]]); return r; })(),
  };
  FE.gauss = GAUSS;
  const Q4C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const Q8C = [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]];
  function shapeQ4(xi, eta) {
    const N = new Array(4), dxi = new Array(4), deta = new Array(4);
    for (let i = 0; i < 4; i++) {
      const a = Q4C[i][0], b = Q4C[i][1];
      N[i] = 0.25 * (1 + a * xi) * (1 + b * eta);
      dxi[i] = 0.25 * a * (1 + b * eta);
      deta[i] = 0.25 * b * (1 + a * xi);
    }
    return { N, dxi, deta };
  }
  function shapeQ8(xi, eta) {
    const N = new Array(8), dxi = new Array(8), deta = new Array(8);
    for (let i = 0; i < 8; i++) {
      const a = Q8C[i][0], b = Q8C[i][1];
      if (i < 4) {
        N[i] = 0.25 * (1 + a * xi) * (1 + b * eta) * (a * xi + b * eta - 1);
        dxi[i] = 0.25 * a * (1 + b * eta) * (2 * a * xi + b * eta);
        deta[i] = 0.25 * b * (1 + a * xi) * (a * xi + 2 * b * eta);
      } else if (a === 0) {
        N[i] = 0.5 * (1 - xi * xi) * (1 + b * eta);
        dxi[i] = -xi * (1 + b * eta);
        deta[i] = 0.5 * b * (1 - xi * xi);
      } else {
        N[i] = 0.5 * (1 + a * xi) * (1 - eta * eta);
        dxi[i] = 0.5 * a * (1 - eta * eta);
        deta[i] = -eta * (1 + a * xi);
      }
    }
    return { N, dxi, deta };
  }
  FE.shapeQ4 = shapeQ4;
  FE.shapeQ8 = shapeQ8;
  /** 等参映射：返回 {N, dNdx, dNdy, detJ, J} */
  function mapIso(sh, xy) {
    let j11 = 0, j12 = 0, j21 = 0, j22 = 0;
    for (let i = 0; i < xy.length; i++) { j11 += sh.dxi[i] * xy[i][0]; j12 += sh.dxi[i] * xy[i][1]; j21 += sh.deta[i] * xy[i][0]; j22 += sh.deta[i] * xy[i][1]; }
    const det = j11 * j22 - j12 * j21, n = xy.length, dNdx = new Array(n), dNdy = new Array(n);
    for (let i = 0; i < n; i++) {
      dNdx[i] = (j22 * sh.dxi[i] - j12 * sh.deta[i]) / det;
      dNdy[i] = (-j21 * sh.dxi[i] + j11 * sh.deta[i]) / det;
    }
    return { N: sh.N, dNdx, dNdy, detJ: det, J: [[j11, j12], [j21, j22]] };
  }
  FE.mapIso = mapIso;
  /** 弹性矩阵：mode = 'stress' 平面应力 | 'strain' 平面应变；应变顺序 [εx, εy, γxy] */
  FE.Dmat = function (E, nu, mode) {
    if (mode === 'strain') { const c = E / ((1 + nu) * (1 - 2 * nu)); return [[c * (1 - nu), c * nu, 0], [c * nu, c * (1 - nu), 0], [0, 0, (c * (1 - 2 * nu)) / 2]]; }
    const c = E / (1 - nu * nu);
    return [[c, c * nu, 0], [c * nu, c, 0], [0, 0, (c * (1 - nu)) / 2]];
  };
  function Dsplit(E, nu, mode) {
    const mu = E / (2 * (1 + nu)), lam = mode === 'strain' ? (E * nu) / ((1 + nu) * (1 - 2 * nu)) : (E * nu) / (1 - nu * nu);
    return { lam: [[lam, lam, 0], [lam, lam, 0], [0, 0, 0]], mu: [[2 * mu, 0, 0], [0, 2 * mu, 0], [0, 0, mu]] };
  }
  function addBtDB(Ke, Bx, By, D, w) {
    const n = Bx.length;
    for (let a = 0; a < n; a++) {
      const c00 = D[0][0] * Bx[a] + D[0][2] * By[a], c01 = D[1][0] * Bx[a] + D[1][2] * By[a], c02 = D[2][0] * Bx[a] + D[2][2] * By[a];
      const c10 = D[0][1] * By[a] + D[0][2] * Bx[a], c11 = D[1][1] * By[a] + D[1][2] * Bx[a], c12 = D[2][1] * By[a] + D[2][2] * Bx[a];
      for (let b = 0; b < n; b++) {
        Ke[2 * b][2 * a] += w * (Bx[b] * c00 + By[b] * c02);
        Ke[2 * b][2 * a + 1] += w * (Bx[b] * c10 + By[b] * c12);
        Ke[2 * b + 1][2 * a] += w * (By[b] * c01 + Bx[b] * c02);
        Ke[2 * b + 1][2 * a + 1] += w * (By[b] * c11 + Bx[b] * c12);
      }
    }
  }
  const colsOf = (dNdx, dNdy) => { const c = []; for (let i = 0; i < dNdx.length; i++) { c.push([dNdx[i], 0, dNdy[i]]); c.push([0, dNdy[i], dNdx[i]]); } return c; };
  const Dv = (D, v) => [D[0][0] * v[0] + D[0][1] * v[1] + D[0][2] * v[2], D[1][0] * v[0] + D[1][1] * v[1] + D[1][2] * v[2], D[2][0] * v[0] + D[2][1] * v[1] + D[2][2] * v[2]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  /** 非协调模式（Wilson–Taylor QM6）在 (ξ,η) 处的 B 列（4 个内部自由度），用中心雅可比并乘 detJ0/detJ 以通过分片试验 */
  function imCols(xi, eta, J0, det0, detJ) {
    const sc = det0 / detJ, dP = [[-2 * xi, 0], [0, -2 * eta]];
    const P = dP.map(([a, b]) => [((J0[1][1] * a - J0[0][1] * b) / det0) * sc, ((-J0[1][0] * a + J0[0][0] * b) / det0) * sc]);
    return [[P[0][0], 0, P[0][1]], [0, P[0][1], P[0][0]], [P[1][0], 0, P[1][1]], [0, P[1][1], P[1][0]]];
  }
  /** 单元刚度：返回 {K, X（非协调元内部自由度回收矩阵）, area} */
  function elemStiff(xy, type, integ, o, Dm, Ds) {
    const n = xy.length, Ke = LA.zeros(2 * n), t = o.t;
    if (type === 'T3') {
      const A2 = (xy[1][0] - xy[0][0]) * (xy[2][1] - xy[0][1]) - (xy[2][0] - xy[0][0]) * (xy[1][1] - xy[0][1]);
      const Bx = [(xy[1][1] - xy[2][1]) / A2, (xy[2][1] - xy[0][1]) / A2, (xy[0][1] - xy[1][1]) / A2];
      const By = [(xy[2][0] - xy[1][0]) / A2, (xy[0][0] - xy[2][0]) / A2, (xy[1][0] - xy[0][0]) / A2];
      addBtDB(Ke, Bx, By, Dm, (t * A2) / 2);
      return { K: Ke, area: A2 / 2 };
    }
    if (type === 'Q8') {
      (integ === 'reduced' ? GAUSS[2] : GAUSS[3]).forEach(([xi, eta, w]) => { const m = mapIso(shapeQ8(xi, eta), xy); addBtDB(Ke, m.dNdx, m.dNdy, Dm, w * m.detJ * t); });
      return { K: Ke };
    }
    if (integ === 'reduced') {
      const m = mapIso(shapeQ4(0, 0), xy), area = 4 * m.detJ;
      addBtDB(Ke, m.dNdx, m.dNdy, Dm, area * t);
      if (o.hg > 0) {
        const h = [1, -1, 1, -1];
        const hx = h[0] * xy[0][0] + h[1] * xy[1][0] + h[2] * xy[2][0] + h[3] * xy[3][0];
        const hy = h[0] * xy[0][1] + h[1] * xy[1][1] + h[2] * xy[2][1] + h[3] * xy[3][1];
        const gam = h.map((hi, i) => hi - hx * m.dNdx[i] - hy * m.dNdy[i]);
        const k = o.hg * o.E * t * area * (LA.dot(m.dNdx, m.dNdx) + LA.dot(m.dNdy, m.dNdy)) / 8;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = k * gam[i] * gam[j]; Ke[2 * i][2 * j] += v; Ke[2 * i + 1][2 * j + 1] += v; }
      }
      return { K: Ke, area };
    }
    if (integ === 'sri') {
      GAUSS[2].forEach(([xi, eta, w]) => { const m = mapIso(shapeQ4(xi, eta), xy); addBtDB(Ke, m.dNdx, m.dNdy, Ds.mu, w * m.detJ * t); });
      const m0 = mapIso(shapeQ4(0, 0), xy);
      addBtDB(Ke, m0.dNdx, m0.dNdy, Ds.lam, 4 * m0.detJ * t);
      return { K: Ke };
    }
    if (integ === 'im') {
      const m0 = mapIso(shapeQ4(0, 0), xy), Kci = LA.zeros(8, 4), Kii = LA.zeros(4);
      GAUSS[2].forEach(([xi, eta, w]) => {
        const m = mapIso(shapeQ4(xi, eta), xy), wt = w * m.detJ * t;
        addBtDB(Ke, m.dNdx, m.dNdy, Dm, wt);
        const Bc = colsOf(m.dNdx, m.dNdy), Bi = imCols(xi, eta, m0.J, m0.detJ, m.detJ), DBi = Bi.map((c) => Dv(Dm, c));
        for (let p = 0; p < 8; p++) for (let q = 0; q < 4; q++) Kci[p][q] += wt * dot3(Bc[p], DBi[q]);
        for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) Kii[p][q] += wt * dot3(Bi[p], DBi[q]);
      });
      const F = LA.lu(Kii), X = LA.zeros(4, 8);
      for (let c = 0; c < 8; c++) { const col = LA.luSolve(F, [Kci[c][0], Kci[c][1], Kci[c][2], Kci[c][3]]); for (let r = 0; r < 4; r++) X[r][c] = col[r]; }
      for (let p = 0; p < 8; p++) for (let q = 0; q < 8; q++) { let s = 0; for (let r = 0; r < 4; r++) s += Kci[p][r] * X[r][q]; Ke[p][q] -= s; }
      return { K: Ke, X, J0: m0.J, det0: m0.detJ };
    }
    GAUSS[2].forEach(([xi, eta, w]) => { const m = mapIso(shapeQ4(xi, eta), xy); addBtDB(Ke, m.dNdx, m.dNdy, Dm, w * m.detJ * t); });
    return { K: Ke };
  }
  FE.elemStiff = (xy, type, integ, o) => {
    const q = Object.assign({ t: 1, hg: 0, E: 210000, nu: 0.3 }, o);
    return elemStiff(xy, type, integ, q, FE.Dmat(q.E, q.nu, q.mode), Dsplit(q.E, q.nu, q.mode));
  };
  /** 等效应力（平面应变时计入 σz = ν(σx+σy)） */
  FE.vonMises = function (sx, sy, txy, sz) {
    const z = sz || 0;
    return Math.sqrt(0.5 * ((sx - sy) * (sx - sy) + (sy - z) * (sy - z) + (z - sx) * (z - sx)) + 3 * txy * txy);
  };
  FE.principal2d = function (sx, sy, txy) {
    const c = (sx + sy) / 2, r = Math.sqrt(((sx - sy) / 2) * ((sx - sy) / 2) + txy * txy);
    return { s1: c + r, s2: c - r, theta: 0.5 * Math.atan2(2 * txy, sx - sy) };
  };
  /** 单元应力：返回 {c 中心, gp 积分点 [[x,y,σx,σy,τxy]], corner 角点外推值}；选择减缩积分的体积部分取单元中心应变，与刚度积分一致 */
  function elemStress(xy, ue, type, integ, Dm, st, Ds) {
    const strainVec = (m, alpha, Bi) => {
      let ex = 0, ey = 0, g = 0;
      for (let i = 0; i < m.dNdx.length; i++) { ex += m.dNdx[i] * ue[2 * i]; ey += m.dNdy[i] * ue[2 * i + 1]; g += m.dNdy[i] * ue[2 * i] + m.dNdx[i] * ue[2 * i + 1]; }
      if (alpha) for (let k = 0; k < 4; k++) { ex += Bi[k][0] * alpha[k]; ey += Bi[k][1] * alpha[k]; g += Bi[k][2] * alpha[k]; }
      return [ex, ey, g];
    };
    let sig = (e) => Dv(Dm, e);
    const strain = (m, alpha, Bi) => sig(strainVec(m, alpha, Bi));
    if (type === 'Q4' && integ === 'sri' && Ds) {
      const pc = Dv(Ds.lam, strainVec(mapIso(shapeQ4(0, 0), xy)));
      sig = (e) => { const d = Dv(Ds.mu, e); return [d[0] + pc[0], d[1] + pc[1], d[2] + pc[2]]; };
    }
    if (type === 'T3') {
      const A2 = (xy[1][0] - xy[0][0]) * (xy[2][1] - xy[0][1]) - (xy[2][0] - xy[0][0]) * (xy[1][1] - xy[0][1]);
      const m = { dNdx: [(xy[1][1] - xy[2][1]) / A2, (xy[2][1] - xy[0][1]) / A2, (xy[0][1] - xy[1][1]) / A2], dNdy: [(xy[2][0] - xy[1][0]) / A2, (xy[0][0] - xy[2][0]) / A2, (xy[1][0] - xy[0][0]) / A2] };
      const s = strain(m);
      const cx = (xy[0][0] + xy[1][0] + xy[2][0]) / 3, cy = (xy[0][1] + xy[1][1] + xy[2][1]) / 3;
      return { c: s, gp: [[cx, cy, s[0], s[1], s[2]]], corner: [s, s, s] };
    }
    const shape = type === 'Q8' ? shapeQ8 : shapeQ4;
    const at = (xi, eta) => {
      const m = mapIso(shape(xi, eta), xy);
      let x = 0, y = 0; for (let i = 0; i < xy.length; i++) { x += m.N[i] * xy[i][0]; y += m.N[i] * xy[i][1]; }
      if (st && st.X) {
        const alpha = [0, 0, 0, 0];
        for (let r = 0; r < 4; r++) { let s = 0; for (let c = 0; c < 8; c++) s -= st.X[r][c] * ue[c]; alpha[r] = s; }
        return { x, y, s: strain(m, alpha, imCols(xi, eta, st.J0, st.det0, m.detJ)) };
      }
      return { x, y, s: strain(m) };
    };
    const c = at(0, 0).s;
    if (type === 'Q4' && integ === 'reduced') { const p = at(0, 0); return { c, gp: [[p.x, p.y, c[0], c[1], c[2]]], corner: [c, c, c, c] }; }
    if (type === 'Q8' && integ !== 'reduced') {
      const corner = Q4C.map(([a, b]) => at(a, b).s);
      return { c, gp: GAUSS[3].map(([a, b]) => { const p = at(a, b); return [p.x, p.y, p.s[0], p.s[1], p.s[2]]; }), corner };
    }
    const gp = GAUSS[2].map(([a, b]) => { const p = at(a, b); return [p.x, p.y, p.s[0], p.s[1], p.s[2]]; });
    const corner = Q4C.map(([a, b]) => {
      const N = shapeQ4(a * Math.sqrt(3), b * Math.sqrt(3)).N, s = [0, 0, 0];
      for (let g = 0; g < 4; g++) for (let k = 0; k < 3; k++) s[k] += N[g] * gp[g][2 + k];
      return s;
    });
    return { c, gp, corner };
  }
  /** 边上分布面力 → 一致节点力：nodes 为沿边有序节点（Q8 网格包含边中节点）；tx, ty 为面力 MPa，t 为厚度 */
  FE.edgeLoads = function (mesh, nodes, tx, ty, t) {
    const out = [], th = t || 1;
    const seg = (ids, w) => {
      const a = mesh.nodes[ids[0]], b = mesh.nodes[ids[ids.length - 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      ids.forEach((id, k) => { if (tx) out.push([id, 0, tx * th * L * w[k]]); if (ty) out.push([id, 1, ty * th * L * w[k]]); });
    };
    if (mesh.type === 'Q8') for (let k = 0; k + 2 < nodes.length; k += 2) seg([nodes[k], nodes[k + 1], nodes[k + 2]], [1 / 6, 4 / 6, 1 / 6]);
    else for (let k = 0; k + 1 < nodes.length; k++) seg([nodes[k], nodes[k + 1]], [0.5, 0.5]);
    return out;
  };
  /**
   * 平面线弹性求解（带状 LDLᵀ）。
   * o = {E, nu, t（厚度）, mode:'stress'|'strain', integ:'full'|'reduced'|'sri'|'im', hg（减缩积分沙漏刚度系数，教学实现）,
   *      fixed:[[节点, 0|1, 位移值]], loads:[[节点, 0|1, 力N]], body:[bx, by]（N/mm³）, eScale:[每个单元的刚度倍数]（双材料、刚性区等，默认 1）}
   * 返回 {ok, singular:[[节点,方向]], minRatio, u, energy, maxU, reactions:[[节点,方向,R]], elem:[{c, vm, corner, gp}], nodal:{sx,sy,txy,vm,s1,s2}, elemVM, ndof, hb, ms}
   */
  FE.plane2d = function (mesh, opts) {
    const t0 = Date.now();
    const o = Object.assign({ E: 210000, nu: 0.3, t: 1, mode: 'stress', integ: 'full', hg: 0 }, opts || {});
    const nn = mesh.nodes.length, nd = 2 * nn, type = mesh.type, integ = type === 'T3' ? 'full' : o.integ;
    let hb = 0;
    mesh.elems.forEach((e) => { let lo = Infinity, hi = -Infinity; for (const i of e) { if (i < lo) lo = i; if (i > hi) hi = i; } hb = Math.max(hb, 2 * (hi - lo) + 1); });
    const K = new BandSym(nd, hb), f = new Float64Array(nd);
    const Dm = FE.Dmat(o.E, o.nu, o.mode), Ds = Dsplit(o.E, o.nu, o.mode);
    const scaleOf = (ei) => (o.eScale && o.eScale[ei] !== undefined ? o.eScale[ei] : 1);
    const scD = (D, s) => (s === 1 ? D : D.map((r) => r.map((v) => v * s)));
    const aux = new Array(mesh.elems.length);
    mesh.elems.forEach((e, ei) => {
      const s = scaleOf(ei), xy = e.map((i) => mesh.nodes[i]);
      const r = elemStiff(xy, type, integ, s === 1 ? o : Object.assign({}, o, { E: o.E * s }), scD(Dm, s), s === 1 ? Ds : { lam: scD(Ds.lam, s), mu: scD(Ds.mu, s) });
      aux[ei] = r.X ? r : null;
      const dofs = [];
      e.forEach((i) => dofs.push(2 * i, 2 * i + 1));
      for (let p = 0; p < dofs.length; p++) for (let q = 0; q < dofs.length; q++) if (dofs[q] >= dofs[p]) K.add(dofs[p], dofs[q], r.K[p][q]);
      if (o.body) {
        if (type === 'T3') { const A = Math.abs(r.area); e.forEach((i) => { f[2 * i] += (o.body[0] * A * o.t) / 3; f[2 * i + 1] += (o.body[1] * A * o.t) / 3; }); }
        else {
          const shape = type === 'Q8' ? shapeQ8 : shapeQ4;
          (type === 'Q8' ? GAUSS[3] : GAUSS[2]).forEach(([xi, eta, w]) => { const m = mapIso(shape(xi, eta), xy); e.forEach((i, k) => { f[2 * i] += m.N[k] * o.body[0] * w * m.detJ * o.t; f[2 * i + 1] += m.N[k] * o.body[1] * w * m.detJ * o.t; }); });
        }
      }
    });
    (o.loads || []).forEach((l) => { f[2 * l[0] + l[1]] += l[2]; });
    const K0 = { n: nd, hb, w: hb + 1, a: Float64Array.from(K.a), mulVec: BandSym.prototype.mulVec };
    const f0 = Float64Array.from(f);
    const fixed = new Map();
    (o.fixed || []).forEach((c) => fixed.set(2 * c[0] + c[1], c[2] || 0));
    fixed.forEach((g, p) => {
      if (!g) return;
      const lo = Math.max(0, p - hb), hi = Math.min(nd - 1, p + hb);
      for (let j = lo; j <= hi; j++) if (j !== p && !fixed.has(j)) f[j] -= K.get(j, p) * g;
    });
    fixed.forEach((g, p) => {
      const lo = Math.max(0, p - hb), hi = Math.min(nd - 1, p + hb);
      for (let j = lo; j <= hi; j++) { const k = K.idx(p, j); if (k >= 0) K.a[k] = 0; }
      K.a[K.idx(p, p)] = 1;
      f[p] = g;
    });
    const fac = K.factor(), u = K.solve(f);
    const Ku = K0.mulVec(u);
    let energy = 0, maxU = 0;
    for (let i = 0; i < nd; i++) energy += 0.5 * u[i] * Ku[i];
    for (let i = 0; i < nn; i++) maxU = Math.max(maxU, Math.hypot(u[2 * i], u[2 * i + 1]));
    const reactions = [];
    fixed.forEach((g, p) => reactions.push([p >> 1, p & 1, Ku[p] - f0[p]]));
    const sz = (s) => (o.mode === 'strain' ? o.nu * (s[0] + s[1]) : 0);
    const nodal = { sx: new Float64Array(nn), sy: new Float64Array(nn), txy: new Float64Array(nn), vm: new Float64Array(nn), s1: new Float64Array(nn), s2: new Float64Array(nn) };
    const cnt = new Float64Array(nn), elemVM = new Float64Array(mesh.elems.length);
    const elem = mesh.elems.map((e, ei) => {
      const xy = e.map((i) => mesh.nodes[i]), ue = [];
      e.forEach((i) => ue.push(u[2 * i], u[2 * i + 1]));
      const se = scaleOf(ei);
      const s = elemStress(xy, ue, type, integ, scD(Dm, se), aux[ei], se === 1 ? Ds : { lam: scD(Ds.lam, se), mu: scD(Ds.mu, se) });
      const nc = type === 'T3' ? 3 : 4;
      for (let k = 0; k < nc; k++) { const i = e[k], c = s.corner[k]; nodal.sx[i] += c[0]; nodal.sy[i] += c[1]; nodal.txy[i] += c[2]; cnt[i]++; }
      if (type === 'Q8') for (let k = 4; k < 8; k++) { const a = s.corner[k - 4], b = s.corner[(k - 3) % 4], i = e[k]; nodal.sx[i] += (a[0] + b[0]) / 2; nodal.sy[i] += (a[1] + b[1]) / 2; nodal.txy[i] += (a[2] + b[2]) / 2; cnt[i]++; }
      s.vm = FE.vonMises(s.c[0], s.c[1], s.c[2], sz(s.c));
      s.cornerVM = s.corner.map((c) => FE.vonMises(c[0], c[1], c[2], sz(c)));
      elemVM[ei] = s.vm;
      return s;
    });
    for (let i = 0; i < nn; i++) {
      if (!cnt[i]) continue;
      nodal.sx[i] /= cnt[i]; nodal.sy[i] /= cnt[i]; nodal.txy[i] /= cnt[i];
      const s = [nodal.sx[i], nodal.sy[i], nodal.txy[i]];
      nodal.vm[i] = FE.vonMises(s[0], s[1], s[2], sz(s));
      const p = FE.principal2d(s[0], s[1], s[2]);
      nodal.s1[i] = p.s1; nodal.s2[i] = p.s2;
    }
    return {
      ok: fac.ok, singular: fac.singular.map((d) => [d >> 1, d & 1]), minRatio: fac.minRatio, negative: fac.negative,
      u, energy, maxU, reactions, elem, nodal, elemVM, ndof: nd, hb, ms: Date.now() - t0, opts: o,
    };
  };

  /* ================================================================== 网格生成（节点按较短方向优先编号以减小带宽） */
  FE.mesh = {};
  /**
   * 矩形结构网格：o = {Lx, Ly, nx, ny, type:'Q4'|'T3'|'Q8', x0, y0, distort（内部竖向网格线的梯形扭曲量，按单元宽度比例）, diag:'alt'（T3 交替对角线）}
   * 返回 {type, nodes, elems, nx, ny, Lx, Ly, edges:{left,right,bottom,top}}
   */
  FE.mesh.rect = function (opts) {
    const o = Object.assign({ Lx: 200, Ly: 10, nx: 20, ny: 2, type: 'Q4', x0: 0, y0: 0, distort: 0, diag: '' }, opts || {});
    const q = o.type === 'Q8' ? 2 : 1, NX = o.nx * q, NY = o.ny * q, dx = o.Lx / NX, dy = o.Ly / NY;
    const used = (I, J) => !(q === 2 && I % 2 === 1 && J % 2 === 1);
    const base = (I, J) => {
      let x = o.x0 + I * dx;
      const y = o.y0 + J * dy;
      if (o.distort && I % q === 0 && I > 0 && I < NX) {
        const col = I / q, s = (col % 2 === 1 ? 1 : -1) * o.distort * (o.Lx / o.nx);
        x += s * ((2 * J) / NY - 1);
      }
      return [x, y];
    };
    const pos = (I, J) => {
      if (q === 2 && I % 2 === 1) { const a = base(I - 1, J), b = base(I + 1, J); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
      return base(I, J);
    };
    const id = new Int32Array((NX + 1) * (NY + 1)).fill(-1), key = (I, J) => I * (NY + 1) + J, nodes = [];
    if (o.nx >= o.ny) { for (let I = 0; I <= NX; I++) for (let J = 0; J <= NY; J++) if (used(I, J)) { id[key(I, J)] = nodes.length; nodes.push(pos(I, J)); } }
    else { for (let J = 0; J <= NY; J++) for (let I = 0; I <= NX; I++) if (used(I, J)) { id[key(I, J)] = nodes.length; nodes.push(pos(I, J)); } }
    const at = (I, J) => id[key(I, J)];
    const elems = [];
    for (let i = 0; i < o.nx; i++) for (let j = 0; j < o.ny; j++) {
      const I = i * q, J = j * q, n1 = at(I, J), n2 = at(I + q, J), n3 = at(I + q, J + q), n4 = at(I, J + q);
      if (o.type === 'T3') {
        if (o.diag === 'alt' && (i + j) % 2 === 1) { elems.push([n1, n2, n4]); elems.push([n2, n3, n4]); }
        else { elems.push([n1, n2, n3]); elems.push([n1, n3, n4]); }
      } else if (o.type === 'Q8') elems.push([n1, n2, n3, n4, at(I + 1, J), at(I + 2, J + 1), at(I + 1, J + 2), at(I, J + 1)]);
      else elems.push([n1, n2, n3, n4]);
    }
    const line = (f, n) => { const r = []; for (let k = 0; k <= n; k++) { const v = f(k); if (v >= 0) r.push(v); } return r; };
    return {
      type: o.type, nodes, elems, nx: o.nx, ny: o.ny, Lx: o.Lx, Ly: o.Ly, at,
      edges: { left: line((J) => at(0, J), NY), right: line((J) => at(NX, J), NY), bottom: line((I) => at(I, 0), NX), top: line((I) => at(I, NY), NX) },
    };
  };
  /**
   * 带孔板四分之一模型（孔心在原点，受拉方向 X）：o = {Lx 半长, Ly 半宽, r 孔半径, nr 径向段数, nt 周向段数, bias 外/内径向尺寸比, type:'Q4'|'T3'}
   * edges：hole（θ 0→90°）、symX（y=0 边，x 从 r 到 Lx）、symY（x=0 边，y 从 r 到 Ly）、right（x=Lx）、top（y=Ly）；peak = 孔边 (0, r) 节点
   */
  FE.mesh.plateHole = function (opts) {
    const o = Object.assign({ Lx: 100, Ly: 50, r: 10, nr: 12, nt: 18, bias: 4, type: 'Q4' }, opts || {});
    const nt1 = Math.max(1, Math.min(o.nt - 1, Math.round((o.nt * o.Ly) / (o.Lx + o.Ly)))), nt2 = o.nt - nt1, thc = Math.atan2(o.Ly, o.Lx);
    const qb = o.nr > 1 ? Math.pow(o.bias, 1 / (o.nr - 1)) : 1;
    const sj = (j) => (Math.abs(qb - 1) < 1e-9 ? j / o.nr : (Math.pow(qb, j) - 1) / (Math.pow(qb, o.nr) - 1));
    const outer = (k) => (k <= nt1 ? [o.Lx, (o.Ly * k) / nt1] : [o.Lx - (o.Lx * (k - nt1)) / nt2, o.Ly]);
    const theta = (k) => (k <= nt1 ? (thc * k) / nt1 : thc + ((PI / 2 - thc) * (k - nt1)) / nt2);
    const rayMajor = o.nr <= o.nt;
    const id = (k, j) => (rayMajor ? k * (o.nr + 1) + j : j * (o.nt + 1) + k);
    const nodes = new Array((o.nt + 1) * (o.nr + 1));
    for (let k = 0; k <= o.nt; k++) {
      const th = theta(k), a = [o.r * Math.cos(th), o.r * Math.sin(th)], b = outer(k);
      if (k === o.nt) a[0] = 0;
      if (k === 0) a[1] = 0;
      for (let j = 0; j <= o.nr; j++) { const s = sj(j); nodes[id(k, j)] = [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s]; }
    }
    const elems = [];
    for (let k = 0; k < o.nt; k++) for (let j = 0; j < o.nr; j++) {
      const n1 = id(k, j), n2 = id(k, j + 1), n3 = id(k + 1, j + 1), n4 = id(k + 1, j);
      if (o.type === 'T3') { elems.push([n1, n2, n3]); elems.push([n1, n3, n4]); } else elems.push([n1, n2, n3, n4]);
    }
    const rng = (a, b, f) => { const r = []; for (let i = a; i <= b; i++) r.push(f(i)); return r; };
    return {
      type: o.type === 'T3' ? 'T3' : 'Q4', nodes, elems, opts: o, nt1,
      edges: {
        hole: rng(0, o.nt, (k) => id(k, 0)), symX: rng(0, o.nr, (j) => id(0, j)), symY: rng(0, o.nr, (j) => id(o.nt, j)),
        right: rng(0, nt1, (k) => id(k, o.nr)), top: rng(nt1, o.nt, (k) => id(k, o.nr)),
      },
      peak: id(o.nt, 0),
    };
  };
  /** L 形件：[0,2a]×[0,a] ∪ [0,a]×[a,2a]，凹角在 (a,a)；o = {a, n（每 a 长度的段数）, type}；corner 为凹角节点 */
  FE.mesh.lShape = function (opts) {
    const o = Object.assign({ a: 50, n: 8, type: 'Q4' }, opts || {});
    const n = o.n, N = 2 * n, h = o.a / n, keep = (I, J) => !(I > n && J > n);
    const id = new Int32Array((N + 1) * (N + 1)).fill(-1), nodes = [];
    for (let J = 0; J <= N; J++) for (let I = 0; I <= N; I++) if (keep(I, J)) { id[J * (N + 1) + I] = nodes.length; nodes.push([I * h, J * h]); }
    const at = (I, J) => id[J * (N + 1) + I];
    const elems = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      if (i >= n && j >= n) continue;
      const n1 = at(i, j), n2 = at(i + 1, j), n3 = at(i + 1, j + 1), n4 = at(i, j + 1);
      if (o.type === 'T3') { elems.push([n1, n2, n3]); elems.push([n1, n3, n4]); } else elems.push([n1, n2, n3, n4]);
    }
    const rng = (a, b, f) => { const r = []; for (let i = a; i <= b; i++) r.push(f(i)); return r; };
    return {
      type: o.type === 'T3' ? 'T3' : 'Q4', nodes, elems, opts: o, at,
      edges: { bottom: rng(0, N, (I) => at(I, 0)), left: rng(0, N, (J) => at(0, J)), top: rng(0, n, (I) => at(I, N)), right: rng(0, n, (J) => at(N, J)), innerH: rng(n, N, (I) => at(I, n)), innerV: rng(n, N, (J) => at(n, J)) },
      corner: at(n, n),
    };
  };
  FE.mesh.nearest = function (mesh, x, y) {
    let b = -1, bd = Infinity;
    mesh.nodes.forEach((p, i) => { const d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; b = i; } });
    return b;
  };
  /** 单元质量（Q4/T3）：返回每个单元 {aspect 长宽比, minAngle, maxAngle（°）, skew（°）, jacRatio（角点雅可比最小/最大，负值表示翻转）} */
  FE.mesh.quality = function (mesh) {
    return mesh.elems.map((e) => {
      const nc = mesh.type === 'T3' ? 3 : 4, P = e.slice(0, nc).map((i) => mesh.nodes[i]);
      const L = [], ang = [];
      let area2 = 0;
      for (let k = 0; k < nc; k++) { const a = P[k], b = P[(k + 1) % nc]; area2 += a[0] * b[1] - b[0] * a[1]; }
      const orient = area2 < 0 ? -1 : 1;
      for (let k = 0; k < nc; k++) {
        const a = P[k], b = P[(k + 1) % nc], c = P[(k + nc - 1) % nc];
        L.push(Math.hypot(b[0] - a[0], b[1] - a[1]));
        const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - a[0], c[1] - a[1]];
        let th = Math.atan2(orient * (u[0] * v[1] - u[1] * v[0]), u[0] * v[0] + u[1] * v[1]);
        if (th < 0) th += 2 * PI;
        ang.push((th * 180) / PI);
      }
      const q = { aspect: Math.max.apply(null, L) / (Math.min.apply(null, L) || 1e-12), minAngle: Math.min.apply(null, ang), maxAngle: Math.max.apply(null, ang), skew: 0, jacRatio: 1 };
      if (nc === 4) {
        const m = (i, j) => [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2];
        const m1 = m(0, 1), m2 = m(1, 2), m3 = m(2, 3), m4 = m(3, 0);
        const a = [m3[0] - m1[0], m3[1] - m1[1]], b = [m2[0] - m4[0], m2[1] - m4[1]];
        const th = (Math.acos(clamp(Math.abs(a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]) || 1), 0, 1)) * 180) / PI;
        q.skew = 90 - th;
        const dets = Q4C.map(([xi, eta]) => mapIso(shapeQ4(xi, eta), P).detJ);
        const mx = Math.max.apply(null, dets);
        q.jacRatio = Math.min.apply(null, dets) / (mx || 1);
        if (area2 < 0) q.jacRatio = -Math.abs(q.jacRatio);
      }
      return q;
    });
  };

  /* ================================================================== 时间积分：中心差分、Newmark、HHT、广义-α */
  /**
   * 方法参数（统一为广义-α 形式，Newmark 与 HHT 是其特例）：
   * name = 'cd' 中心差分（β=0, γ=1/2）| 'avg' 平均加速度 | 'linear' 线加速度 | 'fox' Fox–Goodwin | 'newmark'（o.beta, o.gamma）
   *      | 'hht'（o.alpha ∈ [-1/3, 0]，Hilber 记号）| 'galpha'（o.rhoInf ∈ [0,1]，Chung–Hulbert）
   * 返回 {am, af, beta, gamma, explicit, label}
   */
  FE.tiParams = function (name, opts) {
    const o = opts || {};
    switch (name) {
      case 'cd': return { am: 0, af: 0, beta: 0, gamma: 0.5, explicit: true, label: '中心差分' };
      case 'linear': return { am: 0, af: 0, beta: 1 / 6, gamma: 0.5, label: 'Newmark 线加速度' };
      case 'fox': return { am: 0, af: 0, beta: 1 / 12, gamma: 0.5, label: 'Fox–Goodwin' };
      case 'newmark': {
        const g = o.gamma !== undefined ? o.gamma : 0.5;
        return { am: 0, af: 0, beta: o.beta !== undefined ? o.beta : 0.25 * (g + 0.5) * (g + 0.5), gamma: g, label: 'Newmark' };
      }
      case 'hht': {
        const a = clamp(o.alpha !== undefined ? o.alpha : -0.05, -1 / 3, 0);
        return { am: 0, af: -a, beta: ((1 - a) * (1 - a)) / 4, gamma: 0.5 - a, label: 'HHT-α' };
      }
      case 'galpha': {
        const r = clamp(o.rhoInf !== undefined ? o.rhoInf : 0.8, 0, 1), am = (2 * r - 1) / (r + 1), af = r / (r + 1);
        return { am, af, gamma: 0.5 - am + af, beta: 0.25 * (1 - am + af) * (1 - am + af), label: '广义-α' };
      }
      default: return { am: 0, af: 0, beta: 0.25, gamma: 0.5, label: 'Newmark 平均加速度' };
    }
  };
  /** 无阻尼临界 Ω = ωΔt（条件稳定时）；无条件稳定返回 Infinity */
  FE.omegaCrit = function (p, xi) {
    const z = xi || 0;
    if (p.beta === 0 && Math.abs(p.gamma - 0.5) < 1e-12) return 2 * (Math.sqrt(1 + z * z) - z);
    if (p.gamma >= 0.5 && 2 * p.beta >= p.gamma) return Infinity;
    if (p.gamma >= 0.5) return 1 / Math.sqrt(p.gamma / 2 - p.beta);
    return 0;
  };
  /* 显式中心差分的阻尼力取半步速度 v^{n+1/2}（不进有效质量），对应 Δt_cr = (2/ω)(√(1+ξ²) − ξ)；否则相当于隐式处理阻尼，稳定界恒为 Ω = 2 */
  function giStep(p, m, c, k, dt, u, v, a, f) {
    const meff = m * (1 - p.am) + (p.explicit ? 0 : c * (1 - p.af) * p.gamma * dt) + k * (1 - p.af) * p.beta * dt * dt;
    const up = u + dt * v + dt * dt * (0.5 - p.beta) * a, vp = v + dt * (1 - p.gamma) * a;
    const rhs = f - m * p.am * a - c * ((1 - p.af) * vp + p.af * v) - k * ((1 - p.af) * up + p.af * u);
    const a1 = rhs / meff;
    return [up + p.beta * dt * dt * a1, vp + p.gamma * dt * a1, a1];
  }
  /**
   * 单自由度时程：o = {m, c, k, f(t), u0, v0, dt, n, method, alpha, rhoInf, beta, gamma 或 params}
   * 返回 {t[], u[], v[], a[], params, unstable}
   */
  FE.sdof = function (o) {
    const p = o.params || FE.tiParams(o.method || 'avg', o), m = o.m, c = o.c || 0, k = o.k, dt = o.dt, f = o.f || (() => 0);
    let u = o.u0 || 0, v = o.v0 || 0, a = (f(0) - c * v - k * u) / m, unstable = false;
    const T = [0], U = [u], V = [v], A = [a];
    for (let i = 0; i < o.n; i++) {
      const t1 = (i + 1) * dt, tf = (1 - p.af) * t1 + p.af * i * dt;
      const s = giStep(p, m, c, k, dt, u, v, a, f(tf));
      u = s[0]; v = s[1]; a = s[2];
      T.push(t1); U.push(u); V.push(v); A.push(a);
      if (!isFinite(u) || Math.abs(u) > 1e30) { unstable = true; break; }
    }
    return { t: T, u: U, v: V, a: A, params: p, unstable };
  };
  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { const d = b[0] * b[0] + b[1] * b[1] || 1e-300; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  /** 实系数三次多项式 λ³ + c2 λ² + c1 λ + c0 的根（Durand–Kerner） */
  function cubicRoots(c2, c1, c0) {
    let r = [[0.4, 0.9], [-0.65, 0.72], [0.9, -0.3]];
    const P = (z) => { const z2 = cmul(z, z), z3 = cmul(z2, z); return [z3[0] + c2 * z2[0] + c1 * z[0] + c0, z3[1] + c2 * z2[1] + c1 * z[1]]; };
    for (let it = 0; it < 200; it++) {
      let delta = 0;
      r = r.map((zi, i) => {
        let den = [1, 0];
        r.forEach((zj, j) => { if (j !== i) den = cmul(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
        const d = cdiv(P(zi), den);
        delta = Math.max(delta, Math.hypot(d[0], d[1]));
        return [zi[0] - d[0], zi[1] - d[1]];
      });
      if (delta < 1e-14) break;
    }
    return r;
  }
  /**
   * 放大矩阵谱分析（ξ 为物理阻尼比）：返回 {rho 谱半径, xiBar 算法阻尼比, Tratio 周期比 T̄/T, roots}
   * 主根取虚部最大的一对；主根为实数（数值“过阻尼”）时 Tratio = NaN。
   */
  FE.spectral = function (p, Omega, xi) {
    const k = Omega * Omega, c = 2 * (xi || 0) * Omega;
    const cols = [giStep(p, 1, c, k, 1, 1, 0, 0, 0), giStep(p, 1, c, k, 1, 0, 1, 0, 0), giStep(p, 1, c, k, 1, 0, 0, 1, 0)];
    const A = [[cols[0][0], cols[1][0], cols[2][0]], [cols[0][1], cols[1][1], cols[2][1]], [cols[0][2], cols[1][2], cols[2][2]]];
    const I1 = A[0][0] + A[1][1] + A[2][2];
    const I2 = A[0][0] * A[1][1] - A[0][1] * A[1][0] + A[0][0] * A[2][2] - A[0][2] * A[2][0] + A[1][1] * A[2][2] - A[1][2] * A[2][1];
    const I3 = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    const roots = cubicRoots(-I1, I2, -I3);
    const mod = roots.map((z) => Math.hypot(z[0], z[1]));
    const rho = Math.max.apply(null, mod);
    const pr = roots.reduce((b, z) => (Math.abs(z[1]) > Math.abs(b[1]) ? z : b), roots[0]);
    if (Math.abs(pr[1]) < 1e-12) return { rho, xiBar: NaN, Tratio: NaN, roots };
    const phi = Math.abs(Math.atan2(pr[1], pr[0])), lnr = Math.log(Math.hypot(pr[0], pr[1]));
    return { rho, xiBar: -lnr / phi, Tratio: Omega / phi, roots };
  };
  /**
   * 多自由度线性时程（稠密，适合几十个自由度）：o = {K, M, C, f(t)→向量, u0, v0, dt, n, method/params, every（记录间隔）}
   * 返回 {t[], u[[...]], unstable}
   */
  FE.mdof = function (o) {
    const p = o.params || FE.tiParams(o.method || 'avg', o), K = o.K, M = o.M, n = K.length, C = o.C || LA.zeros(n), dt = o.dt, every = o.every || 1;
    const fz = () => new Array(n).fill(0), f = o.f || fz;
    let u = o.u0 ? o.u0.slice() : fz(), v = o.v0 ? o.v0.slice() : fz();
    const r0 = f(0), Ku0 = LA.matVec(K, u), Cv0 = LA.matVec(C, v);
    let a = LA.solve(M, r0.map((x, i) => x - Ku0[i] - Cv0[i])) || fz();
    const Meff = M.map((row, i) => row.map((mij, j) => mij * (1 - p.am) + (p.explicit ? 0 : C[i][j] * (1 - p.af) * p.gamma * dt) + K[i][j] * (1 - p.af) * p.beta * dt * dt));
    const F = LA.lu(Meff);
    const T = [0], U = [u.slice()];
    let unstable = false;
    for (let s = 0; s < o.n; s++) {
      const t1 = (s + 1) * dt, tf = (1 - p.af) * t1 + p.af * s * dt;
      const up = u.map((x, i) => x + dt * v[i] + dt * dt * (0.5 - p.beta) * a[i]), vp = v.map((x, i) => x + dt * (1 - p.gamma) * a[i]);
      const fa = f(tf), Ma = LA.matVec(M, a);
      const vb = vp.map((x, i) => (1 - p.af) * x + p.af * v[i]), ub = up.map((x, i) => (1 - p.af) * x + p.af * u[i]);
      const Cv = LA.matVec(C, vb), Ku = LA.matVec(K, ub);
      const a1 = LA.luSolve(F, fa.map((x, i) => x - p.am * Ma[i] - Cv[i] - Ku[i]));
      u = up.map((x, i) => x + p.beta * dt * dt * a1[i]); v = vp.map((x, i) => x + p.gamma * dt * a1[i]); a = a1;
      if ((s + 1) % every === 0) { T.push(t1); U.push(u.slice()); }
      if (u.some((x) => !isFinite(x) || Math.abs(x) > 1e30)) { unstable = true; break; }
    }
    return { t: T, u: U, unstable, params: p };
  };
  /** 瑞利阻尼 C = αM + βK：由两个频率（Hz）处的目标阻尼比求 α、β */
  FE.rayleighFit = function (f1, f2, z1, z2) {
    const w1 = 2 * PI * f1, w2 = 2 * PI * f2, zz2 = z2 === undefined ? z1 : z2, d = w2 * w2 - w1 * w1;
    return { alpha: (2 * w1 * w2 * (z1 * w2 - zz2 * w1)) / d, beta: (2 * (zz2 * w2 - z1 * w1)) / d };
  };
  FE.rayleighZeta = (f, alpha, beta) => { const w = 2 * PI * f; return alpha / (2 * w) + (beta * w) / 2; };
  /** 单自由度频响：r = f/fn，返回 {mag 动力放大系数, phase（rad，0→−π）, T 传递率} */
  FE.frf = function (r, zeta) {
    const re = 1 - r * r, im = 2 * zeta * r, den = Math.hypot(re, im) || 1e-300;
    return { mag: 1 / den, phase: -Math.atan2(im, re), T: Math.sqrt(1 + im * im) / den };
  };
  /** Miles 公式：单自由度在平直加速度 PSD（g²/Hz）下的响应均方根（g） */
  FE.miles = (fn, Q, psd) => Math.sqrt((PI / 2) * fn * Q * psd);
  FE.mac = (a, b) => { const ab = LA.dot(a, b); return (ab * ab) / (LA.dot(a, a) * LA.dot(b, b) || 1e-300); };

  /* ================================================================== 一维显式杆（中心差分 + 集中质量） */
  /**
   * new VMD.fe.Bar1D({L, A, E, rho, n | sizes:[各单元长度], v0（向左撞墙的初速 mm/s）, left:'wall'|'fixed'|'free', right:'free'|'fixed',
   *   fRight(t)（右端力 N，拉为正）, sy, H（线性硬化塑性模量，sy=0 为纯弹性）, dtFactor（时间步缩放系数，默认 0.9）, dtFixed（强制步长 s）,
   *   qLin, qQuad（体积黏性的线性项、二次项系数；注意 LS-DYNA 关键字里 Q1 是二次项、Q2 是线性项）, dtTarget（质量缩放目标步长 s）,
   *   contact:'kinematic'|'penalty', kPen（N/mm）, contactDt（罚接触是否计入步长，默认 true）})
   * 方法：reset()、step()、run(tEnd, nRec, nSnap) → 历程；属性：dt、dtCrit、addedMass、t、u、vh、sig、unstable、energy()
   */
  class Bar1D {
    constructor(o) { this.set(o); }
    set(opts) {
      const o = (this.o = Object.assign({ L: 500, A: 100, E: 210000, rho: 7.85e-9, n: 100, v0: 5000, left: 'wall', right: 'free', fRight: null, sy: 0, H: 0, dtFactor: 0.9, dtFixed: 0, qLin: 0, qQuad: 0, dtTarget: 0, contact: 'kinematic', kPen: 0, contactDt: true }, opts || {}));
      const le = o.sizes ? o.sizes.slice() : new Array(o.n).fill(o.L / o.n);
      this.le = le; this.ne = le.length; this.nn = le.length + 1;
      this.x0 = [0];
      for (let e = 0; e < this.ne; e++) this.x0.push(this.x0[e] + le[e]);
      this.c = Math.sqrt(o.E / o.rho);
      this.rhoE = le.map((l) => { const dte = (o.dtFactor * l) / this.c; return o.dtTarget > 0 && dte < o.dtTarget ? o.E * Math.pow(o.dtTarget / (o.dtFactor * l), 2) : o.rho; });
      this.m = new Float64Array(this.nn);
      le.forEach((l, e) => { const me = this.rhoE[e] * o.A * l; this.m[e] += me / 2; this.m[e + 1] += me / 2; });
      this.mass0 = o.rho * o.A * this.x0[this.ne];
      let mt = 0; for (let i = 0; i < this.nn; i++) mt += this.m[i];
      this.massTotal = mt; this.addedMass = (mt - this.mass0) / this.mass0;
      const dts = le.map((l, e) => l / Math.sqrt(o.E / this.rhoE[e]));
      this.dtCrit = Math.min.apply(null, dts);
      this.dtCritElem = dts.indexOf(this.dtCrit);
      this.dtContact = o.contact === 'penalty' && o.kPen > 0 ? 2 * Math.sqrt(this.m[0] / (o.kPen + (o.E * o.A) / le[0])) : Infinity;
      this.dt = o.dtFixed > 0 ? o.dtFixed : o.dtFactor * Math.min(this.dtCrit, o.contactDt ? this.dtContact : Infinity);
      this.reset();
      return this;
    }
    reset() {
      const o = this.o, nn = this.nn, ne = this.ne;
      this.u = new Float64Array(nn);
      this.vh = new Float64Array(nn).fill(o.left === 'wall' ? -o.v0 : 0);
      if (o.left === 'fixed') this.vh[0] = 0;
      if (o.right === 'fixed') this.vh[nn - 1] = 0;
      this.eps = new Float64Array(ne); this.sig = new Float64Array(ne); this.ep = new Float64Array(ne); this.epBar = new Float64Array(ne); this.q = new Float64Array(ne);
      this.t = 0; this.nstep = 0; this.fc = 0; this.unstable = false; this.first = true;
      this.Eint = 0; this.Evis = 0; this.Wext = 0; this.Epen = 0; this.frPrev = 0;
      this.vfull = Float64Array.from(this.vh);
      this.KE0 = this.kinetic();
      return this;
    }
    kinetic() { let s = 0; for (let i = 0; i < this.nn; i++) s += 0.5 * this.m[i] * this.vfull[i] * this.vfull[i]; return s; }
    energy() { const KE = this.kinetic(); return { KE, IE: this.Eint, VE: this.Evis, PE: this.Epen, W: this.Wext, total: KE + this.Eint + this.Evis + this.Epen - this.Wext, KE0: this.KE0 }; }
    step() {
      const o = this.o, dt = this.dt, ne = this.ne, nn = this.nn, A = o.A, u = this.u, vh = this.vh, F = new Float64Array(nn);
      for (let e = 0; e < ne; e++) {
        const l = this.le[e], epsN = (u[e + 1] - u[e]) / l, de = epsN - this.eps[e];
        const s0 = this.sig[e];
        let s = s0 + o.E * de;
        if (o.sy > 0) {
          const ys = o.sy + o.H * this.epBar[e], fy = Math.abs(s) - ys;
          if (fy > 0) { const dg = fy / (o.E + o.H), sg = Math.sign(s); s -= o.E * dg * sg; this.ep[e] += dg * sg; this.epBar[e] += dg; }
        }
        this.Eint += 0.5 * (s0 + s) * de * A * l;
        const rate = (vh[e + 1] - vh[e]) / l;
        let q = 0;
        if (rate < 0 && (o.qLin > 0 || o.qQuad > 0)) q = this.rhoE[e] * l * (o.qQuad * l * rate * rate - o.qLin * this.c * rate);
        this.Evis += q * Math.max(0, -de) * A * l;
        this.eps[e] = epsN; this.sig[e] = s; this.q[e] = q;
        const N = (s - q) * A;
        F[e] += N; F[e + 1] -= N;
      }
      if (o.fRight) {
        const fr = o.fRight(this.t);
        F[nn - 1] += fr;
        if (!this.first) this.Wext += 0.5 * (this.frPrev + fr) * vh[nn - 1] * dt;
        this.frPrev = fr;
      }
      if (o.left === 'wall' && o.contact === 'penalty') {
        const pen = Math.max(0, -u[0]);
        const fp = o.kPen * pen;
        F[0] += fp; this.fc = fp; this.Epen = 0.5 * o.kPen * pen * pen;
      }
      const vOld = Float64Array.from(vh), h = this.first ? dt / 2 : dt;
      for (let i = 0; i < nn; i++) vh[i] += (h * F[i]) / this.m[i];
      if (o.left === 'fixed') vh[0] = 0;
      if (o.right === 'fixed') vh[nn - 1] = 0;
      if (o.left === 'wall' && o.contact !== 'penalty') {
        if (u[0] + dt * vh[0] < 0) { const vt = vh[0]; vh[0] = -u[0] / dt; this.fc = (this.m[0] * (vh[0] - vt)) / dt; }
        else this.fc = 0;
      }
      for (let i = 0; i < nn; i++) { this.vfull[i] = this.first ? vh[i] : 0.5 * (vOld[i] + vh[i]); u[i] += dt * vh[i]; }
      this.first = false;
      this.t += dt; this.nstep++;
      if (!(Math.abs(u[nn - 1]) < 10 * o.L) || !isFinite(u[0])) this.unstable = true;
      return this;
    }
    /** 运行到 tEnd（s），等间隔记录 nRec 个点、nSnap 张沿杆应力快照 */
    run(tEnd, nRec, nSnap) {
      const steps = Math.ceil(tEnd / this.dt), rec = Math.max(1, Math.floor(steps / (nRec || 400))), snapEvery = nSnap ? Math.max(1, Math.floor(steps / nSnap)) : 0;
      const mid = Math.floor(this.ne / 2);
      const H = { t: [], KE: [], IE: [], VE: [], total: [], fc: [], sMid: [], uLeft: [], uRight: [], snaps: [], dt: this.dt, steps };
      const push = () => {
        const en = this.energy();
        H.t.push(this.t); H.KE.push(en.KE); H.IE.push(en.IE); H.VE.push(en.VE + en.PE); H.total.push(en.total); H.fc.push(this.fc);
        H.sMid.push(this.sig[mid]); H.uLeft.push(this.u[0]); H.uRight.push(this.u[this.nn - 1]);
      };
      push();
      for (let s = 1; s <= steps; s++) {
        this.step();
        if (s % rec === 0) push();
        if (snapEvery && s % snapEvery === 0) H.snaps.push({ t: this.t, sig: Array.from(this.sig) });
        if (this.unstable) { H.unstableAt = this.t; push(); break; }
      }
      return H;
    }
  }
  FE.Bar1D = Bar1D;

  /* ================================================================== 材料本构 */
  const MT = (FE.mat = {});
  /** 一维弹塑性（线性硬化，beta=0 各向同性、1 随动、之间为混合），径向返回映射 */
  class Plastic1D {
    constructor(o) { this.o = Object.assign({ E: 210000, sy: 355, H: 1500, beta: 0 }, o || {}); this.reset(); }
    reset() { this.eps = 0; this.ep = 0; this.epBar = 0; this.alpha = 0; this.sig = 0; return this; }
    update(eps) {
      const o = this.o, Hi = (1 - o.beta) * o.H, Hk = o.beta * o.H;
      const st = o.E * (eps - this.ep), xi = st - this.alpha, f = Math.abs(xi) - (o.sy + Hi * this.epBar);
      let s = st, yielded = false;
      if (f > 0) {
        const dg = f / (o.E + o.H), sg = Math.sign(xi);
        this.ep += dg * sg; this.epBar += dg; this.alpha += Hk * dg * sg; s = st - o.E * dg * sg; yielded = true;
      }
      this.eps = eps; this.sig = s;
      return { sig: s, ep: this.ep, epBar: this.epBar, alpha: this.alpha, yielded, syNow: o.sy + Hi * this.epBar };
    }
  }
  MT.Plastic1D = Plastic1D;
  MT.engToTrue = (e, s) => ({ eps: Math.log(1 + e), sig: s * (1 + e) });
  MT.trueToEng = (eps, sig) => ({ e: Math.exp(eps) - 1, s: sig / Math.exp(eps) });
  MT.swift = (ep, p) => p.K * Math.pow(p.e0 + Math.max(0, ep), p.n);
  MT.voce = (ep, p) => p.sy + p.Q * (1 - Math.exp(-p.b * Math.max(0, ep)));
  MT.linearHard = (ep, p) => p.sy + p.H * Math.max(0, ep);
  MT.cowper = (rate, D, q) => 1 + Math.pow(Math.max(0, rate) / D, 1 / q);
  MT.johnsonCook = function (ep, rate, T, p) {
    const ts = p.Tm > p.Tr && T !== undefined ? clamp((T - p.Tr) / (p.Tm - p.Tr), 0, 1) : 0;
    return (p.A + p.B * Math.pow(Math.max(0, ep), p.n)) * (1 + p.C * Math.log(Math.max(rate / (p.eps0 || 1), 1))) * (1 - Math.pow(ts, p.m));
  };
  /**
   * 由 Swift 真应力曲线生成单调拉伸曲线（到颈缩为止）：返回 {trueE, trueS, engE, engS, neck:{epsP, sig, e, s}}
   * mat 默认课程钢；点数 n
   */
  MT.tensileCurve = function (mat, n) {
    const m = mat || MAT.steel, sw = m.swift, N = n || 80, out = { trueE: [], trueS: [], engE: [], engS: [] };
    const sy = MT.swift(0, sw), epNeck = Math.max(0, sw.n - sw.e0);
    const push = (eps, sig) => { out.trueE.push(eps); out.trueS.push(sig); const g = MT.trueToEng(eps, sig); out.engE.push(g.e); out.engS.push(g.s); };
    for (let i = 0; i <= 10; i++) { const s = (sy * i) / 10; push(s / m.E, s); }
    for (let i = 1; i <= N; i++) { const ep = (epNeck * i) / N, s = MT.swift(ep, sw); push(s / m.E + ep, s); }
    const s = MT.swift(epNeck, sw), eN = s / m.E + epNeck, g = MT.trueToEng(eN, s);
    out.neck = { epsP: epNeck, sig: s, eps: eN, e: g.e, s: g.s };
    return out;
  };
  /**
   * 不可压超弹性名义应力（MPa）：model = 'neo'|'mooney'|'ogden'，mode = 'uni' 单轴 | 'biax' 等双轴 | 'shear' 纯剪（平面拉伸）
   * p：neo {C10}；mooney {C10, C01}；ogden {mu, alpha}
   */
  MT.hyper = function (model, mode, lam, p) {
    const L = lam;
    if (model === 'ogden') {
      const a = p.alpha, k = (2 * p.mu) / a;
      if (mode === 'biax') return k * (Math.pow(L, a - 1) - Math.pow(L, -2 * a - 1));
      if (mode === 'shear') return k * (Math.pow(L, a - 1) - Math.pow(L, -a - 1));
      return k * (Math.pow(L, a - 1) - Math.pow(L, -a / 2 - 1));
    }
    const C10 = p.C10, C01 = model === 'mooney' ? p.C01 || 0 : 0;
    if (mode === 'biax') return 2 * (L - Math.pow(L, -5)) * (C10 + C01 * L * L);
    if (mode === 'shear') return 2 * (L - Math.pow(L, -3)) * (C10 + C01);
    return 2 * (L - 1 / (L * L)) * (C10 + C01 / L);
  };
  /** Prony 级数松弛模量 G(t) = G∞ + Σ Gi·exp(−t/τi) */
  MT.prony = (t, p) => p.terms.reduce((s, q) => s + q.G * Math.exp(-t / q.tau), p.Ginf);

  /* ================================================================== 非线性：两杆扁拱与路径跟踪 */
  /** 两杆扁拱：返回 {R(w) 顶点抗力（向下为正）, dR(w), L0, wLim, PLim（极值点）, wSnap（载荷控制跳跃后的位置）} */
  FE.misesTruss = function (p) {
    const q = Object.assign({}, VMD.data.parts.misesTruss, p || {});
    const a = q.a, h = q.h, EA = q.EA !== undefined && !(p && p.A) ? q.EA : MAT.steel.E * q.A, L0 = Math.hypot(a, h);
    const R = (w) => { const z = h - w, L = Math.hypot(a, z); return 2 * EA * z * (1 / L - 1 / L0); };
    const dR = (w) => { const z = h - w, L = Math.hypot(a, z); return 2 * EA * (1 / L0 - (a * a) / (L * L * L)); };
    const Ll = Math.cbrt(a * a * L0), zl = Math.sqrt(Math.max(0, Ll * Ll - a * a)), wLim = h - zl, PLim = R(wLim);
    let lo = h + zl, hi = h + 20 * h;
    for (let i = 0; i < 200; i++) { const mid = 0.5 * (lo + hi); if (R(mid) < PLim) lo = mid; else hi = mid; }
    return { R, dR, L0, EA, a, h, wLim, PLim, wSnap: 0.5 * (lo + hi), ks: q.ks };
  };
  /** 扁拱路径跟踪模型：withSpring=true 时加载点经串联弹簧 ks 连到顶点（2 自由度 [w, v]，可出现“回跳” snap-back） */
  FE.misesModel = function (p, withSpring) {
    const mt = FE.misesTruss(p), ks = p && p.ks !== undefined ? p.ks : mt.ks;
    if (!withSpring) return { mt, fint: (u) => [mt.R(u[0])], Kt: (u) => [[mt.dR(u[0])]], fref: [1], ndof: 1 };
    return {
      mt, ks, ndof: 2, fref: [0, 1],
      fint: (u) => [mt.R(u[0]) - ks * (u[1] - u[0]), ks * (u[1] - u[0])],
      Kt: (u) => [[mt.dR(u[0]) + ks, -ks], [-ks, ks]],
    };
  };
  /**
   * 路径跟踪（小规模稠密系统）：o = {fint(u), Kt(u), fref, u0, method:'load'|'disp'|'arc', steps, dl（载荷步）, du + ctrl（位移控制）, ds（弧长）, tol, maxIter}
   * 返回 {points:[{lam, u, iter, ok}], failed（失败的步号）, reason, jumps（相邻两点位移突变的步号：载荷/位移控制越过极值点或回跳点时出现）}
   */
  FE.pathFollow = function (o) {
    const out = pathFollowCore(o), pts = out.points, d = [];
    for (let i = 1; i < pts.length; i++) d.push(Math.sqrt(pts[i].u.reduce((s, v, k) => s + (v - pts[i - 1].u[k]) * (v - pts[i - 1].u[k]), 0)));
    const med = d.slice().sort((a, b) => a - b)[Math.floor(d.length / 2)] || 0;
    out.jumps = [];
    d.forEach((v, i) => { if (o.method !== 'arc' && med > 0 && v > 5 * med) out.jumps.push(i + 1); });
    return out;
  };
  function pathFollowCore(o) {
    const n = o.fref.length, tol = o.tol || 1e-8, maxIt = o.maxIter || 30;
    const nrm = (x) => Math.sqrt(x.reduce((s, v) => s + v * v, 0)), fs = nrm(o.fref) || 1;
    const res = (uu, ll) => { const fi = o.fint(uu); return o.fref.map((fr, i) => ll * fr - fi[i]); };
    const conv = (r, ll) => nrm(r) <= tol * fs * Math.max(1, Math.abs(ll)) + 1e-12;
    let u = o.u0 ? o.u0.slice() : new Array(n).fill(0), lam = o.lam0 || 0;
    const pts = [{ lam, u: u.slice(), iter: 0, ok: true }];
    if (o.method === 'load') {
      for (let s = 0; s < o.steps; s++) {
        const lt = lam + o.dl;
        let uu = u.slice(), ok = false, it = 0;
        for (; it < maxIt; it++) {
          const r = res(uu, lt);
          if (conv(r, lt)) { ok = true; break; }
          const du = LA.solve(o.Kt(uu), r);
          if (!du) break;
          uu = uu.map((v, i) => v + du[i]);
          if (!isFinite(uu[0])) break;
        }
        if (!ok) return { points: pts, failed: s + 1, reason: '载荷控制：牛顿迭代在 ' + maxIt + ' 次内不收敛' };
        u = uu; lam = lt; pts.push({ lam, u: u.slice(), iter: it, ok });
      }
      return { points: pts };
    }
    if (o.method === 'disp') {
      const c = o.ctrl || 0;
      for (let s = 0; s < o.steps; s++) {
        const uu = u.slice();
        uu[c] += o.du;
        let ll = lam, ok = false, it = 0;
        for (; it < maxIt; it++) {
          const r = res(uu, ll);
          if (conv(r, ll)) { ok = true; break; }
          const Kt = o.Kt(uu), J = [];
          for (let i = 0; i < n; i++) { const row = []; for (let j = 0; j < n; j++) if (j !== c) row.push(-Kt[i][j]); row.push(o.fref[i]); J.push(row); }
          const dx = LA.solve(J, r.map((v) => -v));
          if (!dx) break;
          let k = 0;
          for (let j = 0; j < n; j++) if (j !== c) uu[j] += dx[k++];
          ll += dx[k];
        }
        if (!ok) return { points: pts, failed: s + 1, reason: '位移控制：增广方程奇异或不收敛（控制位移不再单调，出现回跳）' };
        u = uu; lam = ll; pts.push({ lam, u: u.slice(), iter: it, ok });
      }
      return { points: pts };
    }
    let ds = o.ds, prev = null, cuts = 0;
    for (let s = 0; s < o.steps; s++) {
      const F0 = LA.lu(o.Kt(u));
      if (!F0.ok) return { points: pts, failed: s + 1, reason: '弧长法：切线刚度奇异' };
      const dut = LA.luSolve(F0, o.fref);
      const sg = prev ? (LA.dot(prev, dut) >= 0 ? 1 : -1) : 1;
      const dl0 = (sg * ds) / (nrm(dut) || 1);
      let Du = dut.map((v) => v * dl0), Dl = dl0, ok = false, it = 0;
      for (; it < maxIt; it++) {
        const uu = u.map((v, i) => v + Du[i]), ll = lam + Dl, r = res(uu, ll);
        if (conv(r, ll)) { ok = true; break; }
        const F = LA.lu(o.Kt(uu));
        if (!F.ok) break;
        const dur = LA.luSolve(F, r), du2 = LA.luSolve(F, o.fref), w = Du.map((v, i) => v + dur[i]);
        const qa = LA.dot(du2, du2), qb = 2 * LA.dot(du2, w), qc = LA.dot(w, w) - ds * ds, disc = qb * qb - 4 * qa * qc;
        if (disc < 0) break;
        const r1 = (-qb + Math.sqrt(disc)) / (2 * qa), r2 = (-qb - Math.sqrt(disc)) / (2 * qa);
        const c1 = LA.dot(Du, w.map((v, i) => v + r1 * du2[i])), c2 = LA.dot(Du, w.map((v, i) => v + r2 * du2[i]));
        const dl = c1 >= c2 ? r1 : r2;
        Du = w.map((v, i) => v + dl * du2[i]); Dl += dl;
      }
      if (!ok) { if (cuts++ < 6) { ds /= 2; s--; continue; } return { points: pts, failed: s + 1, reason: '弧长法：多次减半弧长仍不收敛' }; }
      u = u.map((v, i) => v + Du[i]); lam += Dl; prev = Du; pts.push({ lam, u: u.slice(), iter: it, ok: true });
    }
    return { points: pts };
  }

  /* ================================================================== 疲劳 */
  const FAT = (FE.fatigue = {});
  /** 提取峰谷点（去掉重复值与非反向点） */
  FAT.turning = function (y) {
    const r = [];
    for (let i = 0; i < y.length; i++) {
      const v = y[i];
      if (r.length && v === r[r.length - 1]) continue;
      if (r.length >= 2 && (r[r.length - 1] - r[r.length - 2]) * (v - r[r.length - 1]) > 0) r[r.length - 1] = v;
      else r.push(v);
    }
    return r;
  };
  /** 雨流计数（ASTM E1049 三点法）：返回 {cycles:[{range, amp, mean, count, from, to}], turning} */
  FAT.rainflow = function (series) {
    const tp = FAT.turning(series), st = [], cycles = [];
    const push = (a, b, c) => cycles.push({ range: Math.abs(a - b), amp: Math.abs(a - b) / 2, mean: (a + b) / 2, count: c, from: a, to: b });
    for (const p of tp) {
      st.push(p);
      while (st.length >= 3) {
        const n = st.length, X = Math.abs(st[n - 1] - st[n - 2]), Y = Math.abs(st[n - 2] - st[n - 3]);
        if (X < Y) break;
        if (n === 3) { push(st[0], st[1], 0.5); st.shift(); }
        else { push(st[n - 3], st[n - 2], 1); const last = st.pop(); st.pop(); st.pop(); st.push(last); }
      }
    }
    for (let i = 0; i + 1 < st.length; i++) push(st[i], st[i + 1], 0.5);
    return { cycles, turning: tp };
  };
  /** Basquin：σa = σf'(2N)^b；低于疲劳极限 Se（p.limit !== false）时返回 Infinity */
  FAT.basquinN = function (sa, p) {
    if (!(sa > 0)) return Infinity;
    if (p.limit !== false && p.Se && sa < p.Se) return Infinity;
    return 0.5 * Math.pow(sa / p.sf, 1 / p.b);
  };
  FAT.snStress = (N, p) => p.sf * Math.pow(2 * N, p.b);
  /** 平均应力修正 → 等效对称循环幅值：method = 'none'|'goodman'|'gerber'|'soderberg'|'morrow'|'swt'；压缩平均应力默认不修正 */
  FAT.meanCorr = function (sa, sm, method, p) {
    const m = method || 'goodman', s = p.compressive ? sm : Math.max(0, sm);
    switch (m) {
      case 'goodman': return s >= p.su ? Infinity : sa / (1 - s / p.su);
      case 'gerber': return Math.abs(s) >= p.su ? Infinity : sa / (1 - (s / p.su) * (s / p.su));
      case 'soderberg': return s >= p.sy ? Infinity : sa / (1 - s / p.sy);
      case 'morrow': return s >= p.sf ? Infinity : sa / (1 - s / p.sf);
      case 'swt': { const smax = sm + sa; return smax > 0 ? Math.sqrt(smax * sa) : 0; }
      default: return sa;
    }
  };
  /** Miner 线性累积损伤：cycles 来自雨流（应力 MPa）；p 为材料疲劳参数（含 su、sy）；返回 {D, repeats, rows} */
  FAT.miner = function (cycles, p, method) {
    let D = 0;
    const rows = cycles.map((c) => {
      const sar = FAT.meanCorr(c.amp, c.mean, method, p), N = FAT.basquinN(sar, p), d = isFinite(N) ? c.count / N : 0;
      D += d;
      return Object.assign({ sar, N, d }, c);
    });
    return { D, repeats: D > 0 ? 1 / D : Infinity, rows };
  };
  FAT.ramberg = (sig, E, Kp, np) => sig / E + Math.pow(Math.abs(sig) / Kp, 1 / np) * Math.sign(sig);
  /** Neuber 修正：Kt²·S²/E = σ·ε，配合 Ramberg–Osgood 循环曲线，返回缺口根部 {sigma, eps, elastic: Kt·S} */
  FAT.neuber = function (o) {
    const E = o.E, Kp = o.Kp, np = o.np, rhs = (o.Kt * o.S) * (o.Kt * o.S) / E;
    let lo = 0, hi = Math.max(o.Kt * o.S, 1);
    for (let i = 0; i < 200; i++) { const mid = 0.5 * (lo + hi); if (mid * FAT.ramberg(mid, E, Kp, np) < rhs) lo = mid; else hi = mid; }
    const s = 0.5 * (lo + hi);
    return { sigma: s, eps: FAT.ramberg(s, E, Kp, np), elastic: o.Kt * o.S };
  };
  /** 应变寿命（Coffin–Manson–Basquin，可含 Morrow 平均应力）：εa = (σf'−σm)/E·(2N)^b + εf'(2N)^c，返回反向次数 2N */
  FAT.strainLife = function (epsA, p, sm) {
    const E = p.E || MAT.steel.E, s = sm || 0, f = (x) => ((p.sf - s) / E) * Math.pow(x, p.b) + p.ef * Math.pow(x, p.c) - epsA;
    let lo = 0, hi = 12;
    if (f(1) < 0) return 1;
    for (let i = 0; i < 200; i++) { const mid = 0.5 * (lo + hi); if (f(Math.pow(10, mid)) > 0) lo = mid; else hi = mid; }
    return Math.pow(10, 0.5 * (lo + hi));
  };

  /* ================================================================== 碰撞吸能 */
  const CR = (FE.crash = {});
  /** 方管轴向压溃（Abramowicz–Jones 经验式，σ0 为流动应力）：返回 {Pm 准静态平均力 N, H 半波长 mm, rate 1/s, factor, PmDyn} */
  CR.squareTube = function (o) {
    const Pm = 13.06 * o.sigma0 * Math.pow(o.t, 5 / 3) * Math.pow(o.C, 1 / 3), H = 0.99 * Math.pow(o.t, 1 / 3) * Math.pow(o.C, 2 / 3);
    const rate = o.V ? (0.33 * o.V) / o.C : 0, factor = o.D ? MT.cowper(rate, o.D, o.q) : 1;
    return { Pm, H, rate, factor, PmDyn: Pm * factor };
  };
  /** 力—位移曲线吸能指标：返回 {E（mJ）, Fpeak, Fmean, CFE（压溃力效率）, dmax} */
  CR.metrics = function (d, F) {
    let E = 0, Fpeak = 0;
    for (let i = 1; i < d.length; i++) E += 0.5 * (F[i] + F[i - 1]) * (d[i] - d[i - 1]);
    for (let i = 0; i < F.length; i++) Fpeak = Math.max(Fpeak, F[i]);
    const dmax = d[d.length - 1] - d[0], Fmean = dmax > 0 ? E / dmax : 0;
    return { E, Fpeak, Fmean, CFE: Fpeak > 0 ? Fmean / Fpeak : 0, dmax };
  };
  /** 教学用示意压溃曲线（不是仿真结果）：初始峰值 peak×Pm，之后以周期 2H 围绕 Pm 波动 */
  CR.idealCurve = function (o) {
    const Pm = o.Pm, H = o.H, peak = o.peak || 1.9, dmax = o.dmax || 120, n = o.n || 400, d0 = 0.12 * H, out = [];
    for (let i = 0; i <= n; i++) {
      const d = (dmax * i) / n;
      const F = d <= d0 ? (peak * Pm * d) / d0 : Pm * (1 + 0.5 * Math.cos((PI * (d - d0)) / H)) + (peak - 1.5) * Pm * Math.exp(-(d - d0) / (0.3 * H));
      out.push([d, F]);
    }
    return out;
  };

  /* ================================================================== 解析参考解 */
  /** Kirsch 解：无限大板圆孔（半径 a）受 X 向单轴拉应力 S，返回极坐标与直角坐标应力 */
  FE.kirsch = function (r, th, a, S) {
    const q = (a * a) / (r * r), c2 = Math.cos(2 * th), s2 = Math.sin(2 * th);
    const srr = (S / 2) * (1 - q) + (S / 2) * (1 - 4 * q + 3 * q * q) * c2;
    const stt = (S / 2) * (1 + q) - (S / 2) * (1 + 3 * q * q) * c2;
    const srt = -(S / 2) * (1 + 2 * q - 3 * q * q) * s2;
    const c = Math.cos(th), s = Math.sin(th);
    return { srr, stt, srt, sx: srr * c * c + stt * s * s - 2 * srt * s * c, sy: srr * s * s + stt * c * c + 2 * srt * s * c, txy: (srr - stt) * s * c + srt * (c * c - s * s) };
  };
  FE.heywood = (d, W) => { const KtNet = 2 + Math.pow(1 - d / W, 3); return { KtNet, KtGross: KtNet / (1 - d / W) }; };
  FE.euler = (E, I, L, K) => (PI * PI * E * I) / Math.pow((K || 1) * L, 2);
  /** Hertz 球—平面接触：返回 {a 接触半径, p0 峰值压力, delta 趋近量, Estar} */
  FE.hertzSphere = function (F, R, E1, nu1, E2, nu2) {
    const Es = 1 / ((1 - nu1 * nu1) / E1 + (E2 ? (1 - nu2 * nu2) / E2 : 0)), a = Math.cbrt((3 * F * R) / (4 * Es));
    return { a, p0: (3 * F) / (2 * PI * a * a), delta: (a * a) / R, Estar: Es };
  };
  /** Richardson 外推（三套网格，f1 最细，加密比 r）：返回 {p 观测收敛阶, fExt, gci（细网格 GCI，安全系数 1.25）, ok} */
  FE.richardson = function (f1, f2, f3, r) {
    const e21 = f2 - f1, e32 = f3 - f2;
    if (!(e21 * e32 > 0)) return { ok: false, p: NaN, fExt: NaN, gci: NaN };
    const p = Math.log(e32 / e21) / Math.log(r), fExt = f1 + (f1 - f2) / (Math.pow(r, p) - 1);
    return { ok: true, p, fExt, gci: (1.25 * Math.abs(e21 / f1)) / (Math.pow(r, p) - 1) };
  };
  /** 悬臂梁（端部集中力）挠度 w(x) = P x²(3L − x)/(6EI) */
  FE.cantileverW = (x, P, L, EI) => (P * x * x * (3 * L - x)) / (6 * EI);
  /** 欧拉梁悬臂第 k 阶振型（k=0,1,2…），返回 {w, curv}，ξ∈[0,1]，端部 w 归一为 ±1 */
  FE.cantileverMode = function (k, xi) {
    const b = [1.875104, 4.694091, 7.854757, 10.995541][Math.min(3, k)];
    const s = (Math.cosh(b) + Math.cos(b)) / (Math.sinh(b) + Math.sin(b));
    const phi = (x) => Math.cosh(b * x) - Math.cos(b * x) - s * (Math.sinh(b * x) - Math.sin(b * x));
    const tip = phi(1);
    return { w: phi(xi) / tip, curv: (b * b * (Math.cosh(b * xi) + Math.cos(b * xi) - s * (Math.sinh(b * xi) + Math.sin(b * xi)))) / tip };
  };
})(typeof window !== 'undefined' ? window : globalThis);
