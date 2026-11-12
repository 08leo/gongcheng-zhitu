// ═══════════════════════════════════════════
// shapes.js — 35+ 种工程制图标准形体
// 涵盖：基本体、切割体、相贯体、组合体、
//       带肋板、凸台、凹腔、圆角过渡等
// ═══════════════════════════════════════════

const Shapes = (() => {

  // ── 工具函数 ──
  function cyl(r, h, segs = 32) { return new THREE.CylinderGeometry(r, r, h, segs); }
  function cone(r, h, segs = 32) { return new THREE.ConeGeometry(r, h, segs); }
  function sph(r, segs = 24) { return new THREE.SphereGeometry(r, segs, segs); }
  function prism(n, sz, h) {
    const s = new THREE.Shape();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? s.moveTo(Math.cos(a) * sz, Math.sin(a) * sz)
              : s.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, h / 2, 0);
    return g;
  }
  function box(w, h, d) { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; }
  function frustum(rBot, rTop, h, segs = 32) { return new THREE.CylinderGeometry(rTop, rBot, h, segs); }

  // ── 裁剪 ──
  function clip(geo, nx, ny, nz, d) {
    const pos = geo.attributes.position, idx = geo.index;
    const verts = [], faces = []; let vi = 0;
    const EPS = 1e-8;
    const dist = p => nx * p[0] + ny * p[1] + nz * p[2] + d;
    const n = idx ? Math.floor(idx.count / 3) : Math.floor(pos.count / 3);
    for (let t = 0; t < n; t++) {
      const i0 = idx ? idx.getX(t*3) : t*3;
      const i1 = idx ? idx.getX(t*3+1) : t*3+1;
      const i2 = idx ? idx.getX(t*3+2) : t*3+2;
      const V = [[pos.getX(i0),pos.getY(i0),pos.getZ(i0)],
                 [pos.getX(i1),pos.getY(i1),pos.getZ(i1)],
                 [pos.getX(i2),pos.getY(i2),pos.getZ(i2)]];
      const D = V.map(dist);
      if (D.every(v => v <= EPS)) { faces.push([vi,vi+1,vi+2]); V.forEach(v => verts.push(v[0],v[1],v[2])); vi += 3; }
      else if (!D.some(v => v <= EPS)) { /* skip */ }
      else {
        const out = [];
        for (let i = 0; i < 3; i++) {
          const j = (i+1) % 3;
          if (D[i] <= EPS) out.push(V[i]);
          if ((D[i] <= EPS && D[j] > EPS) || (D[i] > EPS && D[j] <= EPS)) {
            const denom = D[i] - D[j];
            if (Math.abs(denom) < EPS) continue;
            const s = D[i] / denom;
            if (!isFinite(s) || isNaN(s)) continue;
            const ix = V[i][0]+(V[j][0]-V[i][0])*s;
            const iy = V[i][1]+(V[j][1]-V[i][1])*s;
            const iz = V[i][2]+(V[j][2]-V[i][2])*s;
            if (!isNaN(ix) && !isNaN(iy) && !isNaN(iz) && isFinite(ix) && isFinite(iy) && isFinite(iz)) {
              out.push([ix, iy, iz]);
            }
          }
        }
        if (out.length >= 3) {
          const base = vi;
          for (let i = 1; i < out.length-1; i++) faces.push([base,base+i,base+i+1]);
          out.forEach(v => verts.push(...v)); vi += out.length;
        }
      }
    }
    if (!verts.length) return null;
    // 过滤无效顶点并重新映射面索引
    const vcount = Math.floor(verts.length / 3);
    const indexMap = new Array(vcount).fill(-1);
    const clean = [];
    let newIdx = 0;
    for (let i = 0; i < vcount; i++) {
      const x = verts[i*3], y = verts[i*3+1], z = verts[i*3+2];
      if (x !== null && y !== null && z !== null && !isNaN(x) && !isNaN(y) && !isNaN(z) && isFinite(x) && isFinite(y) && isFinite(z)) {
        clean.push(x, y, z);
        indexMap[i] = newIdx;
        newIdx++;
      }
    }
    if (!clean.length) return null;
    const cleanFaces = [];
    for (const f of faces) {
      const a = indexMap[f[0]], b = indexMap[f[1]], c = indexMap[f[2]];
      if (a >= 0 && b >= 0 && c >= 0) cleanFaces.push(a, b, c);
    }
    if (!cleanFaces.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(clean, 3));
    g.setIndex(cleanFaces); g.computeVertexNormals();
    return g;
  }

  function merge(list) {
    const P = [], I = []; let off = 0;
    list.forEach(g => {
      const p = g.attributes.position, i = g.index;
      for (let k = 0; k < p.count; k++) P.push(p.getX(k),p.getY(k),p.getZ(k));
      if (i) for (let k = 0; k < i.count; k++) I.push(i.getX(k)+off);
      else for (let k = 0; k < p.count; k++) I.push(k+off);
      off += p.count;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setIndex(I); g.computeVertexNormals(); return g;
  }

  const L = {};

  // ════════ 基本体 (第一关) ════════

  L['cylinder'] = () => { const g = cyl(30,60); g.translate(0,30,0); return {
    geometry: g, name:'圆柱', category:'basic',
    description:'圆柱体(r=30,h=60)',
    features:['侧面为圆柱面','底面为圆形','主视图为矩形','俯视图为圆形']
  };};

  L['cone'] = () => { const g = cone(35,55); g.translate(0,27.5,0); return {
    geometry: g, name:'圆锥', category:'basic',
    description:'正圆锥(r=35,h=55)',
    features:['锥面为圆锥面','底面为圆形','主/左视图为等腰三角形','俯视图为圆+圆心']
  };};

  L['sphere'] = () => { const g = sph(25); g.translate(0,25,0); return {
    geometry: g, name:'球', category:'basic',
    description:'球体(r=25)',
    features:['球面为球面','三视图都是圆','俯视图为圆','无棱线']
  };};

  L['box'] = () => ({
    geometry: box(50,60,50), name:'正四棱柱', category:'basic',
    description:'正四棱柱(50×60×50)',
    features:['四个矩形侧面','俯视图为正方形','主视图为矩形','左视图为矩形']
  });

  L['prism3'] = () => ({
    geometry: prism(3,35,55), name:'正三棱柱', category:'basic',
    description:'正三棱柱(边长70,h=55)',
    features:['三个矩形侧面','俯视图为三角形','主视图为矩形+竖线','左视图为矩形']
  });

  L['hex-prism'] = () => ({
    geometry: prism(6,30,50), name:'正六棱柱', category:'basic',
    description:'正六棱柱(边长60,h=50)',
    features:['六个矩形侧面','俯视图为正六边形','主视图为矩形+多条竖线']
  });

  L['frustum'] = () => { const g = cone(40,50); g.translate(0,25,0); const c = clip(g,0,1,0,-35); return {
    geometry: c||g, name:'圆台', category:'basic',
    description:'圆台(下r=40,上r=25,h=50)',
    features:['上下底面为同心圆','母线为斜线','俯视图为两个同心圆','主视图为等腰梯形']
  };};

  L['pyramid'] = () => { const g = new THREE.CylinderGeometry(0,1,1,4); g.rotateY(Math.PI/4); g.scale(25,45,25); g.translate(0,22.5,0); return {
    geometry: g, name:'正四棱锥', category:'basic',
    description:'正四棱锥(底边50,h=45)',
    features:['底面正方形','四个三角形侧面','俯视图为正方形+对角线','主视图为等腰三角形']
  };};

  L['bicone'] = () => { const c1 = cone(30,25); c1.translate(0,12.5,0); const c2 = cone(30,25); c2.translate(0,-12.5,0); c2.rotateZ(Math.PI); c2.translate(0,-12.5,0); const m = merge([c1,c2]); return {
    geometry: m, name:'双圆锥', category:'basic',
    description:'双圆锥(r=30,各h=25)底面对接',
    features:['腰线为最大圆','俯视图为圆','主/左视图为菱形','腰线在主视图中为横线']
  };};

  // ════════ 组合体 (第二关) ════════

  L['cyl-cone'] = () => { const c = cyl(30,35); c.translate(0,17.5,0); const k = cone(30,30); k.translate(0,50,0); const m = merge([c,k]); return {
    geometry: m, name:'圆柱圆锥组合体', category:'composite',
    description:'底部圆柱(r=30,h=35) + 顶部圆锥(r=30,h=30)',
    features:['底面圆 — 俯视图外圆','柱锥过渡圆 — 俯视图同径','圆锥母线 — 主/左视图斜线','顶点 — 俯视图圆心']
  };};

  L['stepped-cyl'] = () => { const b = cyl(40,25); b.translate(0,12.5,0); const t = cyl(25,25); t.translate(0,37.5,0); const m = merge([b,t]); return {
    geometry: m, name:'阶梯圆柱体', category:'composite',
    description:'下部大圆柱(r=40,h=25) + 上部小圆柱(r=25,h=25)',
    features:['上下两圆柱轮廓 — 主视图阶梯形','台阶圆 — 俯视图同心圆','台阶过渡线 — 主/左视图横线']
  };};

  L['sph-cyl'] = () => { const c = cyl(25,50); c.translate(0,25,0); const s = sph(25); s.translate(0,50,0); const m = merge([c,s]); return {
    geometry: m, name:'圆柱球体组合', category:'composite',
    description:'圆柱(r=25,h=50)顶部叠加同径球体',
    features:['球柱过渡 — 主视图无分界线','球体轮廓 — 主/左视图圆弧','球顶 — 俯视图圆心']
  };};

  L['triple-comp'] = () => { const s = sph(20); s.translate(0,20,0); const c = cyl(20,25); c.translate(0,47.5,0); const k = cone(20,20); k.translate(0,80,0); const m = merge([s,c,k]); return {
    geometry: m, name:'球柱锥三段组合', category:'composite',
    description:'底部球(r=20) + 中间圆柱(r=20,h=25) + 顶部锥(r=20,h=20)',
    features:['三段过渡圆','球柱过渡同径','柱锥过渡 — 主视图横线','俯视图仅一个圆']
  };};

  L['prism-cyl'] = () => { const p = prism(4,30,30); const c = cyl(20,30); c.translate(0,45,0); const m = merge([p,c]); return {
    geometry: m, name:'棱柱圆柱组合', category:'composite',
    description:'底部四棱柱(边长60,h=30) + 顶部圆柱(r=20,h=30)',
    features:['底部方形 — 俯视图外框','顶部圆形 — 俯视图内圆','过渡棱线','主视图为矩形叠加']
  };};

  L['cyl-frustum'] = () => { const c = cyl(25,25); c.translate(0,12.5,0); const k = cone(25,25); k.translate(0,37.5,0); const t = clip(k,0,1,0,-35)||k; const m = merge([c,t]); return {
    geometry: m, name:'圆柱圆台组合', category:'composite',
    description:'底部圆柱(r=25,h=25) + 顶部圆台(r底=25,r顶=15,h=25)',
    features:['柱台过渡圆','圆台母线为斜线','俯视图为同心圆']
  };};

  L['step-prism'] = () => { const p1 = prism(3,35,20); const p2 = prism(3,22,20); p2.translate(0,20,0); const p3 = prism(3,12,20); p3.translate(0,40,0); const m = merge([p1,p2,p3]); return {
    geometry: m, name:'阶梯三棱柱', category:'composite',
    description:'三层正三棱柱阶梯叠加(边长70/44/24,各h=20)',
    features:['三层阶梯轮廓','俯视图为嵌套三角形','主视图阶梯形']
  };};

  L['half-cyl'] = () => { const g = cyl(30,70); g.translate(0,35,0); const c = clip(g,1,0,0,0); return {
    geometry: c||g, name:'半圆柱体', category:'composite',
    description:'圆柱(r=30,h=70)沿轴线切去右半',
    features:['半圆底面 — 俯视图半圆','矩形切面 — 主视图宽矩形','半圆轮廓 — 左视图半圆弧']
  };};

  // ════════ 切割体 (第三关) ════════

  L['cyl-angle-cut'] = () => { const g = cyl(30,80); g.translate(0,40,0); const a = 40*Math.PI/180; const c = clip(g,0,Math.cos(a),Math.sin(a),-(Math.cos(a)*80)); return {
    geometry: c||g, name:'圆柱斜切', category:'cut',
    description:'圆柱(r=30,h=80)顶部被40°斜面切割',
    features:['底面圆 — 俯视图圆','圆柱侧面轮廓','斜面截面为椭圆','截面以下右侧轮廓变为斜面边缘']
  };};

  L['cyl-angle-cut2'] = () => { const g = cyl(28,75); g.translate(0,37.5,0); const a = 55*Math.PI/180; const c = clip(g,0,Math.cos(a),Math.sin(a),-(Math.cos(a)*60)); return {
    geometry: c||g, name:'圆柱大角度斜切', category:'cut',
    description:'圆柱(r=28,h=75)顶部55°斜面切割',
    features:['截面椭圆长轴接近直径','截面以下右侧轮廓缩短','主视图顶部为斜线']
  };};

  L['cyl-side-cut'] = () => { const g = cyl(25,60); g.translate(0,30,0); const a = 30*Math.PI/180; const c = clip(g,Math.cos(a),0,-Math.sin(a),-20); return {
    geometry: c||g, name:'圆柱侧面斜切', category:'cut',
    description:'圆柱(r=25,h=60)右侧被30°斜面切去',
    features:['切割面为椭圆','斜面边缘在主视图为斜线','底部轮廓变为曲线']
  };};

  L['cyl-notch'] = () => { const g = cyl(30,60); g.translate(0,30,0); const c = clip(g,1,0,0,-10); return {
    geometry: c||g, name:'圆柱开槽体', category:'cut',
    description:'圆柱(r=30,h=60)右侧被垂直平面切去',
    features:['槽口矩形截面','槽底隐藏轮廓为虚线','槽端产生交线']
  };};

  L['cone-cut'] = () => { const g = cone(40,60); g.translate(0,30,0); const a = 45*Math.PI/180; const c = clip(g,0,Math.cos(a),Math.sin(a),-(Math.cos(a)*35)); return {
    geometry: c||g, name:'圆锥斜截', category:'cut',
    description:'圆锥(r=40,h=60)被45°斜面截切',
    features:['圆锥轮廓 — 主/左视图三角形','截面为椭圆','截面以上被切除','主视图顶部变为斜线']
  };};

  L['cone-trunc'] = () => { const g = cone(40,55); g.translate(0,27.5,0); const c = clip(g,0,1,0,-20); return {
    geometry: c||g, name:'圆锥截顶', category:'cut',
    description:'圆锥(r=40,h=55)顶部水平截去',
    features:['截顶后为圆台','俯视图为同心圆','主视图为梯形+三角形']
  };};

  L['quad-cut'] = () => { const g = cyl(30,70); g.translate(0,35,0); const c1 = clip(g,1,0,0,0); const c2 = clip(c1||g,0,0,1,0); return {
    geometry: c2||c1||g, name:'四分之一圆柱', category:'cut',
    description:'圆柱(r=30,h=70)被两个垂直平面各切一半',
    features:['两个矩形切面','四分之一圆弧面','俯视图为四分之一圆']
  };};

  L['cyl-double-cut'] = () => { const g = cyl(28,65); g.translate(0,32.5,0); const a = 40*Math.PI/180; const c1 = clip(g,Math.cos(a),Math.sin(a),0,-(Math.cos(a)*20+Math.sin(a)*55)); const c2 = clip(c1||g,Math.cos(a),-Math.sin(a),0,-(Math.cos(a)*20-Math.sin(a)*10)); return {
    geometry: c2||c1||g, name:'圆柱切双角', category:'cut',
    description:'圆柱(r=28,h=65)上下两端被40°斜面切',
    features:['两端椭圆截面','截面为椭圆弧','主视图两端为斜线','中间保留圆柱轮廓']
  };};

  L['prism-cut'] = () => { const g = prism(3,35,55); const n = [0.6,-0.3,-0.7]; const m = Math.sqrt(0.36+0.09+0.49); const c = clip(g,n[0]/m,n[1]/m,n[2]/m,-15); return {
    geometry: c||g, name:'三棱柱切角', category:'cut',
    description:'正三棱柱(边长70,h=55)被斜面切去一角',
    features:['三个棱面各有矩形投影','切割面为多边形','切角处新轮廓线']
  };};

  L['cyl-half-groove'] = () => { const g = cyl(30,60); g.translate(0,30,0); const c = clip(g,0,0,1,0); return {
    geometry: c||g, name:'半圆柱正面开槽', category:'cut',
    description:'圆柱(r=30,h=60)正面切去一半',
    features:['切面为矩形','半圆轮廓 — 俯视图半圆','切面边缘在主视图为竖线']
  };};

  L['cyl-top-hole'] = () => { const g = cyl(35,60); g.translate(0,30,0); const c = clip(g,0,0,1,-15); return {
    geometry: c||g, name:'圆柱顶开方孔', category:'cut',
    description:'圆柱(r=35,h=60)顶部前侧被切去',
    features:['圆柱轮廓三视图各有表现','切角面 — 俯视图矩形缺口','切角处新轮廓线']
  };};

  L['cone-corner'] = () => { const g = cone(35,55); g.translate(0,27.5,0); const n = [0.7,-0.2,-0.6]; const m = Math.sqrt(0.49+0.04+0.36); const c = clip(g,n[0]/m,n[1]/m,n[2]/m,-20); return {
    geometry: c||g, name:'圆锥切角', category:'cut',
    description:'圆锥(r=35,h=55)被斜面切去一角',
    features:['切面为多边形','圆锥母线被截短','三视图各有不同轮廓']
  };};

  L['cyl-angled-hole'] = () => { const g = cyl(30,70); g.translate(0,35,0); const a = 30*Math.PI/180; const c = clip(g,0,Math.cos(a),Math.sin(a),-(Math.cos(a)*55)); return {
    geometry: c||g, name:'圆柱斜切口', category:'cut',
    description:'圆柱(r=30,h=70)顶部30°斜面切割',
    features:['斜面为椭圆','主视图顶部为斜线','截面在俯视图为椭圆']
  };};

  L['cyl-step-cut'] = () => { const g = cyl(30,70); g.translate(0,35,0); const a = 35*Math.PI/180; const c = clip(g,0,Math.cos(a),Math.sin(a),-(Math.cos(a)*60)); return {
    geometry: c||g, name:'圆柱带台阶切', category:'cut',
    description:'圆柱(r=30,h=70)顶部35°斜切',
    features:['顶部斜面为椭圆','截面以下轮廓缩短','右侧切深约17单位']
  };};

  // ════════ 相贯体 (第四关) ════════

  L['perp-cyl'] = (rB=40,rS=18,h=80) => {
    const b = cyl(rB,h); b.translate(0,h/2,0);
    const s = cyl(rS,rB*2.5); s.rotateZ(Math.PI/2);
    const m = merge([b,s]);
    return { geometry: m, name:'两圆柱正交', category:'intersect',
      description:`大圆柱(r=${rB})沿Y轴，小圆柱(r=${rS})沿X轴穿过`,
      features:['大圆柱矩形轮廓','小圆柱矩形轮廓','相贯线为双曲线','上半可见下半虚线']
    };
  };
  L['perp-cyl-eq'] = () => L['perp-cyl'](35,35,70);

  L['perp-cyl-uneq'] = () => L['perp-cyl'](35,25,70);

  L['cyl-cone-inter'] = () => { const c = cyl(25,60); c.translate(0,30,0); const k = cone(18,40); k.rotateZ(Math.PI/2); k.translate(0,25,0); const m = merge([c,k]); return {
    geometry: m, name:'圆柱圆锥相贯', category:'intersect',
    description:'竖直圆柱(r=25,h=60)与水平圆锥(R=18,h=40)正交',
    features:['圆柱轮廓 — 主视图矩形','圆锥交线 — 非圆弧曲线','交线上下端形状不同','可见性需判断']
  };};

  L['triple-cyl'] = () => { const c1 = cyl(25,60); c1.translate(0,30,0); const c2 = cyl(12,50); c2.rotateZ(Math.PI/2); const c3 = cyl(12,50); c3.rotateX(Math.PI/2); const m = merge([c1,c2,c3]); return {
    geometry: m, name:'三圆柱正交', category:'intersect',
    description:'主圆柱(r=25)被两小圆柱(r=12)从X和Z方向穿过',
    features:['三条相贯线','交线为复杂曲线','可见性需仔细判断','主视图最复杂']
  };};

  L['cyl-hole'] = (rB=30,hB=80,rH=12) => {
    const b = cyl(rB,hB); b.rotateZ(Math.PI/2);
    const h = cyl(rH,hB*1.5);
    const m = merge([b,h]);
    return { geometry: m, name:'圆柱开通孔', category:'intersect',
      description:`水平圆柱(r=${rB})被竖直通孔(r=${rH})穿透`,
      features:['水平圆柱轮廓','通孔轮廓 — 主视图内虚线','孔壁与圆柱面交线','孔顶/底面椭圆']
    };
  };
  L['cyl-hole-eq'] = () => L['cyl-hole'](25,60,25);

  L['cyl-tangent'] = () => { const c1 = cyl(30,50); c1.translate(0,25,0); const c2 = cyl(15,50); c2.translate(15,25,0); const m = merge([c1,c2]); return {
    geometry: m, name:'两圆柱相切', category:'intersect',
    description:'大圆柱(r=30)和小圆柱(r=15)相切排列',
    features:['两圆柱轮廓各有矩形','切线处无交线','俯视图为两个外切圆']
  };};

  // ════════ 综合/复杂形体 (第五关) ════════

  // 带肋板的底板
  L['base-with-rib'] = () => {
    const base = box(80,15,60);
    const cyl1 = cyl(12,50); cyl1.translate(-25,20+25,0);
    const cyl2 = cyl(12,50); cyl2.translate(25,20+25,0);
    const rib = box(3,35,40); rib.translate(0,15+17.5,0);
    const m = merge([base,cyl1,cyl2,rib]);
    return { geometry: m, name:'带肋板底板', category:'composite',
      description:'底板(80×15×60) + 两侧立柱(r=12,h=50) + 中央肋板(3×35×40)',
      features:['底板 — 俯视图外框','两侧圆柱立柱','中央肋板 — 俯视图窄矩形','肋板与立柱交线']
    };
  };

  // 带凸台的方块
  L['block-with-boss'] = () => {
    const blk = box(60,30,50);
    const boss = cyl(15,20); boss.translate(0,50,0);
    const m = merge([blk,boss]);
    return { geometry: m, name:'带凸台方块', category:'composite',
      description:'方块(60×30×50)顶部中央加圆柱凸台(r=15,h=20)',
      features:['方块轮廓 — 俯视图外框','凸台圆 — 俯视图内圆','凸台与方块过渡棱线']
    };
  };

  // 带凹腔的方块
  L['block-with-recess'] = () => {
    const blk = box(60,30,50);
    // 顶部前方挖出凹腔
    const g = blk.clone();
    const c1 = clip(g, 0, -1, 0, -20); // 保留 y >= -20 (去掉顶部)
    const g2 = c1 || blk;
    const c2 = clip(g2, 0, 0, 1, -10); // 保留 z <= 10 (前方)
    const g3 = clip(c2||g2, 1, 0, 0, -20); // 保留 x <= 20 (左侧)
    const m = merge([g3 || g2 || blk]);
    return { geometry: m, name:'带凹腔方块', category:'composite',
      description:'方块(60×30×50)顶部前方右角挖出凹腔',
      features:['凹腔轮廓 — 俯视图缺口','凹腔底部 — 俯视图内矩形','凹腔壁 — 主/左视图虚线']
    };
  };

  // 带圆角过渡的台阶
  L['stepped-block'] = () => {
    const b1 = box(70,20,50);
    const b2 = box(40,15,50); b2.translate(-15,35,0);
    const m = merge([b1,b2]);
    return { geometry: m, name:'台阶方块', category:'composite',
      description:'底部大方块(70×20×50) + 上部小方块(40×15×50)',
      features:['台阶面 — 俯视图矩形分界','上下方块轮廓','台阶处棱线 — 主视图横线']
    };
  };

  // 轴孔结构
  L['shaft-housing'] = () => {
    const housing = box(70,40,50);
    const shaft = cyl(10,80); shaft.rotateZ(Math.PI/2); shaft.translate(0,20,0);
    const flange = box(80,5,60); flange.translate(0,-2.5,0);
    const m = merge([housing,shaft,flange]);
    return { geometry: m, name:'轴孔结构', category:'composite',
      description:'壳体(70×40×50) + 穿轴(r=10,L=80) + 底部法兰',
      features:['壳体轮廓','轴穿入壳体 — 主视图虚线','法兰轮廓','轴与壳体交线']
    };
  };

  // ════════ 获取接口 ════════
  function getShape(id) {
    try {
      const b = L[id]; if (!b) return null;
      const r = b(); if (!r || !r.geometry) return null;
      if (r.geometry.attributes.position.count === 0) return null;
      return r;
    } catch(e) { console.error('Shape error:', id, e); return null; }
  }

  function getAllIds() { return Object.keys(L); }

  function getRandomShape(cat) {
    const all = Object.keys(L);
    let pool = all;
    if (cat && cat !== 'all') {
      const f = [];
      all.forEach(id => { const s = getShape(id); if (s && s.category === cat) f.push(id); });
      if (f.length) pool = f;
    }
    return getShape(pool[Math.floor(Math.random()*pool.length)]);
  }

  return { getShape, getAllIds, getRandomShape };
})();