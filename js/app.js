// ═══════════════════════════════════════════
// app.js — 主控制器（分章节教材模式）
// ═══════════════════════════════════════════

const App = (() => {

  let currentView = '3d';
  let currentChapter = 1;
  let currentSection = 'theory';
  let currentExampleIdx = 0;
  let currentExerciseIdx = 0;
  let currentExercise = null;
  let currentShapeData = null;
  let solutionActive = false;
  let activeStep = -1;

  function init() {
    setupTabs();
    setupChapterNav();
    setupSectionNav();
    setupPractice();
    setupGuide();
    Engine.initThree('three-canvas');
    Engine.initDrawCanvas('draw-canvas');
    Crash.init();
    loadChapter(1);
  }

  // ── 标签页 ──
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`sec-${tab}`).classList.add('active');
        setTimeout(() => {
          const canvas = document.getElementById('three-canvas');
          if (canvas) {
            Engine.resize3D('three-canvas');
          }
          if (tab === 'crash' && window.Crash) Crash.onShow();
        }, 50);
      });
    });
  }

  // ── 章节导航 ──
  function setupChapterNav() {
    const sel = document.getElementById('chapter-select');
    const chs = Problems.getChapters();
    chs.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch.id;
      opt.textContent = ch.title;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => loadChapter(parseInt(sel.value)));
  }

  function setupSectionNav() {
    document.querySelectorAll('.section-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSection = btn.dataset.section;
        onSectionChange();
      });
    });
  }

  function onSectionChange() {
    document.getElementById('example-nav')?.classList.toggle('visible', currentSection === 'example');
    document.getElementById('exercise-nav')?.classList.toggle('visible', currentSection === 'exercise');
    if (currentSection === 'theory') { showTheory(); hideProblemArea(); hideSolution(); }
    else if (currentSection === 'example') { showExample(); }
    else if (currentSection === 'exercise') { showExercise(); }
  }

  function loadChapter(chId) {
    currentChapter = chId;
    document.getElementById('chapter-select').value = chId;
    const ch = Problems.getChapter(chId);
    if (!ch) return;
    document.getElementById('chapter-title').textContent = ch.title;
    document.getElementById('chapter-subtitle').textContent = ch.subtitle || '';
    const exCount = ch.examples ? ch.examples.length : 0;
    document.getElementById('example-count').textContent = `${exCount} 道例题`;
    document.getElementById('exercise-count').textContent = `${ch.exerciseShapes.length} 种形体 · ${ch.exerciseTypes.length} 种题型`;
    currentSection = 'theory';
    document.querySelectorAll('.section-btn').forEach(b => b.classList.toggle('active', b.dataset.section === 'theory'));
    document.getElementById('example-nav')?.classList.remove('visible');
    document.getElementById('exercise-nav')?.classList.remove('visible');
    showTheory();
  }

  // ── 理论学习 ──
  function showTheory() {
    const ch = Problems.getChapter(currentChapter);
    if (!ch) return;
    const content = document.getElementById('content-area');
    content.style.display = 'block';
    content.innerHTML = ch.theory;
    hide3DModel();
  }

  function hide3DModel() {
    document.getElementById('three-canvas').style.display = 'none';
    document.getElementById('draw-area').style.display = 'none';
    const viewsCanvas = document.getElementById('views-canvas');
    if (viewsCanvas) viewsCanvas.style.display = 'none';
    const ca = document.getElementById('content-area');
    if (ca) ca.style.display = 'block';
  }

  function show3DModel() {
    const threeCanvas = document.getElementById('three-canvas');
    const drawArea = document.getElementById('draw-area');
    const contentArea = document.getElementById('content-area');
    threeCanvas.style.display = 'block';
    drawArea.style.display = 'none';
    if (contentArea && currentSection !== 'theory') contentArea.style.display = 'none';
    requestAnimationFrame(() => {
      Engine.resize3D('three-canvas');
      switchView('3d');
    });
  }

  // ── 例题精讲 ──
  function showExample() {
    const ch = Problems.getChapter(currentChapter);
    if (!ch || !ch.examples || !ch.examples.length) return;
    if (currentExampleIdx >= ch.examples.length) currentExampleIdx = 0;
    const ex = ch.examples[currentExampleIdx];
    if (!ex) return;

    const shapeData = Shapes.getShape(ex.shapeId);
    currentShapeData = shapeData;
    if (shapeData) { Engine.loadShape(shapeData); show3DModel(); }

    document.getElementById('problem-box').style.display = 'block';
    document.getElementById('prob-title').textContent = ex.title;
    document.getElementById('prob-desc').innerHTML = `<b>题目：</b>${ex.problem}`;
    document.getElementById('prob-tags').innerHTML = `
      <span class="tag tag-shape">${shapeData ? shapeData.name : ex.shapeId}</span>
      <span class="tag tag-type">${ex.probType}</span>`;

    const ansArea = document.getElementById('answer-area');
    ansArea.innerHTML = `<div class="answer-card"><h4>📋 参考答案</h4><p style="white-space:pre-line;line-height:1.9">${ex.answer}</p></div>`;
    ansArea.style.display = 'block';

    showExampleSteps(ex.solution);

    const contentArea = document.getElementById('content-area');
    if (contentArea) contentArea.style.display = 'none';
  }

  function showExampleSteps(steps) {
    const panel = document.getElementById('solution-steps');
    panel.innerHTML = '';
    const navDiv = document.createElement('div');
    navDiv.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;justify-content:space-between';
    navDiv.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="btn-step-prev" disabled>← 上一步</button>
      <span style="font-size:12px;color:var(--muted);align-self:center" id="step-indicator">步骤 1 / ${steps.length}</span>
      <button class="btn btn-secondary btn-sm" id="btn-step-next">下一步 →</button>`;
    panel.appendChild(navDiv);

    steps.forEach((step, i) => {
      const card = document.createElement('div');
      card.className = `step-card ${i === 0 ? 'active' : ''}`;
      card.style.opacity = i === 0 ? '1' : '0.4';
      card.style.transition = 'opacity .3s';
      card.innerHTML = `
        <div style="display:flex;align-items:center">
          <span class="step-num">${i + 1}</span>
          <span class="step-title">${step.title}</span>
        </div>
        <div class="step-body">
          <div style="white-space:pre-line;font-size:13.5px;line-height:1.8">${step.content}</div>
          ${step.hint ? `<div class="step-hint">💡 ${step.hint}</div>` : ''}
          ${step.principle ? `<div class="step-principle">📖 原理：${step.principle}</div>` : ''}
        </div>`;
      card.addEventListener('click', () => goToStep(i, steps));
      panel.appendChild(card);
    });

    document.getElementById('btn-step-prev').addEventListener('click', () => goToStep(activeStep - 1, steps));
    document.getElementById('btn-step-next').addEventListener('click', () => goToStep(activeStep + 1, steps));
    goToStep(0, steps);
  }

  function goToStep(idx, steps) {
    if (!steps || idx < 0 || idx >= steps.length) return;
    activeStep = idx;
    const cards = document.querySelectorAll('.step-card');
    cards.forEach((c, i) => { c.classList.toggle('active', i === idx); c.style.opacity = i === idx ? '1' : '0.4'; });
    const prev = document.getElementById('btn-step-prev');
    const next = document.getElementById('btn-step-next');
    const ind = document.getElementById('step-indicator');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === steps.length - 1;
    if (ind) ind.textContent = `步骤 ${idx + 1} / ${steps.length}`;
    cards[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ── 课后习题 ──
  let answerRevealed = false;

  function showExercise() {
    const ch = Problems.getChapter(currentChapter);
    if (!ch) return;
    currentExercise = Problems.generateExercise(currentChapter, currentExerciseIdx);
    if (!currentExercise) return;

    const shapeData = currentExercise.shapeData;
    currentShapeData = shapeData;
    answerRevealed = false;
    Engine.loadShape(shapeData);

    // 隐藏理论内容区，显示3D+视图画布
    const contentArea = document.getElementById('content-area');
    if (contentArea) contentArea.style.display = 'none';

    // 默认展示做题模式：3D + 习题纸面（已知视图+空白待补画）
    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'both'));
    switchView('both');

    document.getElementById('problem-box').style.display = 'block';
    document.getElementById('prob-title').textContent = `第 ${currentChapter} 章 · 习题 ${currentExerciseIdx + 1}`;
    document.getElementById('prob-desc').innerHTML = `<b>题目：</b>${currentExercise.problem}`;
    document.getElementById('prob-tags').innerHTML = `
      <span class="tag tag-shape">${shapeData.name}</span>
      <span class="tag tag-type">${currentExercise.typeName}</span>`;

    const answerArea = document.getElementById('answer-area');
    answerArea.style.display = 'none';
    answerArea.innerHTML = '';
    hideSolution();

    // 更新按钮状态
    const ansBtn = document.getElementById('btn-show-answer');
    if (ansBtn) { ansBtn.textContent = '👁 查看答案'; ansBtn.className = 'btn btn-warn btn-sm'; }
  }

  function revealAnswer() {
    if (!currentExercise) return;
    const answerArea = document.getElementById('answer-area');
    answerArea.innerHTML = `<div class="answer-card"><h4>📋 参考答案</h4><p style="white-space:pre-line;line-height:1.9">${currentExercise.answer}</p></div>`;
    answerArea.style.display = 'block';

    // 切换到答案模式：渲染完整三视图
    answerRevealed = true;
    renderExerciseCanvas();

    // 按钮变"收起答案"
    const ansBtn = document.getElementById('btn-show-answer');
    if (ansBtn) { ansBtn.textContent = '🙈 收起答案'; }
  }

  function hideAnswer() {
    if (!currentExercise) return;
    document.getElementById('answer-area').style.display = 'none';
    answerRevealed = false;
    renderExerciseCanvas();
    const ansBtn = document.getElementById('btn-show-answer');
    if (ansBtn) { ansBtn.textContent = '👁 查看答案'; }
  }

  function renderExerciseCanvas() {
    const viewsCanvas = document.getElementById('views-canvas');
    if (!viewsCanvas || !currentExercise) return;
    requestAnimationFrame(() => {
      const opts = {
        givenViews: currentExercise.givenViews || ['front', 'top'],
        missingView: currentExercise.missingView || 'left',
        showAnswer: answerRevealed
      };
      Engine.renderExercisePaper(currentExercise.shapeData.geometry, viewsCanvas, opts);
    });
  }

  function showExerciseSolution() {
    if (!currentExercise) return;
    solutionActive = true;
    activeStep = 0;
    Engine.loadShape(currentExercise.shapeData);
    showExampleSteps(currentExercise.steps);
    revealAnswer();
  }

  function nextExercise() { currentExerciseIdx++; showExercise(); }
  function prevExercise() { if (currentExerciseIdx > 0) currentExerciseIdx--; showExercise(); }
  function nextExample() {
    const ch = Problems.getChapter(currentChapter);
    if (ch && ch.examples) { currentExampleIdx = (currentExampleIdx + 1) % ch.examples.length; showExample(); }
  }
  function prevExample() {
    const ch = Problems.getChapter(currentChapter);
    if (ch && ch.examples) { currentExampleIdx = (currentExampleIdx - 1 + ch.examples.length) % ch.examples.length; showExample(); }
  }

  // ── 3D视图 ──
  function switchView(view) {
    currentView = view;
    const threeCanvas = document.getElementById('three-canvas');
    const drawArea = document.getElementById('draw-area');
    const viewsCanvas = document.getElementById('views-canvas');

    threeCanvas.style.display = view === 'draw' ? 'none' : 'block';
    drawArea.style.display = view === 'draw' ? 'block' : 'none';
    if (viewsCanvas) viewsCanvas.style.display = view === 'both' ? 'block' : 'none';
    if (view !== 'draw') threeCanvas.style.width = view === 'both' ? '35%' : '100%';

    const renderer = Engine.getRenderer();
    if (renderer) renderer.setSize(threeCanvas.clientWidth || 400, threeCanvas.clientHeight || 300);
    Engine.resize3D('three-canvas');

    if (view === 'draw') {
      requestAnimationFrame(() => {
        const dc = document.getElementById('draw-canvas');
        if (dc) Engine.renderDrawCanvas(dc);
      });
    } else if (view === 'both' && currentShapeData && viewsCanvas) {
      // 习题模式用习题纸面渲染，其他模式用普通三视图
      if (currentSection === 'exercise' && currentExercise) {
        renderExerciseCanvas();
      } else {
        requestAnimationFrame(() => {
          Engine.renderThreeViews(currentShapeData.geometry, viewsCanvas, { helperLines: true, scale: 2.0 });
        });
      }
    }
  }

  function hideProblemArea() {
    document.getElementById('problem-box').style.display = 'none';
    document.getElementById('answer-area').style.display = 'none';
  }

  function hideSolution() {
    solutionActive = false; activeStep = -1;
    document.getElementById('solution-steps').innerHTML = `
      <div style="text-align:center;color:var(--muted);padding:40px 20px;font-size:13px;line-height:1.8">
        <div style="font-size:32px;margin-bottom:12px">📐</div>
        点击 <b style="color:var(--accent)">"📐 逐步解析"</b> 查看解题步骤
      </div>`;
  }

  // ── 教程 ──
  let guideScene, guideCamera, guideRenderer, guideMesh, guideWireframe;
  let guideOrbit = { theta: Math.PI / 4, phi: Math.PI / 5, radius: 150, isDragging: false, lastX: 0, lastY: 0 };

  function setupGuide() {
    document.querySelectorAll('.guide-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.guide-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        showGuide(item.dataset.guide);
      });
    });
    initGuideThree();
    document.getElementById('guide-view-front')?.addEventListener('click', () => setGuideView('front'));
    document.getElementById('guide-view-top')?.addEventListener('click', () => setGuideView('top'));
    document.getElementById('guide-view-left')?.addEventListener('click', () => setGuideView('left'));
    document.getElementById('guide-view-iso')?.addEventListener('click', () => setGuideView('iso'));
    document.getElementById('model-close-btn')?.addEventListener('click', closeModelModal);
    document.getElementById('model-modal')?.addEventListener('click', e => {
      if (e.target.id === 'model-modal') closeModelModal();
    });
    showGuide('1');
  }

  function openModelModal(shapeId) {
    const modal = document.getElementById('model-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    // 等待模态框显示后再加载模型和调整尺寸
    requestAnimationFrame(() => {
      const canvas = document.getElementById('guide-canvas');
      if (canvas && guideRenderer) {
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (cw > 0 && ch > 0) {
          guideCamera.aspect = cw / ch;
          guideCamera.updateProjectionMatrix();
          guideRenderer.setSize(cw, ch);
        }
      }
      loadGuideShape(shapeId);
    });
  }

  function closeModelModal() {
    const modal = document.getElementById('model-modal');
    if (modal) modal.style.display = 'none';
  }

  function initGuideThree() {
    const canvas = document.getElementById('guide-canvas');
    if (!canvas) return;
    const w = canvas.clientWidth || 280;
    const h = canvas.clientHeight || 260;
    guideScene = new THREE.Scene();
    guideCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    guideRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    guideRenderer.setSize(w, h);
    guideRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    guideRenderer.setClearColor(0xf5f0e8, 1);
    guideScene.add(new THREE.AmbientLight(0x404050, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 0.8);
    dl.position.set(50, 80, 60);
    guideScene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x88aaff, 0.3);
    dl2.position.set(-40, 30, -50);
    guideScene.add(dl2);
    const grid = new THREE.GridHelper(100, 10, 0xcccccc, 0xf0ece4);
    grid.position.y = -40;
    guideScene.add(grid);
    updateGuideCamera();
    setupGuideOrbit(canvas);
    guideAnimate();
    // 监听 canvas 尺寸变化（面板显示后尺寸会变）
    const ro = new ResizeObserver(() => {
      const cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (cw > 0 && ch > 0) {
        guideCamera.aspect = cw / ch;
        guideCamera.updateProjectionMatrix();
        guideRenderer.setSize(cw, ch);
      }
    });
    ro.observe(canvas);
  }

  function updateGuideCamera() {
    const { theta, phi, radius } = guideOrbit;
    guideCamera.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    guideCamera.lookAt(0, 0, 0);
  }

  function setupGuideOrbit(canvas) {
    canvas.addEventListener('mousedown', e => { guideOrbit.isDragging = true; guideOrbit.lastX = e.clientX; guideOrbit.lastY = e.clientY; });
    canvas.addEventListener('mousemove', e => {
      if (!guideOrbit.isDragging) return;
      guideOrbit.theta -= (e.clientX - guideOrbit.lastX) * 0.008;
      guideOrbit.phi = Math.max(0.1, Math.min(Math.PI - 0.1, guideOrbit.phi + (e.clientY - guideOrbit.lastY) * 0.008));
      guideOrbit.lastX = e.clientX; guideOrbit.lastY = e.clientY;
      updateGuideCamera();
    });
    canvas.addEventListener('mouseup', () => guideOrbit.isDragging = false);
    canvas.addEventListener('mouseleave', () => guideOrbit.isDragging = false);
    // 触摸：单指旋转（手机端）
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { guideOrbit.isDragging = true; guideOrbit.lastX = e.touches[0].clientX; guideOrbit.lastY = e.touches[0].clientY; }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!guideOrbit.isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      const t0 = e.touches[0];
      guideOrbit.theta -= (t0.clientX - guideOrbit.lastX) * 0.008;
      guideOrbit.phi = Math.max(0.1, Math.min(Math.PI - 0.1, guideOrbit.phi + (t0.clientY - guideOrbit.lastY) * 0.008));
      guideOrbit.lastX = t0.clientX; guideOrbit.lastY = t0.clientY;
      updateGuideCamera();
    }, { passive: false });
    canvas.addEventListener('touchend', () => guideOrbit.isDragging = false);
    canvas.addEventListener('touchcancel', () => guideOrbit.isDragging = false);
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      guideOrbit.radius = Math.max(60, Math.min(350, guideOrbit.radius + e.deltaY * 0.2));
      updateGuideCamera();
    }, { passive: false });
  }

  function guideAnimate() {
    requestAnimationFrame(guideAnimate);
    if (guideMesh) guideMesh.rotation.y += 0.003;
    if (guideRenderer) guideRenderer.render(guideScene, guideCamera);
  }

  function setGuideView(preset) {
    switch (preset) {
      case 'front': guideOrbit.theta = 0; guideOrbit.phi = Math.PI / 2; break;
      case 'top': guideOrbit.phi = 0.01; break;
      case 'left': guideOrbit.theta = Math.PI / 2; guideOrbit.phi = Math.PI / 2; break;
      case 'iso': guideOrbit.theta = Math.PI / 4; guideOrbit.phi = Math.PI / 5; break;
    }
    updateGuideCamera();
  }

  function loadGuideShape(shapeId) {
    const shape = Shapes.getShape(shapeId);
    if (!shape) return;
    if (guideMesh) { guideScene.remove(guideMesh); guideMesh = null; }
    if (guideWireframe) { guideScene.remove(guideWireframe); guideWireframe = null; }
    const geo = shape.geometry;
    geo.computeVertexNormals();
    // 自动计算包围盒，调整相机距离
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    guideOrbit.radius = Math.max(100, maxDim * 3);
    // 居中
    const center = new THREE.Vector3();
    box.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    updateGuideCamera();
    const mat = new THREE.MeshPhongMaterial({ color: 0x4a8fc7, specular: 0x222222, shininess: 30, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    guideMesh = new THREE.Mesh(geo, mat);
    guideScene.add(guideMesh);
    const edges = new THREE.EdgesGeometry(geo, 15);
    guideWireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x888888 }));
    guideScene.add(guideWireframe);
    document.getElementById('guide-shape-name').textContent = shape.name;
    const notes = document.getElementById('guide-notes');
    if (notes) {
      notes.innerHTML = `
        <div style="padding:14px;font-size:13px;line-height:1.8">
          <div style="color:var(--accent);font-weight:600;margin-bottom:8px">${shape.name}</div>
          <div style="color:var(--muted);margin-bottom:8px">${shape.description}</div>
          <div style="color:var(--muted);font-size:12.5px">
            <b style="color:var(--accent2)">特征：</b><br>
            ${shape.features.map(f => `· ${f}`).join('<br>')}
          </div>
          <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border);color:var(--muted);font-size:12px">
            💡 拖动旋转 · 滚轮缩放 · 下方按钮切换视图
          </div>
        </div>
      `;
    }
  }

  function showGuide(id) {
    const chapter = Chapters.getChapter(id);
    if (!chapter) return;
    const container = document.getElementById('guide-content');
    if (!container) return;
    let html = `
      <div class="chapter-header">
        <h2>${chapter.title}</h2>
        <div class="subtitle">${chapter.subtitle}</div>
        <div class="intro">${chapter.intro}</div>
      </div>
      <div class="keypoints-box">
        <h3>📌 本章核心知识点</h3>
        <ul>${chapter.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>
      </div>
    `;
    html += `<div class="section-title examples"><div class="icon">📝</div><h2>典型例题详解</h2><span class="count">${chapter.examples.length} 题</span></div>`;
    chapter.examples.forEach((ex, i) => { html += renderExample(ex, i + 1, chapter.id); });
    html += `<div class="section-title exercises"><div class="icon">✏️</div><h2>课后习题</h2><span class="count">${chapter.exercises.length} 题</span></div>`;
    chapter.exercises.forEach((ex, i) => { html += renderExercise(ex, i + 1, chapter.id); });
    container.innerHTML = html;
    bindExampleEvents(chapter);
    bindExerciseEvents(chapter);
    const gc = document.getElementById('guide-center');
    if (gc) gc.scrollTop = 0;
  }

  function renderExample(ex, idx, chapterId) {
    const stars = '★'.repeat(ex.difficulty) + '☆'.repeat(4 - ex.difficulty);
    const shapeBtn = ex.shapeId ? `<button class="btn-3d" data-shape="${ex.shapeId}">🔍 查看3D模型</button>` : '';
    let optionsHtml = '';
    if (ex.options) {
      optionsHtml = '<div class="options-list">';
      ex.options.forEach((opt, i) => {
        optionsHtml += `<div class="option-item" data-ex="${ex.id}" data-idx="${i}"><span class="opt-label">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`;
      });
      optionsHtml += '</div>';
    }
    return `
      <div class="example-card" id="ex-${ex.id}">
        <div class="example-card-header">
          <span class="num">${idx}</span>
          <span class="title">${ex.title}</span>
          <span class="diff stars">${stars}</span>
          ${shapeBtn}
        </div>
        <div class="example-card-body">
          <div class="question">${ex.question}</div>
          ${optionsHtml}
          <div class="action-row">
            <button class="btn btn-secondary btn-sm" data-action="show-solution" data-ex="${ex.id}">💡 查看解题步骤</button>
            <button class="btn btn-primary btn-sm" data-action="show-answer" data-ex="${ex.id}">✅ 显示答案与解析</button>
          </div>
          <div class="solution-steps-block" id="sol-${ex.id}" style="display:none">
            <div class="method-box">
              <div class="method-title">🧠 解题思路</div>
              <div class="method-content">本题采用 <b>形体分析法</b>，先识别基本体，再分析投影关系，最后判断可见性。</div>
            </div>
            ${ex.solution.map((s, i) => `
              <div class="solution-step">
                <div class="step-head"><span class="step-n">${i + 1}</span><span class="step-t">${s.title}</span></div>
                <div class="step-c">${s.content}</div>
              </div>
            `).join('')}
          </div>
          <div class="answer-reveal" id="ans-${ex.id}" style="display:none">
            <span class="ans-label">✅ 标准答案</span>
            <div class="ans-text">${ex.options ? `<b>${String.fromCharCode(65 + ex.answer)}. ${ex.options[ex.answer]}</b>` : ex.answer}</div>
            <div class="method-box">
              <div class="method-title">📖 解析（教方法）</div>
              <div class="method-content">${ex.analysis}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderExercise(ex, idx, chapterId) {
    const typeMap = { choice: '选择题', fill: '填空题', judge: '判断题', draw: '绘图题' };
    const typeLabel = typeMap[ex.type] || '习题';
    let inputHtml = '';
    if (ex.type === 'choice' && ex.options) {
      inputHtml = '<div class="options-list">';
      ex.options.forEach((opt, i) => {
        inputHtml += `<div class="option-item" data-ex="${ex.id}" data-idx="${i}"><span class="opt-label">${String.fromCharCode(65 + i)}</span><span>${opt}</span></div>`;
      });
      inputHtml += '</div>';
      inputHtml += `<div class="action-row"><button class="btn btn-primary btn-sm" data-action="submit-ex" data-ex="${ex.id}">提交答案</button><button class="btn btn-secondary btn-sm" data-action="show-ans-ex" data-ex="${ex.id}">查看答案解析</button></div>`;
    } else if (ex.type === 'fill') {
      inputHtml = `<input type="text" class="fill-input" data-ex="${ex.id}" placeholder="请输入答案...">`;
      inputHtml += `<div class="action-row"><button class="btn btn-primary btn-sm" data-action="submit-ex" data-ex="${ex.id}">提交答案</button><button class="btn btn-secondary btn-sm" data-action="show-ans-ex" data-ex="${ex.id}">查看答案解析</button></div>`;
    } else if (ex.type === 'judge') {
      inputHtml = `<div class="judge-options">
        <button class="judge-btn" data-ex="${ex.id}" data-val="true">✓ 正确</button>
        <button class="judge-btn" data-ex="${ex.id}" data-val="false">✗ 错误</button>
      </div>`;
      inputHtml += `<div class="action-row"><button class="btn btn-primary btn-sm" data-action="submit-ex" data-ex="${ex.id}">提交答案</button><button class="btn btn-secondary btn-sm" data-action="show-ans-ex" data-ex="${ex.id}">查看答案解析</button></div>`;
    } else if (ex.type === 'draw') {
      const shapeBtn = ex.shapeId ? `<button class="btn-3d" data-shape="${ex.shapeId}">🔍 查看3D模型</button>` : '';
      inputHtml = `<div style="margin:8px 0;color:var(--muted);font-size:13px">请在草稿纸上作答，完成后对照参考答案。${shapeBtn}</div>`;
      inputHtml += `<div class="action-row"><button class="btn btn-secondary btn-sm" data-action="show-ans-ex" data-ex="${ex.id}">查看参考答案与解析</button></div>`;
    }
    return `
      <div class="exercise-card" id="exer-${ex.id}">
        <div class="exercise-card-header">
          <span class="ex-num">${idx}</span>
          <span class="ex-title">${ex.question}</span>
          <span class="ex-type">${typeLabel}</span>
        </div>
        <div class="exercise-card-body">
          ${inputHtml}
          <div class="answer-reveal" id="ans-${ex.id}" style="display:none">
            <span class="ans-label">✅ 答案</span>
            <div class="ans-text">${formatAnswer(ex)}</div>
            <div class="method-box">
              <div class="method-title">📖 解析（教方法）</div>
              <div class="method-content">${ex.analysis}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function formatAnswer(ex) {
    if (ex.type === 'choice') return `<b>${String.fromCharCode(65 + ex.answer)}. ${ex.options[ex.answer]}</b>`;
    if (ex.type === 'judge') return `<b>${ex.answer ? '正确' : '错误'}</b>`;
    if (ex.type === 'draw') return `<div class="draw-ref"><div class="ref-title">📐 参考答案</div><div class="ref-content">${ex.answer}</div></div>`;
    return `<b>${ex.answer}</b>`;
  }

  function bindExampleEvents(chapter) {
    document.querySelectorAll('.example-card [data-shape]').forEach(btn => {
      btn.addEventListener('click', () => {
        openModelModal(btn.dataset.shape);
      });
    });
    document.querySelectorAll('.example-card .option-item').forEach(item => {
      item.addEventListener('click', () => {
        item.parentElement.querySelectorAll('.option-item').forEach(s => s.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
    document.querySelectorAll('[data-action="show-solution"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sol = document.getElementById('sol-' + btn.dataset.ex);
        if (sol) { sol.style.display = sol.style.display === 'none' ? 'block' : 'none'; btn.textContent = sol.style.display === 'none' ? '💡 查看解题步骤' : '🙈 收起解题步骤'; }
      });
    });
    document.querySelectorAll('.example-card [data-action="show-answer"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ans = document.getElementById('ans-' + btn.dataset.ex);
        if (ans) { ans.style.display = ans.style.display === 'none' ? 'block' : 'none'; btn.textContent = ans.style.display === 'none' ? '✅ 显示答案与解析' : '🙈 收起答案'; }
      });
    });
  }

  function bindExerciseEvents(chapter) {
    document.querySelectorAll('.exercise-card .option-item').forEach(item => {
      item.addEventListener('click', () => {
        const card = item.closest('.exercise-card');
        card.querySelectorAll('.option-item').forEach(s => s.classList.remove('selected'));
        item.classList.add('selected');
        card.dataset.userAnswer = item.dataset.idx;
      });
    });
    document.querySelectorAll('.judge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.exercise-card');
        card.querySelectorAll('.judge-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        card.dataset.userAnswer = btn.dataset.val;
      });
    });
    document.querySelectorAll('[data-action="submit-ex"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const exId = btn.dataset.ex;
        const exercise = chapter.exercises.find(e => e.id === exId);
        if (!exercise) return;
        const card = document.getElementById('exer-' + exId);
        submitExercise(card, exercise);
      });
    });
    document.querySelectorAll('[data-action="show-ans-ex"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ans = document.getElementById('ans-' + btn.dataset.ex);
        if (ans) ans.style.display = ans.style.display === 'none' ? 'block' : 'none';
      });
    });
  }

  function submitExercise(card, exercise) {
    let userAns = card.dataset.userAnswer;
    let isCorrect = false;
    if (exercise.type === 'choice') {
      if (userAns === undefined) { alert('请先选择一个选项'); return; }
      isCorrect = parseInt(userAns) === exercise.answer;
      card.querySelectorAll('.option-item').forEach((item, i) => {
        item.classList.remove('selected');
        if (i === exercise.answer) item.classList.add('correct');
        else if (parseInt(userAns) === i) item.classList.add('wrong');
      });
    } else if (exercise.type === 'judge') {
      if (userAns === undefined) { alert('请先选择正确或错误'); return; }
      const userBool = userAns === 'true';
      isCorrect = userBool === exercise.answer;
      card.querySelectorAll('.judge-btn').forEach(btn => {
        btn.classList.remove('selected');
        const btnVal = btn.dataset.val === 'true';
        if (btnVal === exercise.answer) btn.classList.add('correct');
        else if (btnVal === userBool) btn.classList.add('wrong');
      });
    } else if (exercise.type === 'fill') {
      const input = card.querySelector('.fill-input');
      userAns = input.value.trim();
      if (!userAns) { alert('请输入答案'); return; }
      isCorrect = userAns.includes(exercise.answer) || exercise.answer.includes(userAns);
      input.classList.remove('correct', 'wrong');
      input.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    const oldBadge = card.querySelector('.result-badge');
    if (oldBadge) oldBadge.remove();
    const resultBadge = document.createElement('span');
    resultBadge.className = 'result-badge ' + (isCorrect ? 'correct' : 'wrong');
    resultBadge.textContent = isCorrect ? '✓ 回答正确' : '✗ 回答错误';
    const actionRow = card.querySelector('.action-row');
    if (actionRow) actionRow.appendChild(resultBadge);
    const ans = document.getElementById('ans-' + exercise.id);
    if (ans) ans.style.display = 'block';
  }

  // ── 按钮绑定 ──
  function setupPractice() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        switchView(btn.dataset.view);
      });
    });
    document.getElementById('btn-chapter-prev')?.addEventListener('click', () => {
      if (currentChapter - 1 >= 1) loadChapter(currentChapter - 1);
    });
    document.getElementById('btn-chapter-next')?.addEventListener('click', () => {
      const chs = Problems.getChapters();
      if (currentChapter + 1 <= chs.length) loadChapter(currentChapter + 1);
    });
    document.getElementById('btn-ex-prev')?.addEventListener('click', prevExample);
    document.getElementById('btn-ex-next')?.addEventListener('click', nextExample);
    document.getElementById('btn-exer-prev')?.addEventListener('click', prevExercise);
    document.getElementById('btn-exer-next')?.addEventListener('click', nextExercise);
    document.getElementById('btn-show-answer')?.addEventListener('click', () => {
      if (answerRevealed) hideAnswer(); else revealAnswer();
    });
    document.getElementById('btn-show-solution')?.addEventListener('click', showExerciseSolution);
  }

  // ═══════════════════════════════════════
  return {
    init
  };
})();

window.addEventListener('DOMContentLoaded', () => App.init());