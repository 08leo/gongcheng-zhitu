// ═══════════════════════════════════════════
// crash.js — ⚡ 考前速成模式（临时抱佛脚专用）
// 只干一件事：把 18 道经典补三视图真题讲透
//   题目视图 + 答案视图（自动投影，含虚线）
//   直白思路（3 步） + 答案要点 + 易错点
//   + 可旋转 3D 模型对照
// ═══════════════════════════════════════════

const Crash = (() => {

  // ───────────────────────────────────────
  // 几何构造工具（约定：X=长 Y=高 Z=宽）
  // 与 engine.js 的投影方向一致
  // ───────────────────────────────────────
  function box(w, h, d) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return g;
  }
  function cyl(r, h, seg = 40) {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  }
  function cone(r, h, seg = 40) {
    const g = new THREE.ConeGeometry(r, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  }
  function frustum(rB, rT, h, seg = 40) {
    const g = new THREE.CylinderGeometry(rT, rB, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  }
  // 水平圆柱：轴线沿 X，居中于原点
  function cylH(r, len, seg = 40) {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return g;
  }
  // 半圆柱：轴线沿 Y，自带上下盖（thetaLength=π 自动封闭，投影干净）
  function halfCyl(r, h, thetaStart = 0, seg = 40) {
    const g = new THREE.CylinderGeometry(r, r, h, seg, 1, false, thetaStart, Math.PI);
    g.translate(0, h / 2, 0);
    return g;
  }
  function t(g, x, y, z) { g.translate(x, y, z); return g; }

  // 布尔：合并多个几何体
  function merge(list) {
    const P = [], I = []; let off = 0;
    list.forEach(g => {
      const p = g.attributes.position, i = g.index;
      for (let k = 0; k < p.count; k++) P.push(p.getX(k), p.getY(k), p.getZ(k));
      if (i) for (let k = 0; k < i.count; k++) I.push(i.getX(k) + off);
      else for (let k = 0; k < p.count; k++) I.push(k + off);
      off += p.count;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setIndex(I); g.computeVertexNormals(); return g;
  }

  // 布尔：用平面裁剪，保留 nx*x+ny*y+nz*z + d <= 0 的一侧
  function clip(geo, nx, ny, nz, d) {
    const pos = geo.attributes.position, idx = geo.index;
    const verts = [], faces = []; let vi = 0;
    const EPS = 1e-8;
    const dist = p => nx * p[0] + ny * p[1] + nz * p[2] + d;
    const n = idx ? Math.floor(idx.count / 3) : Math.floor(pos.count / 3);
    for (let tIdx = 0; tIdx < n; tIdx++) {
      const i0 = idx ? idx.getX(tIdx * 3) : tIdx * 3;
      const i1 = idx ? idx.getX(tIdx * 3 + 1) : tIdx * 3 + 1;
      const i2 = idx ? idx.getX(tIdx * 3 + 2) : tIdx * 3 + 2;
      const V = [[pos.getX(i0), pos.getY(i0), pos.getZ(i0)],
                 [pos.getX(i1), pos.getY(i1), pos.getZ(i1)],
                 [pos.getX(i2), pos.getY(i2), pos.getZ(i2)]];
      // 跳过零面积（退化）三角形：避免法线为 0 污染边表
      {
        const ax = V[1][0]-V[0][0], ay = V[1][1]-V[0][1], az = V[1][2]-V[0][2];
        const bx = V[2][0]-V[0][0], by = V[2][1]-V[0][1], bz = V[2][2]-V[0][2];
        if (Math.hypot(ay*bz-az*by, az*bx-ax*bz, ax*by-ay*bx) < 1e-8) continue;
      }
      const D = V.map(dist);
      if (D.every(v => v <= EPS)) { faces.push([vi, vi + 1, vi + 2]); V.forEach(v => verts.push(v[0], v[1], v[2])); vi += 3; }
      else if (!D.some(v => v <= EPS)) { /* skip */ }
      else {
        const out = [];
        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3;
          if (D[i] <= EPS) out.push(V[i]);
          if ((D[i] <= EPS && D[j] > EPS) || (D[i] > EPS && D[j] <= EPS)) {
            const denom = D[i] - D[j];
            if (Math.abs(denom) < EPS) continue;
            const s = D[i] / denom;
            if (!isFinite(s) || isNaN(s)) continue;
            const ix = V[i][0] + (V[j][0] - V[i][0]) * s;
            const iy = V[i][1] + (V[j][1] - V[i][1]) * s;
            const iz = V[i][2] + (V[j][2] - V[i][2]) * s;
            if (isFinite(ix) && isFinite(iy) && isFinite(iz)) out.push([ix, iy, iz]);
          }
        }
        if (out.length >= 3) {
          // 过滤共线碎片（Newell 面积≈0 的多边形会产生法线为 0 的假三角形）
          let nlx = 0, nly = 0, nlz = 0;
          for (let i = 0; i < out.length; i++) {
            const a = out[i], b = out[(i + 1) % out.length];
            nlx += (a[1] - b[1]) * (a[2] + b[2]);
            nly += (a[2] - b[2]) * (a[0] + b[0]);
            nlz += (a[0] - b[0]) * (a[1] + b[1]);
          }
          if (Math.hypot(nlx, nly, nlz) > 1e-8) {
            const base = vi;
            for (let i = 1; i < out.length - 1; i++) faces.push([base, base + i, base + i + 1]);
            out.forEach(v => verts.push(...v)); vi += out.length;
          }
        }
      }
    }
    if (!verts.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(faces.flat()); g.computeVertexNormals(); return g;
  }

  // 布尔裁剪 + 补上切割面（封闭几何体，投影三视图更干净）
  function clipClosed(geo, nx, ny, nz, d) {
    const g = clip(geo, nx, ny, nz, d);
    if (!g) return null;
    const pos = g.attributes.position;
    const nrm = new THREE.Vector3(nx, ny, nz).normalize();

    // 收集切割平面上的顶点
    const raw = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (Math.abs(nx * x + ny * y + nz * z + d) < 0.01) raw.push([x, y, z]);
    }
    // 去重
    const pts = [];
    for (const p of raw) {
      let dup = false;
      for (const q of pts) if (Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 0.05) { dup = true; break; }
      if (!dup) pts.push(p);
    }
    if (pts.length < 3) return g;

    // 质心
    const c = [0, 0, 0];
    pts.forEach(p => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; });
    c[0] /= pts.length; c[1] /= pts.length; c[2] /= pts.length;

    // 平面局部基（u×v = nrm，右手系）
    let ax = new THREE.Vector3(1, 0, 0);
    if (Math.abs(nrm.dot(ax)) > 0.9) ax.set(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(ax, nrm).normalize();
    const v = new THREE.Vector3().crossVectors(nrm, u).normalize();

    // 投影 + 极角，升序排列 → 扇形三角形法线朝 +nrm（实体外侧）
    const ordered = pts.map(p => {
      const dx = p[0] - c[0], dy = p[1] - c[1], dz = p[2] - c[2];
      const pu = dx * u.x + dy * u.y + dz * u.z;
      const pv = dx * v.x + dy * v.y + dz * v.z;
      return { p, ang: Math.atan2(pv, pu) };
    });
    ordered.sort((a, b) => a.ang - b.ang);

    // 合并：原几何体 + 质心 + 边界点，扇形三角化
    const P = [], I = [];
    for (let i = 0; i < pos.count; i++) P.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    if (g.index) for (let i = 0; i < g.index.count; i++) I.push(g.index.getX(i));
    const base = P.length / 3;
    P.push(c[0], c[1], c[2]);
    ordered.forEach(o => P.push(o.p[0], o.p[1], o.p[2]));
    const m = ordered.length;
    for (let i = 0; i < m; i++) {
      I.push(base, base + 1 + i, base + 1 + ((i + 1) % m));
    }

    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g2.setIndex(I); g2.computeVertexNormals(); return g2;
  }

  // ═══════════════════════════════════════════
  // 12 道真题（按 基础 → 进阶 → 难点 三关）
  // ═══════════════════════════════════════════
  const PROBLEMS = [
    // ─────────── 第一关 · 基本体（保分题）───────────
    {
      no: 1, level: '基础', title: '阶梯块（L 形块）', shapeName: 'L 形阶梯块',
      desc: '底板 80×20×40，左上方叠一块立板 40×40×40。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([box(80, 20, 40), t(box(40, 40, 40), -20, 20, 0)]),
      approach: [
        { t: '拆成两块', c: '底板(80×20×40) + 立板(40×40×40)，立板靠左，底面与底板顶面贴合。' },
        { t: '定外框', c: '左视图只关心 宽(Z)=40 和 高(Y)=60，先画 40×60 矩形。' },
        { t: '补台阶线', c: '底板顶面高 20，是一条可见横线（台阶棱），别漏画。' }
      ],
      answer: '左视图 = 40×60 完整矩形 + 高 20 处一条可见横线（台阶棱）。',
      pitfall: '把立板宽度误当 40 之外的值；漏画台阶横线。'
    },
    {
      no: 2, level: '基础', title: '阶梯圆柱', shapeName: '阶梯圆柱',
      desc: '下部大圆柱 r=40 h=25，上部小圆柱 r=25 h=25，同轴叠加。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([cyl(40, 25), t(cyl(25, 25), 0, 25, 0)]),
      approach: [
        { t: '认回转体', c: '圆柱是回转体，主视图和左视图形状完全相同。' },
        { t: '取尺寸', c: '俯视图两个同心圆给出直径 80 和 50；主视图给出两段高各 25。' },
        { t: '画阶梯', c: '左视图 = 下 80×25 + 上 50×25 的阶梯矩形，中轴线对齐。' }
      ],
      answer: '左视图 = 与主视图相同的阶梯矩形（下宽 80 高 25，上宽 50 高 25），加轴线。',
      pitfall: '上下两段宽高搞反；忘画中心线（点画线）。'
    },
    {
      no: 3, level: '基础', title: '半圆柱体', shapeName: '半圆柱体',
      desc: '圆柱 r=30 h=70，沿轴线切去右半，只剩左半。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => halfCyl(30, 70, Math.PI),
      approach: [
        { t: '认切割', c: '圆柱竖放，用正平面 x=0 切掉右半 → 半圆柱。' },
        { t: '主视图', c: '切面正对主视方向 → 一个 30×70 矩形（平面）。' },
        { t: '俯视图', c: '半圆；左视图从 +X 方向看仍是完整 60×70 矩形。' }
      ],
      answer: '左视图 = 60×70 完整矩形（从左看半圆柱仍是满宽）。',
      pitfall: '以为左视图是半圆；实际上半圆只在俯视图出现。'
    },
    {
      no: 4, level: '基础', title: '圆台', shapeName: '圆台',
      desc: '下底 r=40，上底 r=25，高 50 的圆台。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => frustum(40, 25, 50),
      approach: [
        { t: '认回转体', c: '圆台也是回转体，主视图 = 左视图。' },
        { t: '取尺寸', c: '俯视图同心圆给上下直径 80、50；主视图给高 50。' },
        { t: '画梯形', c: '左视图 = 等腰梯形（下底 80 上底 50 高 50）+ 轴线。' }
      ],
      answer: '左视图 = 等腰梯形（底 80 顶 50 高 50），与主视图相同。',
      pitfall: '上下底宽度画反；梯形两腰要对称。'
    },

    // ─────────── 第二关 · 切割体（拿分题）───────────
    {
      no: 5, level: '进阶', title: '圆柱斜切（截交线）', shapeName: '斜切圆柱',
      desc: '圆柱 r=30 h=80，顶部被 40° 斜面（垂直于正面）从左上沿切到右下。',
      probText: '已知形体的主视图和俯视图，补画左视图（含截交线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        const a = 40 * Math.PI / 180;
        // 切割面法线在 X-Y 平面（垂直于正面）→ 主视图顶部为斜线（教材惯例）
        // 平面过左上棱 (-30,80)，斜向下到右轮廓 (30, 80-60·tan40°)
        return clipClosed(cyl(30, 80), Math.sin(a), Math.cos(a), 0,
          -(80 * Math.cos(a) - 30 * Math.sin(a)));
      },
      approach: [
        { t: '判类型', c: '截平面与轴线斜交且不过底 → 截交线是椭圆。' },
        { t: '主视图', c: '截平面垂直于正面 → 主视图顶部是一条斜线（左高右低）；俯视图仍是完整圆。' },
        { t: '左视图', c: '截交线在左视图上画成椭圆弧，最高点偏左、最低点在右轮廓上，光滑连接。' }
      ],
      answer: '左视图 = 矩形 + 顶部椭圆弧（截交线），最高点偏左、最低点在右轮廓。',
      pitfall: '把截交线画成直线；椭圆弧不光滑（出现折角）。'
    },
    {
      no: 6, level: '进阶', title: '方块斜切一角', shapeName: '斜切角方块',
      desc: '方块 60×50×40，右上角被 45° 斜面（平行于 Z 轴）切掉。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => clipClosed(box(60, 50, 40), 1, 1, 0, -45),
      approach: [
        { t: '判切割', c: '截平面 ∥Z 轴（垂直于正面）→ 主视图直接看到斜线。' },
        { t: '主视图', c: '矩形缺右上角 → 五边形，斜边是截交线投影。' },
        { t: '左视图', c: '从 +X 看，缺口在前后方向是完整的 40 深 → 仍是矩形加一条斜线。' }
      ],
      answer: '左视图 = 40×50 矩形 + 顶部一条斜线（截平面在左视图的投影）。',
      pitfall: '把缺角画到左视图宽度方向；缺角只影响主视图的右上角。'
    },
    {
      no: 7, level: '进阶', title: '圆锥斜截', shapeName: '斜截圆锥',
      desc: '圆锥 r=40 h=60，顶部被 45° 斜面（垂直于正面）截切，主视图顶部呈斜线。',
      probText: '已知形体的主视图和俯视图，补画左视图（含截交线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        const a = 45 * Math.PI / 180;
        // 切割面法线在 X-Y 平面（垂直于正面）→ 主视图顶部为斜线（教材惯例）
        // 平面 x+y=45：从左轮廓 (-6.7,51) 斜切到右轮廓 (35,7.5)
        return clipClosed(cone(40, 60), Math.sin(a), Math.cos(a), 0, -(45 * Math.cos(a)));
      },
      approach: [
        { t: '判类型', c: '圆锥被不过锥顶、斜交轴线的平面切 → 截交线是椭圆。' },
        { t: '找特殊点', c: '最高/最低点在主视图轮廓（斜线两端）上；最前/最后点在左视图轮廓上。' },
        { t: '连线', c: '特殊点 + 一般点光滑连成椭圆，判断可见性（前实后虚）。' }
      ],
      answer: '左视图 = 三角形被截 + 椭圆弧截交线（前实后虚）。',
      pitfall: '圆锥母线画成直线通到底；截交线漏画圆心或画成抛物线。'
    },

    // ─────────── 第三关 · 组合体（冲分题）───────────
    {
      no: 8, level: '进阶', title: '带凸台的方块', shapeName: '凸台方块',
      desc: '方块 60×30×50，顶面中央加圆柱凸台 r=15 h=20。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([box(60, 30, 50), t(cyl(15, 20), 0, 30, 0)]),
      approach: [
        { t: '拆两块', c: '方块(60×30×50) + 凸台圆柱(r=15 h=20)，凸台居中放顶面。' },
        { t: '俯视图', c: '外框矩形 60×50，内部一个 ⌀30 圆（凸台顶面）。' },
        { t: '左视图', c: '50×30 矩形 + 顶部居中 30×20 凸台矩形，凸台底边与顶面重合不重复画。' }
      ],
      answer: '左视图 = 50×30 矩形 + 顶部居中 30×20 凸台矩形。',
      pitfall: '凸台圆在左视图也画成圆；漏画凸台轮廓线。'
    },
    {
      no: 9, level: '进阶', title: 'T 形块', shapeName: 'T 形块',
      desc: '底板 80×20×40，上方居中竖板 30×40×40。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([box(80, 20, 40), t(box(30, 40, 40), 0, 20, 0)]),
      approach: [
        { t: '拆两块', c: '底板(80×20×40) + 竖板(30×40×40)，竖板居中，同深 40。' },
        { t: '主视图', c: 'T 形：下 80×20 横条 + 上 30×40 竖条。' },
        { t: '左视图', c: '底板和竖板同深 40 → 左视图是 40×60 矩形 + 高 20 处横线。' }
      ],
      answer: '左视图 = 40×60 矩形 + 高 20 处一条可见横线。',
      pitfall: '误画成 T 形；竖板深度与底板相同，左视图轮廓是完整矩形。'
    },
    {
      no: 10, level: '难点', title: '底板 + 半圆拱（隧道）', shapeName: '半圆拱隧道体',
      desc: '底板 80×30×40，上方扣一个半径 20、长 80 的半圆柱拱。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        const halfArch = clip(cylH(20, 80), 0, -1, 0, 0);
        return merge([box(80, 30, 40), t(halfArch, 0, 30, 0)]);
      },
      approach: [
        { t: '拆两块', c: '底板(80×30×40) + 半圆柱拱(r=20 长 80，轴沿 X)。' },
        { t: '主视图', c: '下 80×30 矩形 + 上半径 20 半圆 → 拱形。' },
        { t: '左视图', c: '40×30 矩形 + 上半圆(⌀40) → 与主视图同形（沿 X 方向等宽）。' }
      ],
      answer: '左视图 = 40×30 矩形 + 上半圆拱（⌀40），与主视图轮廓一致。',
      pitfall: '俯视图把拱画成半圆；拱沿 X 方向等宽，俯视图是 80×40 矩形。'
    },
    {
      no: 11, level: '难点', title: '两等径圆柱正交（相贯线）', shapeName: '等径正交圆柱',
      desc: '竖直圆柱 r=30 h=70 与水平圆柱 r=30 长 60 轴线正交。',
      probText: '已知形体的主视图和俯视图，补画左视图（含相贯线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        const horiz = t(cylH(30, 60), 0, 35, 0);
        return merge([cyl(30, 70), horiz]);
      },
      approach: [
        { t: '判类型', c: '两圆柱正交且等径 → 相贯线是两条椭圆，属特殊情况。' },
        { t: '主视图', c: '等径时相贯线退化为两条交叉直线（X 形）。' },
        { t: '左视图', c: '相贯线为曲线，上半段实线、下半段虚线。' }
      ],
      answer: '左视图 = 大矩形 + 相贯线曲线（上半实、下半虚）。主视图为 X 形交叉直线。',
      pitfall: '等径相贯是高频考点，主视图要画成交叉直线而不是圆弧。'
    },
    {
      no: 12, level: '难点', title: '大小圆柱正交（相贯线）', shapeName: '异径正交圆柱',
      desc: '竖直大圆柱 r=35 h=70 被水平小圆柱 r=20 长 60 穿透。',
      probText: '已知形体的主视图和俯视图，补画左视图（含相贯线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        const horiz = t(cylH(20, 60), 0, 35, 0);
        return merge([cyl(35, 70), horiz]);
      },
      approach: [
        { t: '判积聚性', c: '大圆柱在俯视图投影为圆（有积聚性），小圆柱在主视图为圆。' },
        { t: '找特殊点', c: '俯视图里大圆与小圆柱矩形边的交点 = 相贯线上的特殊点。' },
        { t: '连线', c: '小细于大 → 相贯线是双曲线，向小圆柱方向弯，前实后虚。' }
      ],
      answer: '左视图 = 矩形 + 双曲线相贯线（前实后虚），曲线向小圆柱侧弯曲。',
      pitfall: '相贯线画成直线或方向弯反；虚实线搞混。'
    },
    {
      no: 13, level: '难点', title: '圆柱与四棱柱正交（相贯线）', shapeName: '棱柱穿圆柱',
      desc: '水平圆柱 r=15 长 90（轴线高 40），被 24×60×26 的四棱柱竖直穿过。',
      probText: '已知形体的主视图和俯视图，补画左视图（含相贯线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([t(cylH(15, 90), 0, 40, 0), box(24, 60, 26)]),
      approach: [
        { t: '判类型', c: '平面体与曲面体相交 → 相贯线由几段线（素线段）拼成，不是一条光滑曲线。' },
        { t: '找交线', c: '棱柱左、右侧面截圆柱得上下两条水平素线段（高 40±9）；前、后侧面截得另两条。' },
        { t: '连段', c: '利用俯视图积聚性定交点，主视图连出水平线段，按"宽相等"搬到左视图。' }
      ],
      answer: '左视图 = 26×60 矩形 + 圆柱轮廓 + 相贯线（直线段拼接，前实后虚）。',
      pitfall: '平面体相贯线是几段线的组合，别画成光滑弧；各段端点必须落在棱上。'
    },
    {
      no: 14, level: '难点', title: '圆柱与圆锥正交（相贯线）', shapeName: '圆柱穿圆锥',
      desc: '圆锥 r=35 h=65，被水平圆柱 r=16 长 90 在高 38 处正交穿过。',
      probText: '已知形体的主视图和俯视图，补画左视图（含相贯线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([cone(35, 65), t(cylH(16, 90), 0, 38, 0)]),
      approach: [
        { t: '判类型', c: '圆柱与圆锥轴线正交 → 相贯线是空间曲线，弯向锥顶一侧。' },
        { t: '用积聚性', c: '圆柱在主视图积聚为矩形，相贯线的正面投影已知，再求侧面投影。' },
        { t: '特殊点', c: '最高/最低点在锥的主视图轮廓上，最前/最后点定左视图弯曲方向，纬圆法取一般点后光滑连线。' }
      ],
      answer: '左视图 = 三角形轮廓 + 圆柱端面圆 + 相贯线曲线（弯向锥顶，前实后虚）。',
      pitfall: '相贯线弯曲方向画反（应向锥顶弯）；最低点不取在圆柱轴线高度上。'
    },
    {
      no: 15, level: '难点', title: '两圆柱偏交（相贯线）', shapeName: '偏交圆柱',
      desc: '竖直圆柱 r=30 h=70，水平圆柱 r=20 长 70 在高 48 处穿过，俯视图上两轴线错开 15。',
      probText: '已知形体的主视图和俯视图，补画左视图（含相贯线）。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => merge([cyl(30, 70), t(cylH(20, 70), 0, 48, 15)]),
      approach: [
        { t: '认偏交', c: '两轴线不相交（俯视图上错开）→ 相贯线上下不对称，这正是与正交的区别。' },
        { t: '找特殊点', c: '最左/最右点在水平圆柱轮廓上；最高点偏向轴线错开的一侧，逐点标坐标。' },
        { t: '连线', c: '相贯线向大圆柱方向弯，前实后虚；上下不对称，别画成对称弧。' }
      ],
      answer: '左视图 = 矩形 + 不对称相贯线（偏移侧弯得多），前实后虚。',
      pitfall: '把偏交画成正交的对称相贯线；偏移方向在俯视图上量错。'
    },
    {
      no: 16, level: '进阶', title: '双坡屋顶（屋檐）', shapeName: '双坡屋檐体',
      desc: '屋檐底面 70×90，屋脊沿 90 长向居中，脊高 40，两坡对称降到檐口。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        let g = clipClosed(box(70, 40, 90), 40, 35, 0, -1400);
        return clipClosed(g, -40, 35, 0, -1400);
      },
      approach: [
        { t: '认屋檐', c: '双坡屋顶 = 三棱柱。山墙（三角形端面）正对主视 → 主视图是三角形。' },
        { t: '对尺寸', c: '山墙三角底 70、脊高 40；俯视图 = 70×90 矩形，屋脊是居中纵向直线。' },
        { t: '补左视', c: '从左看是坡面侧 → 90×40 矩形，屋脊线正好是上边（可见），无内部线。' }
      ],
      answer: '左视图 = 90×40 矩形（坡面侧投影），屋脊线为上边。',
      pitfall: '左视图画成三角形；三角形只出现在主视图（山墙朝正面）。'
    },
    {
      no: 17, level: '难点', title: '带天窗的双坡屋顶', shapeName: '天窗屋檐体',
      desc: '双坡屋顶 70×40×90，坡面上竖直立一个 18×26×24 的天窗，穿出坡面。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        let g = clipClosed(box(70, 40, 90), 40, 35, 0, -1400);
        g = clipClosed(g, -40, 35, 0, -1400);
        return merge([g, t(box(18, 26, 24), 17, 8, 0)]);
      },
      approach: [
        { t: '拆两块', c: '双坡屋顶 + 竖直天窗（18×26×24），天窗底部埋进坡面再穿出。' },
        { t: '主视图', c: '三角形 + 天窗矩形从坡面伸出；天窗与坡面的交线位置由坡度定。' },
        { t: '左视图', c: '坡面矩形 + 天窗矩形（宽 24 居中）；天窗伸进屋顶内部的轮廓画虚线。' }
      ],
      answer: '左视图 = 90×40 矩形 + 居中 24 宽天窗矩形，埋在坡面以下的部分画虚线。',
      pitfall: '天窗与坡面的交线漏画；天窗伸进屋顶内的轮廓忘画虚线。'
    },
    {
      no: 18, level: '难点', title: '四坡屋顶（庑殿顶）', shapeName: '庑殿顶屋檐体',
      desc: '双坡屋顶上把屋脊缩短到 50，两端各加一个斜三角坡面，成四坡庑殿顶。',
      probText: '已知形体的主视图和俯视图，补画左视图。',
      missingView: 'left', givenViews: ['front', 'top'],
      build: () => {
        let g = clipClosed(box(70, 40, 90), 40, 35, 0, -1400);
        g = clipClosed(g, -40, 35, 0, -1400);
        g = clipClosed(g, 0, 1, 2, -90);
        return clipClosed(g, 0, 1, -2, -90);
      },
      approach: [
        { t: '认庑殿', c: '四坡顶 = 双坡 + 两端斜三角坡面；脊缩短，俯视图出现 4 条斜脊线。' },
        { t: '主视图', c: '仍是三角形（端坡投影与主坡斜边重合），特征集中在俯视图的斜脊上。' },
        { t: '左视图', c: '90×40 矩形左右上角被端坡切掉 → 从 (宽 25, 高 40) 斜到 (宽 45, 高 0)。' }
      ],
      answer: '左视图 = 90 宽矩形，左右上角各切一个斜角（端坡投影），中间保留短脊线。',
      pitfall: '左视图忘切角；端坡斜脊线在俯视图上漏画（从脊端连到四角）。'
    }
  ];

  // ═══════════════════════════════════════════
  // 状态
  // ═══════════════════════════════════════════
  let currentIdx = 0;
  let showAnswer = false;
  let currentGeo = null;

  // 3D 查看器
  let scene, camera, renderer, mesh, wire, grid;
  let orbit = { theta: Math.PI / 4, phi: Math.PI / 5, radius: 160, dragging: false, lx: 0, ly: 0 };

  // ───────────────────────────────────────
  // 初始化
  // ───────────────────────────────────────
  function init() {
    renderCheatSheet();
    renderList();
    init3D();
    bindEvents();
    setupDivider();
    // 触摸设备：换提示文案
    if ('ontouchstart' in window) {
      const hint = document.querySelector('.crash-3d-hint');
      if (hint) hint.textContent = '👋 单指旋转 3D 模型';
    }
    select(0);
  }

  // 考前速记条
  function renderCheatSheet() {
    const el = document.getElementById('crash-cheat');
    if (!el) return;
    el.innerHTML = `
      <div class="cheat-title">⚡ 考前 3 分钟速记</div>
      <div class="cheat-line"><b>一句口诀：</b>长对正 · 高平齐 · 宽相等</div>
      <div class="cheat-line"><b>三视图=谁看谁：</b>主=从前往后（长×高）｜俯=从上往下（长×宽）｜左=从左往右（宽×高）</div>
      <div class="cheat-line"><b>线型：</b>看得见=粗实线，被挡住=细虚线，轴/中心=点画线</div>
      <div class="cheat-line"><b>形体速查：</b>圆柱→主左矩形+俯圆｜圆锥→三角形+圆｜圆台→梯形+同心圆｜球→三个圆</div>
      <div class="cheat-line"><b>补视图套路：</b>①认形体 ②从已知视图量尺寸 ③按"长对正高平齐宽相等"对齐 ④补虚线</div>
    `;
  }

  // 题目列表
  function renderList() {
    const el = document.getElementById('crash-list');
    if (!el) return;
    const levels = ['基础', '进阶', '难点'];
    const levelLabel = { '基础': '第一关 · 基本体（保分）', '进阶': '第二关 · 切割/组合（拿分）', '难点': '第三关 · 相贯线 & 屋檐（冲分）' };
    let html = '';
    levels.forEach(lv => {
      html += `<div class="crash-level">${levelLabel[lv]}</div>`;
      PROBLEMS.forEach((p, i) => {
        if (p.level !== lv) return;
        html += `
          <div class="crash-item ${i === currentIdx ? 'active' : ''}" data-idx="${i}">
            <span class="c-num">${p.no}</span>
            <span class="c-txt">${p.title}</span>
            <span class="c-tag lv-${p.level}">${p.level}</span>
          </div>`;
      });
    });
    el.innerHTML = html;
  }

  // ───────────────────────────────────────
  // 选择题目
  // ───────────────────────────────────────
  function select(idx) {
    currentIdx = idx;
    showAnswer = false;
    const p = PROBLEMS[idx];
    if (!p) return;

    // 列表高亮（按 dataset.idx 对齐——DOM 按关卡分组渲染，顺序≠数组顺序）
    document.querySelectorAll('.crash-item').forEach(it => {
      it.classList.toggle('active', parseInt(it.dataset.idx) === idx);
    });

    // 标题 + 描述
    document.getElementById('crash-title').innerHTML = `${p.no}. ${p.title}`;
    document.getElementById('crash-shape').textContent = `${p.shapeName}：${p.desc}`;
    document.getElementById('crash-prob').innerHTML = `<b>${p.probText}</b>`;

    // 思路
    const app = document.getElementById('crash-approach');
    app.innerHTML = p.approach.map((s, i) => `
      <div class="crash-step">
        <span class="cs-n">${i + 1}</span>
        <div><b>${s.t}</b><div class="cs-c">${s.c}</div></div>
      </div>`).join('');

    // 答案要点 + 易错
    document.getElementById('crash-answer').innerHTML = `
      <div class="ans-line"><b>答案：</b>${p.answer}</div>
      <div class="pit-line">⚠️ <b>易错：</b>${p.pitfall}</div>`;

    // 答案按钮状态
    const ab = document.getElementById('crash-toggle-answer');
    if (ab) ab.textContent = '👁 查看答案';

    // 构造几何体
    currentGeo = p.build();

    // 3D
    load3D(currentGeo);

    // 题目视图
    renderViews();
  }

  // ───────────────────────────────────────
  // 三视图渲染（题目 / 答案）— 专用横向布局
  // 不用 Engine.renderExercisePaper 的 2×2 网格（宽扁区域会被裁切），
  // 改为「主视图 | 左视图 | 俯视图」横向三列，每个视图自动适配格子。
  // ───────────────────────────────────────

  // 边提取：与 engine.js 当前版本逻辑一致（dot>0 + 二面角过滤）
  function extractEdges(geometry, viewDir, dropAxis) {
    const pos = geometry.attributes.position, idx = geometry.index;
    const vd = new THREE.Vector3(viewDir.x, viewDir.y, viewDir.z).normalize();
    const triCount = idx ? Math.floor(idx.count / 3) : Math.floor(pos.count / 3);
    const project = (v) => {
      if (dropAxis === 'z') return { x: v[0], y: v[1] };
      if (dropAxis === 'y') return { x: v[0], y: v[2] };
      return { x: v[2], y: v[1] };
    };
    const faces = [];
    for (let t = 0; t < triCount; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3;
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      const v = [[pos.getX(i0), pos.getY(i0), pos.getZ(i0)],
                 [pos.getX(i1), pos.getY(i1), pos.getZ(i1)],
                 [pos.getX(i2), pos.getY(i2), pos.getZ(i2)]];
      const e1 = [v[1][0]-v[0][0], v[1][1]-v[0][1], v[1][2]-v[0][2]];
      const e2 = [v[2][0]-v[0][0], v[2][1]-v[0][1], v[2][2]-v[0][2]];
      const nx = e1[1]*e2[2]-e1[2]*e2[1], ny = e1[2]*e2[0]-e1[0]*e2[2], nz = e1[0]*e2[1]-e1[1]*e2[0];
      const len = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
      const nn = [nx/len, ny/len, nz/len];
      const dot = nn[0]*vd.x + nn[1]*vd.y + nn[2]*vd.z;
      faces.push({ v, visible: dot > 0, normal: nn });
    }
    const edgeMap = {};
    for (let t = 0; t < triCount; t++) {
      const f = faces[t];
      for (const [a, b] of [[0,1],[1,2],[2,0]]) {
        const va = f.v[a], vb = f.v[b];
        const k1 = `${va[0].toFixed(2)},${va[1].toFixed(2)},${va[2].toFixed(2)}|${vb[0].toFixed(2)},${vb[1].toFixed(2)},${vb[2].toFixed(2)}`;
        const k2 = `${vb[0].toFixed(2)},${vb[1].toFixed(2)},${vb[2].toFixed(2)}|${va[0].toFixed(2)},${va[1].toFixed(2)},${va[2].toFixed(2)}`;
        const mk = k1 < k2 ? k1 : k2;
        if (!edgeMap[mk]) edgeMap[mk] = [];
        edgeMap[mk].push({ face: t, a, b });
      }
    }
    const DIHEDRAL_COS = Math.cos(20 * Math.PI / 180);
    const visible = [], hidden = [], seen = new Set();
    for (const [key, entries] of Object.entries(edgeMap)) {
      if (entries.length > 2) continue;
      const faceData = entries.map(e => faces[e.face]);
      const visCount = faceData.filter(f => f.visible).length;
      let isRealEdge = true;
      if (entries.length === 2) {
        const [f1, f2] = faceData;
        if (f1.visible === f2.visible) {
          const nd = f1.normal[0]*f2.normal[0] + f1.normal[1]*f2.normal[1] + f1.normal[2]*f2.normal[2];
          if (nd > DIHEDRAL_COS) isRealEdge = false;
        }
      }
      if (!isRealEdge) continue;
      const f = faceData[0], e = entries[0];
      const pa = project(f.v[e.a]), pb = project(f.v[e.b]);
      if (Math.abs(pa.x - pb.x) < 0.005 && Math.abs(pa.y - pb.y) < 0.005) continue;
      if (visCount > 0) { if (!seen.has(key)) { seen.add(key); visible.push({ a: pa, b: pb }); } }
      else { if (!seen.has(key)) { seen.add(key); hidden.push({ a: pa, b: pb }); } }
    }
    return { visible, hidden };
  }

  const VIEW_DEFS = [
    { key: 'front', name: '主视图', dir: [0, 0, 1], drop: 'z' },
    { key: 'left',  name: '左视图', dir: [-1, 0, 0], drop: 'x' },
    { key: 'top',   name: '俯视图', dir: [0, 1, 0], drop: 'y' }
  ];

  function renderViews() {
    const canvas = document.getElementById('crash-views-canvas');
    const p = PROBLEMS[currentIdx];
    if (!canvas || !p || !currentGeo) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    drawViewsRow(ctx, rect.width, rect.height, currentGeo, p, showAnswer);
  }

  function drawViewsRow(ctx, cw, ch, geometry, p, answerMode) {
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, cw, ch);

    const gap = 12;
    const labelH = 22;
    const cellW = (cw - gap * 4) / 3;
    const cellH = ch - gap * 2 - labelH;

    VIEW_DEFS.forEach((c, i) => {
      const cx = gap + gap * i + cellW * (i + 0.5);
      const cy = gap + cellH / 2;
      const isMissing = p.missingView === c.key;
      const isGiven = p.givenViews.includes(c.key);

      // 题目模式下缺的视图 → 占位框
      if (isMissing && !answerMode) {
        ctx.strokeStyle = '#1a5fb4';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(cx - cellW / 2 + 8, cy - cellH / 2 + 8, cellW - 16, cellH - 16);
        ctx.setLineDash([]);
        ctx.fillStyle = '#1a5fb4';
        ctx.font = 'bold 13px Microsoft YaHei, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✏️ 请补画${c.name}`, cx, cy - 6);
        ctx.fillStyle = '#999999';
        ctx.font = '11px Microsoft YaHei, sans-serif';
        ctx.fillText('（对照左侧 3D 和已知视图）', cx, cy + 14);
        ctx.fillStyle = '#666666';
        ctx.font = 'bold 12px Microsoft YaHei, sans-serif';
        ctx.fillText(`${c.name}（待补）`, cx, ch - 6);
        return;
      }

      const edges = extractEdges(geometry, new THREE.Vector3(c.dir[0], c.dir[1], c.dir[2]), c.drop);
      const all = [...edges.visible, ...edges.hidden];

      if (all.length) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        all.forEach(e => {
          minX = Math.min(minX, e.a.x, e.b.x); minY = Math.min(minY, e.a.y, e.b.y);
          maxX = Math.max(maxX, e.a.x, e.b.x); maxY = Math.max(maxY, e.a.y, e.b.y);
        });
        const shapeW = (maxX - minX) || 1;
        const shapeH = (maxY - minY) || 1;
        const scale = Math.min((cellW - 24) / shapeW, (cellH - 24) / shapeH);
        const offX = -(minX + maxX) / 2;
        const offY = -(minY + maxY) / 2;
        const px = v => cx + (v.x + offX) * scale;
        const py = v => cy - (v.y + offY) * scale;

        // 虚线（不可见轮廓）
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 4]);
        edges.hidden.forEach(e => {
          ctx.beginPath();
          ctx.moveTo(px(e.a), py(e.a));
          ctx.lineTo(px(e.b), py(e.b));
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // 实线（可见轮廓）
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1.8;
        edges.visible.forEach(e => {
          ctx.beginPath();
          ctx.moveTo(px(e.a), py(e.a));
          ctx.lineTo(px(e.b), py(e.b));
          ctx.stroke();
        });
      }

      // 标签
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 12.5px Microsoft YaHei, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.name + (isMissing && answerMode ? ' ✅' : ''), cx, ch - 6);
    });
  }

  function toggleAnswer() {
    showAnswer = !showAnswer;
    const ab = document.getElementById('crash-toggle-answer');
    if (ab) ab.textContent = showAnswer ? '🙈 收起答案' : '👁 查看答案';
    renderViews();
  }

  // ───────────────────────────────────────
  // 3D 查看器（自建，独立于 Engine 主场景）
  // ───────────────────────────────────────
  function init3D() {
    const canvas = document.getElementById('crash-canvas');
    if (!canvas) return;
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 300;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f0e8);
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(60, 90, 70);
    scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x88aaff, 0.35);
    dl2.position.set(-50, 30, -60);
    scene.add(dl2);

    grid = new THREE.GridHelper(160, 16, 0xd9d4ca, 0xe9e5dc);
    grid.position.y = -60;
    scene.add(grid);

    const axes = new THREE.AxesHelper(40);
    axes.position.y = -58;
    scene.add(axes);

    setupOrbit(canvas);
    updateCamera();
    animate();

    new ResizeObserver(() => {
      // 推迟到下一帧，避免 ResizeObserver loop 警告
      requestAnimationFrame(() => {
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (cw > 0 && ch > 0) {
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
          renderer.setSize(cw, ch);
        }
      });
    }).observe(canvas);
  }

  function setupOrbit(canvas) {
    canvas.addEventListener('mousedown', e => { orbit.dragging = true; orbit.lx = e.clientX; orbit.ly = e.clientY; });
    canvas.addEventListener('mousemove', e => {
      if (!orbit.dragging) return;
      orbit.theta -= (e.clientX - orbit.lx) * 0.008;
      orbit.phi = Math.max(0.08, Math.min(Math.PI - 0.08, orbit.phi + (e.clientY - orbit.ly) * 0.008));
      orbit.lx = e.clientX; orbit.ly = e.clientY;
      updateCamera();
    });
    canvas.addEventListener('mouseup', () => orbit.dragging = false);
    canvas.addEventListener('mouseleave', () => orbit.dragging = false);
    // 触摸：单指旋转（手机端）
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { orbit.dragging = true; orbit.lx = e.touches[0].clientX; orbit.ly = e.touches[0].clientY; }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!orbit.dragging || e.touches.length !== 1) return;
      e.preventDefault();
      const t0 = e.touches[0];
      orbit.theta -= (t0.clientX - orbit.lx) * 0.008;
      orbit.phi = Math.max(0.08, Math.min(Math.PI - 0.08, orbit.phi + (t0.clientY - orbit.ly) * 0.008));
      orbit.lx = t0.clientX; orbit.ly = t0.clientY;
      updateCamera();
    }, { passive: false });
    canvas.addEventListener('touchend', () => orbit.dragging = false);
    canvas.addEventListener('touchcancel', () => orbit.dragging = false);
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      orbit.radius = Math.max(70, Math.min(420, orbit.radius + e.deltaY * 0.2));
      updateCamera();
    }, { passive: false });
  }

  function updateCamera() {
    camera.position.set(
      orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta),
      orbit.radius * Math.cos(orbit.phi),
      orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  let lastCW = 0, lastCH = 0;

  function animate() {
    requestAnimationFrame(animate);
    // 兜底：画布尺寸变化时同步 aspect 与 renderer（防止隐藏标签页下尺寸过期导致模型偏移）
    if (renderer && camera) {
      const c = renderer.domElement;
      const cw = c.clientWidth, ch = c.clientHeight;
      if (cw > 0 && ch > 0 && (cw !== lastCW || ch !== lastCH)) {
        lastCW = cw; lastCH = ch;
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      }
    }
    if (renderer) renderer.render(scene, camera);
  }

  function load3D(geo) {
    if (!scene) return;
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh = null; }
    if (wire) { scene.remove(wire); wire.geometry.dispose(); wire = null; }

    // 先同步一次画布尺寸，保证 aspect 正确
    const c3d = document.getElementById('crash-canvas');
    if (renderer && c3d) {
      const cw = c3d.clientWidth, ch = c3d.clientHeight;
      if (cw > 0 && ch > 0) {
        lastCW = cw; lastCH = ch;
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      }
    }

    const g = geo.clone();
    g.computeVertexNormals();
    g.computeBoundingBox();
    const box3 = g.boundingBox;
    const size = new THREE.Vector3();
    box3.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // 按 fov + 画布宽高比精确取距：竖直/水平两个方向都装得下才居中
    const fov = camera ? camera.fov * Math.PI / 180 : Math.PI / 4;
    const tanH = Math.tan(fov / 2);
    const aspect = camera ? Math.max(camera.aspect || 1, 0.1) : 1;
    const half = maxDim / 2;
    const dist = Math.max(half / tanH, half / (tanH * aspect));
    orbit.radius = Math.min(420, Math.max(100, dist * 1.25));
    const center = new THREE.Vector3();
    box3.getCenter(center);
    g.translate(-center.x, -center.y, -center.z);
    updateCamera();

    const mat = new THREE.MeshPhongMaterial({ color: 0x3a7bc0, specular: 0x222222, shininess: 30, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    mesh = new THREE.Mesh(g, mat);
    scene.add(mesh);
    const edges = new THREE.EdgesGeometry(g, 15);
    wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a2733 }));
    scene.add(wire);
  }

  function setView(preset) {
    if (!camera) return;
    switch (preset) {
      // 与 engine.js 三视图投影方向对齐：
      // 主视图 viewDir=(0,0,1) → 相机在 +Z
      // 俯视图 viewDir=(0,1,0) → 相机在 +Y
      // 左视图 viewDir=(-1,0,0) → 相机在 -X
      case 'front': orbit.theta = Math.PI / 2; orbit.phi = Math.PI / 2; break;
      case 'top': orbit.phi = 0.05; break;
      case 'left': orbit.theta = Math.PI; orbit.phi = Math.PI / 2; break;
      case 'iso': orbit.theta = Math.PI / 4; orbit.phi = Math.PI / 5; break;
    }
    updateCamera();
  }

  // ───────────────────────────────────────
  // 事件绑定
  // ───────────────────────────────────────
  function bindEvents() {
    document.getElementById('crash-list')?.addEventListener('click', e => {
      const item = e.target.closest('.crash-item');
      if (item) select(parseInt(item.dataset.idx));
    });
    document.getElementById('crash-prev')?.addEventListener('click', () => select((currentIdx - 1 + PROBLEMS.length) % PROBLEMS.length));
    document.getElementById('crash-next')?.addEventListener('click', () => select((currentIdx + 1) % PROBLEMS.length));
    document.getElementById('crash-toggle-answer')?.addEventListener('click', toggleAnswer);
    document.getElementById('crash-reset-view')?.addEventListener('click', () => setView('iso'));
    document.querySelectorAll('.crash-view-btn').forEach(btn => {
      btn.addEventListener('click', () => setView(btn.dataset.v));
    });

    // 视图画布尺寸变化时重绘（下一帧执行，避免 ResizeObserver loop 警告）
    const vc = document.getElementById('crash-views-canvas');
    if (vc) new ResizeObserver(() => requestAnimationFrame(renderViews)).observe(vc);

    // 快捷键：空格显示答案，←→ 切题
    document.addEventListener('keydown', e => {
      const sec = document.getElementById('sec-crash');
      if (!sec || !sec.classList.contains('active')) return;
      if (e.key === 'ArrowRight') select((currentIdx + 1) % PROBLEMS.length);
      else if (e.key === 'ArrowLeft') select((currentIdx - 1 + PROBLEMS.length) % PROBLEMS.length);
      else if (e.key === ' ' || e.key === 'a' || e.key === 'A') { e.preventDefault(); toggleAnswer(); }
    });
  }

  // ───────────────────────────────────────
  // 供 App 调用：切到本页时重绘（尺寸恢复）
  // ───────────────────────────────────────
  function resize3D() {
    if (!renderer) return;
    const c = document.getElementById('crash-canvas');
    if (c) {
      const w = c.clientWidth, h = c.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }
  }

  function onShow() {
    resize3D();
    requestAnimationFrame(renderViews);
  }

  // 可拖动分隔条：上下拉动调整 3D / 三视图 高度比例
  function setupDivider() {
    const center = document.querySelector('.crash-center');
    const box3d = document.getElementById('crash-3d');
    const divider = document.getElementById('crash-divider');
    if (!center || !box3d || !divider) return;

    let dragging = false;
    let raf = null;

    divider.addEventListener('mousedown', e => {
      dragging = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'row-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const rect = center.getBoundingClientRect();
      if (rect.height < 10) return;
      let pct = ((e.clientY - rect.top - 4) / rect.height) * 100;
      pct = Math.max(15, Math.min(85, pct));
      box3d.style.height = pct + '%';
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = null; resize3D(); renderViews(); });
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      resize3D();
      renderViews();
    });
  }

  const api = { init, onShow, getCount: () => PROBLEMS.length, _drawRow: drawViewsRow, _PROBLEMS: PROBLEMS };
  // 挂到 window：app.js 用 window.Crash 检测，const 声明不会自动挂 window
  if (typeof window !== 'undefined') window.Crash = api;
  return api;
})();
