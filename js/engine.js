// ═══════════════════════════════════════════
// engine.js — 3D 渲染 + 2D 正交投影引擎
// ═══════════════════════════════════════════

const Engine = (() => {

  let scene, camera, renderer, orbitState;
  let currentMesh = null;
  let wireframeMesh = null;
  let gridHelper = null;
  let axesHelper = null;

  // ─────────────────────────────────────────
  // 3D Three.js 场景初始化
  // ─────────────────────────────────────────
  function initThree(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(120, 100, 120);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 60);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0x88aaff, 0.3);
    dirLight2.position.set(-40, 30, -50);
    scene.add(dirLight2);

    // 网格
    gridHelper = new THREE.GridHelper(120, 12, 0xcccccc, 0xf0ece4);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // 坐标轴
    axesHelper = new THREE.AxesHelper(30);
    axesHelper.position.y = -48;
    scene.add(axesHelper);

    // 轨道状态
    orbitState = {
      theta: Math.PI / 4,
      phi: Math.PI / 5,
      radius: 180,
      target: new THREE.Vector3(0, 0, 0),
      isDragging: false,
      lastX: 0,
      lastY: 0
    };

    setupOrbitControls(canvas);
    updateCamera();

    // 窗口大小自适应
    window.addEventListener('resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    // 渲染循环
    animate();
  }

  function setupOrbitControls(canvas) {
    canvas.addEventListener('mousedown', e => {
      orbitState.isDragging = true;
      orbitState.lastX = e.clientX;
      orbitState.lastY = e.clientY;
    });

    canvas.addEventListener('mousemove', e => {
      if (!orbitState.isDragging) return;
      const dx = e.clientX - orbitState.lastX;
      const dy = e.clientY - orbitState.lastY;
      orbitState.theta -= dx * 0.008;
      orbitState.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitState.phi + dy * 0.008));
      orbitState.lastX = e.clientX;
      orbitState.lastY = e.clientY;
      updateCamera();
    });

    canvas.addEventListener('mouseup', () => orbitState.isDragging = false);
    canvas.addEventListener('mouseleave', () => orbitState.isDragging = false);

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      orbitState.radius = Math.max(80, Math.min(400, orbitState.radius + e.deltaY * 0.2));
      updateCamera();
    }, { passive: false });

    // 触摸支持
    let touchDist = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        orbitState.isDragging = true;
        orbitState.lastX = e.touches[0].clientX;
        orbitState.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        touchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && orbitState.isDragging) {
        const dx = e.touches[0].clientX - orbitState.lastX;
        const dy = e.touches[0].clientY - orbitState.lastY;
        orbitState.theta -= dx * 0.008;
        orbitState.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitState.phi + dy * 0.008));
        orbitState.lastX = e.touches[0].clientX;
        orbitState.lastY = e.touches[0].clientY;
        updateCamera();
      } else if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        orbitState.radius = Math.max(80, Math.min(400, orbitState.radius + (touchDist - d) * 0.5));
        touchDist = d;
        updateCamera();
      }
    }, { passive: false });

    canvas.addEventListener('touchend', () => orbitState.isDragging = false);
  }

  function updateCamera() {
    const { theta, phi, radius, target } = orbitState;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.cos(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(target);
  }

  // 重置视角
  function resetCamera() {
    orbitState.theta = Math.PI / 4;
    orbitState.phi = Math.PI / 5;
    orbitState.radius = 180;
    orbitState.target.set(0, 0, 0);
    updateCamera();
  }

  // 设置预定义视角
  function setViewPreset(preset) {
    switch (preset) {
      case 'front':
        orbitState.theta = 0;
        orbitState.phi = Math.PI / 2;
        break;
      case 'top':
        orbitState.phi = 0.01;
        break;
      case 'left':
        orbitState.theta = Math.PI / 2;
        orbitState.phi = Math.PI / 2;
        break;
      case 'iso':
        orbitState.theta = Math.PI / 4;
        orbitState.phi = Math.PI / 5;
        break;
    }
    updateCamera();
  }

  // 渲染循环
  function animate() {
    requestAnimationFrame(animate);
    if (currentMesh) currentMesh.rotation.y += 0.002;
    renderer.render(scene, camera);
  }

  // 停止旋转
  function stopRotation() {
    if (currentMesh) currentMesh.rotation.y = 0;
  }

  // ─────────────────────────────────────────
  // 加载形体到 3D 场景
  // ─────────────────────────────────────────
  function loadShape(shapeData) {
    if (currentMesh) scene.remove(currentMesh);
    if (wireframeMesh) scene.remove(wireframeMesh);

    const geometry = shapeData.geometry;
    geometry.computeVertexNormals();

    // 实体网格
    const mat = new THREE.MeshPhongMaterial({
      color: 0x4a8fc7,
      specular: 0x222222,
      shininess: 30,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });
    currentMesh = new THREE.Mesh(geometry, mat);
    scene.add(currentMesh);

    // 线框叠加
    const edgesGeo = new THREE.EdgesGeometry(geometry, 15);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    wireframeMesh = new THREE.LineSegments(edgesGeo, edgesMat);
    scene.add(wireframeMesh);
  }

  // 高亮特定面（用于解题步骤）
  function highlightFace(faceIndices, color = 0x00d4aa) {
    if (!currentMesh) return;
    const geo = currentMesh.geometry;
    const mat = currentMesh.material;

    // 使用顶点颜色高亮
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const idx = geo.index;

    if (idx) {
      const count = pos.count;
      const colorAttr = new THREE.BufferAttribute(colors, 3);
      geo.setAttribute('color', colorAttr);

      for (let i = 0; i < idx.count; i += 3) {
        const i0 = idx.getX(i);
        const i1 = idx.getX(i + 1);
        const i2 = idx.getX(i + 2);

        const isHighlighted = faceIndices.includes(i);
        const c = new THREE.Color(isHighlighted ? color : 0x4a8fc7);

        [i0, i1, i2].forEach(vi => {
          colors[vi * 3] = c.r;
          colors[vi * 3 + 1] = c.g;
          colors[vi * 3 + 2] = c.b;
        });
      }

      mat.vertexColors = true;
      mat.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }
  }

  function clearHighlight() {
    if (!currentMesh) return;
    const mat = currentMesh.material;
    mat.vertexColors = false;
    mat.needsUpdate = true;
  }

  // ─────────────────────────────────────────
  // 2D 正交投影引擎
  // ─────────────────────────────────────────
  /**
   * 从 3D 几何体提取边并投影到指定视图
   * viewDir: 视图方向向量
   * projectAxis: 投影到哪个平面 (drop 哪个轴)
   */
  function extractProjectionEdges(geometry, viewDir, dropAxis) {
    const pos = geometry.attributes.position;
    const idx = geometry.index;
    const vd = new THREE.Vector3(viewDir.x, viewDir.y, viewDir.z).normalize();
    const triCount = idx ? Math.floor(idx.count / 3) : Math.floor(pos.count / 3);

    const project = (v) => {
      if (dropAxis === 'z') return { x: v[0], y: v[1] };
      if (dropAxis === 'y') return { x: v[0], y: v[2] };
      if (dropAxis === 'x') return { x: v[2], y: v[1] };
      return { x: v[0], y: v[1] };
    };

    // 第一步：收集所有面数据（法线 + 可见性）
    const faces = [];
    for (let t = 0; t < triCount; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3;
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;

      const v = [
        [pos.getX(i0), pos.getY(i0), pos.getZ(i0)],
        [pos.getX(i1), pos.getY(i1), pos.getZ(i1)],
        [pos.getX(i2), pos.getY(i2), pos.getZ(i2)]
      ];

      const e1 = [v[1][0]-v[0][0], v[1][1]-v[0][1], v[1][2]-v[0][2]];
      const e2 = [v[2][0]-v[0][0], v[2][1]-v[0][1], v[2][2]-v[0][2]];
      const nx = e1[1]*e2[2] - e1[2]*e2[1];
      const ny = e1[2]*e2[0] - e1[0]*e2[2];
      const nz = e1[0]*e2[1] - e1[1]*e2[0];
      const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
      const nn = [nx/len, ny/len, nz/len];

      // 法线指向观察者方向 → 可见
      const dot = nn[0]*vd.x + nn[1]*vd.y + nn[2]*vd.z;
      faces.push({ v, visible: dot > 0, normal: nn });
    }

    // 第二步：建立边邻接图
    const edgeMap = {};
    for (let t = 0; t < triCount; t++) {
      const f = faces[t];
      const localEdges = [[0,1],[1,2],[2,0]];
      for (const [a,b] of localEdges) {
        const va = f.v[a], vb = f.v[b];
        const k1 = `${va[0].toFixed(2)},${va[1].toFixed(2)},${va[2].toFixed(2)}|${vb[0].toFixed(2)},${vb[1].toFixed(2)},${vb[2].toFixed(2)}`;
        const k2 = `${vb[0].toFixed(2)},${vb[1].toFixed(2)},${vb[2].toFixed(2)}|${va[0].toFixed(2)},${va[1].toFixed(2)},${va[2].toFixed(2)}`;
        const mapKey = k1 < k2 ? k1 : k2;
        if (!edgeMap[mapKey]) edgeMap[mapKey] = [];
        edgeMap[mapKey].push({ face: t, a, b });
      }
    }

    // 第三步：提取边（用二面角过滤掉曲面三角剖分的虚假边）
    const DIHEDRAL_COS = Math.cos(20 * Math.PI / 180);
    const visible = [], hidden = [];
    const seen = new Set();

    for (const [key, entries] of Object.entries(edgeMap)) {
      if (entries.length > 2) continue;

      const faceData = entries.map(e => faces[e.face]);
      const visCount = faceData.filter(f => f.visible).length;

      // 判断是否为真实棱边
      // 剪影边（两面可见性不同）始终保留；同可见性的边用二面角过滤三角剖分假边
      let isRealEdge = true;
      if (entries.length === 2) {
        const [f1, f2] = faceData;
        if (f1.visible === f2.visible) {
          const nd = f1.normal[0]*f2.normal[0] + f1.normal[1]*f2.normal[1] + f1.normal[2]*f2.normal[2];
          if (nd > DIHEDRAL_COS) isRealEdge = false;
        }
      }

      if (!isRealEdge) continue;

      const f = faceData[0];
      const e = entries[0];
      const va = f.v[e.a], vb = f.v[e.b];
      const pa = project(va), pb = project(vb);

      // 跳过投影后退化的边
      if (Math.abs(pa.x - pb.x) < 0.005 && Math.abs(pa.y - pb.y) < 0.005) continue;

      if (visCount > 0) {
        if (!seen.has(key)) { seen.add(key); visible.push({ a: pa, b: pb, key }); }
      } else {
        if (!seen.has(key)) { seen.add(key); hidden.push({ a: pa, b: pb, key }); }
      }
    }

    return { visible, hidden };
  }

  /**
   * 渲染三视图到 Canvas
   */
  function renderThreeViews(geometry, canvas, options = {}) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const cw = rect.width, ch = rect.height;
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, cw, ch);

    // 三视图布局：主视图左上，俯视图左下，左视图右上
    const gap = 16;
    const cellW = (cw - gap * 3) / 2;
    const cellH = (ch - gap * 3) / 2;

    const cells = [
      { name: '主视图', dir: new THREE.Vector3(0,0,1), dropAxis: 'z',
        cx: gap + cellW/2, cy: gap + cellH/2 },
      { name: '俯视图', dir: new THREE.Vector3(0,1,0), dropAxis: 'y',
        cx: gap + cellW/2, cy: gap*2 + cellH*1.5 + cellH/2 },
      { name: '左视图', dir: new THREE.Vector3(-1,0,0), dropAxis: 'x',
        cx: gap*2 + cellW*1.5 + cellW/2, cy: gap + cellH/2 }
    ];

    const showVisible = options.showVisible !== false;
    const showHidden = options.showHidden !== false;

    cells.forEach(cell => {
      const edges = extractProjectionEdges(geometry, cell.dir, cell.dropAxis);
      const all = [...edges.visible, ...edges.hidden];
      if (!all.length) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      all.forEach(e => {
        minX = Math.min(minX, e.a.x, e.b.x);
        minY = Math.min(minY, e.a.y, e.b.y);
        maxX = Math.max(maxX, e.a.x, e.b.x);
        maxY = Math.max(maxY, e.a.y, e.b.y);
      });

      const shapeW = (maxX - minX) + 10;
      const shapeH = (maxY - minY) + 10;
      const scale = Math.min(cellW / shapeW, cellH / shapeH) * 0.9;
      const offX = -(minX + maxX) / 2;
      const offY = -(minY + maxY) / 2;

      // 标签
      ctx.fillStyle = '#666666';
      ctx.font = '11px Microsoft YaHei, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cell.name, cell.cx, cell.cy + shapeH * scale / 2 + 16);

      // 画虚线（隐藏线）
      if (showHidden) {
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 3]);
        edges.hidden.forEach(e => {
          ctx.beginPath();
          ctx.moveTo(cell.cx + (e.a.x + offX) * scale, cell.cy - (e.a.y + offY) * scale);
          ctx.lineTo(cell.cx + (e.b.x + offX) * scale, cell.cy - (e.b.y + offY) * scale);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      // 画实线（可见轮廓线）
      if (showVisible) {
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1.5;
        edges.visible.forEach(e => {
          ctx.beginPath();
          ctx.moveTo(cell.cx + (e.a.x + offX) * scale, cell.cy - (e.a.y + offY) * scale);
          ctx.lineTo(cell.cx + (e.b.x + offX) * scale, cell.cy - (e.b.y + offY) * scale);
          ctx.stroke();
        });
      }

      // 辅助线（可选）
      if (options.helperLines) {
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 0.3;
        ctx.setLineDash([2, 4]);
        const ox = cell.cx + offX * scale;
        const oy = cell.cy - offY * scale;
        ctx.beginPath();
        ctx.moveTo(ox - cellW/2 + 4, oy);
        ctx.lineTo(ox + cellW/2 - 4, oy);
        ctx.moveTo(ox, oy - cellH/2 + 4);
        ctx.lineTo(ox, oy + cellH/2 - 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 对齐线（主→俯 竖直，主→左 水平）
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.4;
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.moveTo(gap + cellW/2, gap + cellH + gap/2);
    ctx.lineTo(gap + cellW/2, gap*2 + cellH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gap + cellW + gap/2, gap + cellH/2);
    ctx.lineTo(gap*2 + cellW, gap + cellH/2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /**
   * 渲染单个视图（用于部分显示）
   */
  function renderSingleView(geometry, canvas, viewName, options = {}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1);
    const H = canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, cw, ch);

    let viewDir, dropAxis;
    if (viewName === 'front') { viewDir = new THREE.Vector3(0, 0, 1); dropAxis = 'z'; }
    else if (viewName === 'top') { viewDir = new THREE.Vector3(0, 1, 0); dropAxis = 'y'; }
    else if (viewName === 'left') { viewDir = new THREE.Vector3(-1, 0, 0); dropAxis = 'x'; }
    else return;

    const edges = extractProjectionEdges(geometry, viewDir, dropAxis);
    const scale = options.scale || 2.0;
    const cx = cw / 2, cy = ch / 2;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    [...edges.visible, ...edges.hidden].forEach(e => {
      minX = Math.min(minX, e.a.x, e.b.x);
      minY = Math.min(minY, e.a.y, e.b.y);
      maxX = Math.max(maxX, e.a.x, e.b.x);
      maxY = Math.max(maxY, e.a.y, e.b.y);
    });
    if (minX === Infinity) return;

    const offset = { x: -((minX + maxX) / 2), y: -((minY + maxY) / 2) };

    // 标签
    const labels = { front: '主视图', top: '俯视图', left: '左视图' };
    ctx.fillStyle = '#666666';
    ctx.font = '11px Microsoft YaHei, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[viewName], cx, cy + (maxY - minY) * scale / 2 + 18);

    const drawEdges = (edgeList, color, width, dash) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash || []);
      edgeList.forEach(e => {
        const ax = cx + (e.a.x + offset.x) * scale;
        const ay = cy - (e.a.y + offset.y) * scale;
        const bx = cx + (e.b.x + offset.x) * scale;
        const by = cy - (e.b.y + offset.y) * scale;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    };

    if (options.showHidden !== false) drawEdges(edges.hidden, '#6b8fa8', 1, [4, 3]);
    if (options.showVisible !== false) drawEdges(edges.visible, '#1a1a2e', 1.5);
  }

  /**
   * 渲染习题纸面：已知视图正常画，缺失视图画虚线框+"请补画"
   * options.givenViews: ['front','top'] 要画的视图
   * options.missingView: 'left' 缺失的视图名
   * options.showAnswer: true 时全部画出来（答案模式）
   */
  function renderExercisePaper(geometry, canvas, options = {}) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const cw = rect.width, ch = rect.height;
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, cw, ch);

    const givenViews = options.givenViews || ['front', 'top'];
    const missingView = options.missingView || 'left';
    const showAnswer = options.showAnswer || false;
    const allViews = ['front', 'top', 'left'];
    const activeViews = showAnswer ? allViews : givenViews;

    const gap = 20;
    const cellW = (cw - gap * 3) / 2;
    const cellH = (ch - gap * 3) / 2;

    const viewConfig = {
      front: { name: '主视图', dir: new THREE.Vector3(0,0,1), dropAxis: 'z',
               cx: gap + cellW/2, cy: gap + cellH/2 },
      top:   { name: '俯视图', dir: new THREE.Vector3(0,1,0), dropAxis: 'y',
               cx: gap + cellW/2, cy: gap*2 + cellH*1.5 + cellH/2 },
      left:  { name: '左视图', dir: new THREE.Vector3(-1,0,0), dropAxis: 'x',
               cx: gap*2 + cellW*1.5 + cellW/2, cy: gap + cellH/2 }
    };

    // 画所有已知视图
    activeViews.forEach(vName => {
      const cfg = viewConfig[vName];
      if (!cfg) return;
      const edges = extractProjectionEdges(geometry, cfg.dir, cfg.dropAxis);
      const all = [...edges.visible, ...edges.hidden];
      if (!all.length) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      all.forEach(e => {
        minX = Math.min(minX, e.a.x, e.b.x);
        minY = Math.min(minY, e.a.y, e.b.y);
        maxX = Math.max(maxX, e.a.x, e.b.x);
        maxY = Math.max(maxY, e.a.y, e.b.y);
      });

      const shapeW = (maxX - minX) + 10;
      const shapeH = (maxY - minY) + 10;
      const scale = Math.min(cellW / shapeW, cellH / shapeH) * 0.88;
      const offX = -(minX + maxX) / 2;
      const offY = -(minY + maxY) / 2;

      // 标签
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 12px Microsoft YaHei, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.name, cfg.cx, cfg.cy + shapeH * scale / 2 + 18);

      // 虚线（不可见轮廓）
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([5, 4]);
      edges.hidden.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(cfg.cx + (e.a.x + offX) * scale, cfg.cy - (e.a.y + offY) * scale);
        ctx.lineTo(cfg.cx + (e.b.x + offX) * scale, cfg.cy - (e.b.y + offY) * scale);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 实线（可见轮廓）
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1.8;
      edges.visible.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(cfg.cx + (e.a.x + offX) * scale, cfg.cy - (e.a.y + offY) * scale);
        ctx.lineTo(cfg.cx + (e.b.x + offX) * scale, cfg.cy - (e.b.y + offY) * scale);
        ctx.stroke();
      });
    });

    // 缺失视图：画虚线框 + 提示文字
    if (!showAnswer) {
      const mc = viewConfig[missingView];
      if (mc) {
        const bx = mc.cx - cellW/2 + gap, by = mc.cy - cellH/2 + gap;
        const bw = cellW - gap*2, bh = cellH - gap*2;
        ctx.strokeStyle = '#1a5fb4';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);

        ctx.fillStyle = '#1a5fb4';
        ctx.font = 'bold 13px Microsoft YaHei, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`✏️ 请补画${mc.name}`, mc.cx, mc.cy - 8);
        ctx.fillStyle = '#888888';
        ctx.font = '11px Microsoft YaHei, sans-serif';
        ctx.fillText('（根据已知视图补画）', mc.cx, mc.cy + 14);
      }
    }

    // 对齐辅助线
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(gap + cellW/2, gap + cellH + gap/2);
    ctx.lineTo(gap + cellW/2, gap*2 + cellH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gap + cellW + gap/2, gap + cellH/2);
    ctx.lineTo(gap*2 + cellW, gap + cellH/2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ─────────────────────────────────────────
  // 学生绘图工具（Canvas 2D）
  // ─────────────────────────────────────────
  const drawState = {
    tool: 'line',
    drawings: [],
    current: null,
    snapEnabled: true,
    undoStack: []
  };

  function initDrawCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    canvas.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      drawState.current = { tool: drawState.tool, points: [{ x, y }] };
    });

    canvas.addEventListener('mousemove', e => {
      if (!drawState.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (drawState.tool === 'line') {
        drawState.current.points.push({ x, y });
        drawState.current.points.shift(); // 保持两点
        renderDrawCanvas(canvas);
      }
    });

    canvas.addEventListener('mouseup', () => {
      if (drawState.current && drawState.current.points.length >= 2) {
        drawState.drawings.push(drawState.current);
        drawState.undoStack.push(drawState.drawings.length - 1);
        renderDrawCanvas(canvas);
      }
      drawState.current = null;
    });

    // 工具切换
    document.getElementById('tool-line')?.addEventListener('click', () => setDrawTool('line'));
    document.getElementById('tool-arc')?.addEventListener('click', () => setDrawTool('arc'));
    document.getElementById('tool-ellipse')?.addEventListener('click', () => setDrawTool('ellipse'));
    document.getElementById('tool-rect')?.addEventListener('click', () => setDrawTool('rect'));
    document.getElementById('tool-undo')?.addEventListener('click', undoDraw);
    document.getElementById('tool-clear')?.addEventListener('click', clearDraw);
    document.getElementById('tool-snap')?.addEventListener('click', () => {
      drawState.snapEnabled = !drawState.snapEnabled;
      document.getElementById('tool-snap').classList.toggle('active', drawState.snapEnabled);
    });
  }

  function setDrawTool(tool) {
    drawState.tool = tool;
    document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
    document.getElementById(`tool-${tool}`)?.classList.add('active');
  }

  function renderDrawCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const cw = rect.width, ch = rect.height;

    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, cw, ch);

    // 画三视图参考线
    drawViewGuides(ctx, cw, ch);

    // 画已有图形
    ctx.strokeStyle = '#1a5fb4';
    ctx.lineWidth = 2;
    drawState.drawings.forEach(d => {
      if (d.tool === 'line' && d.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(d.points[0].x, d.points[0].y);
        ctx.lineTo(d.points[1].x, d.points[1].y);
        ctx.stroke();
      }
    });

    // 当前绘制
    if (drawState.current) {
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      if (drawState.current.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(drawState.current.points[0].x, drawState.current.points[0].y);
        ctx.lineTo(drawState.current.points[1].x, drawState.current.points[1].y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  function drawViewGuides(ctx, w, h) {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([6, 8]);

    // 主视图区域
    const fw = w * 0.28, fh = h * 0.35;
    drawViewBox(ctx, w * 0.06, h * 0.08, fw, fh, '主视图');

    // 俯视图区域
    drawViewBox(ctx, w * 0.06, h * 0.55, fw, fh, '俯视图');

    // 左视图区域
    drawViewBox(ctx, w * 0.56, h * 0.08, w * 0.34, fh, '左视图');

    // 对齐线
    ctx.beginPath();
    ctx.moveTo(w * 0.06 + fw / 2, h * 0.43);
    ctx.lineTo(w * 0.06 + fw / 2, h * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.06 + fw, h * 0.08 + fh / 2);
    ctx.lineTo(w * 0.56, h * 0.08 + fh / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  function drawViewBox(ctx, x, y, w, h, label) {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 5]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    ctx.fillStyle = '#4a6a7a';
    ctx.font = '10px Microsoft YaHei, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y - 4);
  }

  function undoDraw() {
    if (drawState.drawings.length > 0) {
      drawState.drawings.pop();
      const canvas = document.getElementById('draw-canvas');
      if (canvas) renderDrawCanvas(canvas);
    }
  }

  function clearDraw() {
    drawState.drawings = [];
    drawState.undoStack = [];
    const canvas = document.getElementById('draw-canvas');
    if (canvas) renderDrawCanvas(canvas);
  }

  // ─────────────────────────────────────────
  // 评分系统
  // ─────────────────────────────────────────
  function evaluateAnswer(drawings, geometry) {
    // 基础评分：检查三个视图区域是否有内容
    let score = 0;
    let total = 3;

    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return { score: 0, feedback: '无法评估' };

    const w = canvas.clientWidth, h = canvas.clientHeight;

    // 检查主视图区域
    const hasFront = drawings.some(d => d.points.some(p =>
      p.x > w * 0.06 && p.x < w * 0.34 && p.y > h * 0.08 && p.y < h * 0.43
    ));
    // 检查俯视图区域
    const hasTop = drawings.some(d => d.points.some(p =>
      p.x > w * 0.06 && p.x < w * 0.34 && p.y > h * 0.55 && p.y < h * 0.90
    ));
    // 检查左视图区域
    const hasLeft = drawings.some(d => d.points.some(p =>
      p.x > w * 0.56 && p.x < w * 0.90 && p.y > h * 0.08 && p.y < h * 0.43
    ));

    if (hasFront) score++;
    if (hasTop) score++;
    if (hasLeft) score++;

    const feedback = [];
    if (!hasFront) feedback.push('主视图区域未绘制');
    if (!hasTop) feedback.push('俯视图区域未绘制');
    if (!hasLeft) feedback.push('左视图区域未绘制');

    return {
      score: Math.round(score / total * 100),
      feedback: feedback.length ? feedback.join('；') : '三个视图均有内容，请对照答案检查准确性'
    };
  }

  function resize3D(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !camera || !renderer) return;
    const w = canvas.clientWidth || 400;
    const h = canvas.clientHeight || 300;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ═══════════════════════════════════════
  // 公开接口
  // ═══════════════════════════════════════
  return {
    initThree,
    resize3D,
    resetCamera,
    setViewPreset,
    loadShape,
    highlightFace,
    clearHighlight,
    renderThreeViews,
    renderExercisePaper,
    renderSingleView,
    initDrawCanvas,
    setDrawTool,
    renderDrawCanvas,
    undoDraw,
    clearDraw,
    evaluateAnswer,
    getDrawState: () => drawState,
    getScene: () => scene,
    getRenderer: () => renderer
  };
})();