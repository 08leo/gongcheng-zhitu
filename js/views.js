// ═══════════════════════════════════════════
// views.js — 三视图 SVG 数据
// 每个视图统一 viewBox="0 0 100 100"，图形居中
// 线型：粗实线(可见轮廓) stroke:#1a2733 stroke-width:2
//       细虚线(不可见)   stroke:#888 stroke-width:1 stroke-dasharray
//       细点画线(轴线)  stroke:#d44 stroke-width:1 stroke-dasharray
// ═══════════════════════════════════════════

const Views = (() => {

  const SOLID = 'stroke:#1a2733;stroke-width:2;fill:none';
  const DASH  = 'stroke:#999;stroke-width:1.2;fill:none;stroke-dasharray:4,3';
  const AXIS  = 'stroke:#d44;stroke-width:1;fill:none;stroke-dasharray:6,2,1,2';

  // 通用：在 100x100 画布居中绘制一个矩形
  function rect(cx, cy, w, h, style) {
    return `<rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" style="${style||SOLID}"/>`;
  }

  // 通用：圆
  function circle(cx, cy, r, style) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" style="${style||SOLID}"/>`;
  }

  // 通用：线
  function line(x1, y1, x2, y2, style) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="${style||SOLID}"/>`;
  }

  // 轴线（十字点画线）
  function axis(cx, cy, size) {
    const s = size || 42;
    return `<line x1="${cx-s}" y1="${cy}" x2="${cx+s}" y2="${cy}" style="${AXIS}"/><line x1="${cx}" y1="${cy-s}" x2="${cx}" y2="${cy+s}" style="${AXIS}"/>`;
  }

  // 包裹 SVG
  function svg(inner) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">${inner}</svg>`;
  }

  // ═══════════════════════════════════════
  // 1. 长方体 (box): 长80 高60 宽50
  // ═══════════════════════════════════════
  const box = {
    front: svg(rect(50,50,80,60)),
    top:   svg(rect(50,50,80,50)),
    left:  svg(rect(50,50,50,60))
  };

  // ═══════════════════════════════════════
  // 2. 圆柱体 (cylinder): 直径60 高80
  // ═══════════════════════════════════════
  const cylinder = {
    front: svg(rect(50,50,60,80) + axis(50,50,32)),
    top:   svg(circle(50,50,30) + axis(50,50,34)),
    left:  svg(rect(50,50,60,80) + axis(50,50,32))
  };

  // ═══════════════════════════════════════
  // 3. 圆锥 (cone): 底直径60 高70
  // ═══════════════════════════════════════
  const cone = {
    // 三角形：顶点在上，底边在下
    front: svg(`<polygon points="50,15 20,85 80,85" style="${SOLID}"/>` + axis(50,50,36)),
    top:   svg(circle(50,50,30) + axis(50,50,34)),
    left:  svg(`<polygon points="50,15 20,85 80,85" style="${SOLID}"/>` + axis(50,50,36))
  };

  // ═══════════════════════════════════════
  // 4. 阶梯圆柱 (stepped-cyl): 下大(Φ80,h35) 上小(Φ50,h40)
  // ═══════════════════════════════════════
  const steppedCyl = {
    // 主视图：下部大矩形 + 上部小矩形，居中
    front: svg(
      // 下部大矩形
      rect(50, 67.5, 80, 35) +
      // 上部小矩形（居中叠加）
      rect(50, 30, 50, 40) +
      axis(50, 50, 44)
    ),
    // 俯视图：两个同心圆
    top: svg(
      circle(50,50,40) +
      circle(50,50,25) +
      axis(50,50,44)
    ),
    // 左视图：同主视图
    left: svg(
      rect(50, 67.5, 80, 35) +
      rect(50, 30, 50, 40) +
      axis(50, 50, 44)
    )
  };

  // ═══════════════════════════════════════
  // 5. L型块 (L-block): 底80×50×20, 立板20×50×60 在左侧
  // ═══════════════════════════════════════
  const lBlock = {
    // 主视图：L形 — 下部矩形80×20 + 左侧立板20×60
    front: svg(`<path d="M10,80 L90,80 L90,60 L30,60 L30,20 L10,20 Z" style="${SOLID}"/>`),
    // 俯视图：矩形80×50，左侧有立板投影的分割线
    top: svg(
      rect(50,50,80,50) +
      line(30, 25, 30, 75)  // 立板与底板的分界线
    ),
    // 左视图：矩形50×80 （从左看，立板和底板叠加成一个矩形，有一条虚线表示立板右边缘）
    left: svg(
      rect(50,50,50,80) +
      // 立板右边缘在左视图中不可见 → 虚线
      `<line x1="70" y1="20" x2="70" y2="80" style="${DASH}"/>`
    )
  };

  // ═══════════════════════════════════════
  // 6. 开槽圆柱 (cyl-notch): 圆柱Φ60高70，顶部开矩形槽（宽30深20）
  // ═══════════════════════════════════════
  const cylNotch = {
    // 主视图：矩形，顶部有凹口
    front: svg(`<path d="M20,85 L20,20 L35,20 L35,40 L65,40 L65,20 L80,20 L80,85 Z" style="${SOLID}"/>` + axis(50,52.5,36)),
    // 俯视图：圆 + 两条平行弦（槽的投影）
    top: svg(
      circle(50,50,30) +
      line(35, 25, 35, 75) +  // 槽左壁
      line(65, 25, 65, 75) +  // 槽右壁
      axis(50,50,34)
    ),
    // 左视图：矩形 + 槽底虚线（槽底在左视图中不可见）
    left: svg(
      rect(50,50,60,70) +
      // 槽底投影线（虚线）
      `<line x1="20" y1="40" x2="80" y2="40" style="${DASH}"/>` +
      axis(50,50,36)
    )
  };

  // ═══════════════════════════════════════
  // 7. 三棱柱 (tri-prism): 正三棱柱 底面三角形边长60 高50
  // ═══════════════════════════════════════
  const triPrism = {
    // 主视图：矩形（棱柱的一个矩形面）
    front: svg(rect(50,50,52,50)),
    // 俯视图：正三角形
    top: svg(`<polygon points="50,22 76,66 24,66" style="${SOLID}"/>`),
    // 左视图：矩形 + 棱线（虚线，因为从左看第三条棱被遮挡）
    left: svg(
      rect(50,50,52,50) +
      // 中间棱线可见（最前棱）→ 粗实线
      line(50,25,50,75)
    )
  };

  // ═══════════════════════════════════════
  // 8. 圆柱斜切 (cyl-angle-cut): 圆柱Φ60高80，上部被正垂面斜切
  // ═══════════════════════════════════════
  const cylAngleCut = {
    // 主视图：矩形 + 斜线（切口投影）
    front: svg(`<path d="M20,85 L20,30 L80,15 L80,85 Z" style="${SOLID}"/>` + axis(50,55,36)),
    // 俯视图：圆（斜切后俯视图仍是圆，因为截平面垂直于正面）
    top: svg(circle(50,50,30) + axis(50,50,34)),
    // 左视图：矩形 + 椭圆弧（截交线的投影）
    left: svg(
      rect(50,55,60,70) +  // 注意矩形高度从30到85
      // 截交线在左视图投影为椭圆弧
      `<path d="M20,30 Q50,18 80,30" style="${SOLID}"/>` +
      axis(50,55,36)
    )
  };

  // ═══════════════════════════════════════
  // 9. 带孔方块 (cyl-hole): 方块80×60×60，中间开通孔Φ30
  // ═══════════════════════════════════════
  const cylHole = {
    // 主视图：矩形 + 孔的虚线（不可见）
    front: svg(
      rect(50,50,80,60) +
      // 孔的上下轮廓（虚线）
      `<line x1="35" y1="35" x2="65" y2="35" style="${DASH}"/>` +
      `<line x1="35" y1="65" x2="65" y2="65" style="${DASH}"/>`
    ),
    // 俯视图：矩形 + 两条虚线（孔的左右轮廓）
    top: svg(
      rect(50,50,80,60) +
      `<line x1="35" y1="35" x2="35" y2="65" style="${DASH}"/>` +
      `<line x1="65" y1="35" x2="65" y2="65" style="${DASH}"/>`
    ),
    // 左视图：矩形 + 圆（孔是可见的，因为从左看孔是通的）
    left: svg(
      rect(50,50,60,60) +
      circle(50,50,15) +
      axis(50,50,18)
    )
  };

  // ═══════════════════════════════════════
  // 10. 半圆头块 (half-cyl-block): 矩形+半圆柱头组合
  // 长80 高50，右端半圆柱头R25
  // ═══════════════════════════════════════
  const halfCylBlock = {
    // 主视图：矩形(80×50)
    front: svg(rect(50,50,80,50)),
    // 俯视图：矩形左端 + 右端半圆
    top: svg(`<path d="M10,25 L65,25 A25,25 0 0 1 65,75 L10,75 Z" style="${SOLID}"/>`),
    // 左视图：矩形(50×50)
    left: svg(rect(50,50,50,50))
  };

  // ═══════════════════════════════════════
  // 数据注册
  // ═══════════════════════════════════════
  const viewMap = {
    'box': box,
    'cylinder': cylinder,
    'cone': cone,
    'stepped-cyl': steppedCyl,
    'l-block': lBlock,
    'cyl-notch': cylNotch,
    'tri-prism': triPrism,
    'cyl-angle-cut': cylAngleCut,
    'cyl-hole': cylHole,
    'half-cyl-block': halfCylBlock
  };

  function getViews(shapeId) {
    return viewMap[shapeId] || null;
  }

  // 视图名称映射
  const VIEW_NAMES = {
    front: '主视图',
    top: '俯视图',
    left: '左视图'
  };

  // 生成三视图布局 HTML
  // options: { given: ['front','top'], missing: 'left', showAnswer: true }
  function renderLayout(shapeId, options) {
    const views = getViews(shapeId);
    if (!views) return '<div style="color:var(--danger)">视图数据缺失</div>';
    const opt = options || {};
    const given = opt.given || ['front', 'top'];
    const missing = opt.missing || 'left';
    const showAnswer = !!opt.showAnswer;

    // 标准三视图布局：主视图左上，俯视图左下，左视图右
    // 用 grid 布局
    const cell = (key, label, isGiven, isMissing) => {
      if (isMissing && !showAnswer) {
        // 待补全占位
        return `<div class="view-cell missing">
          <div class="view-label">${label}（待补全）</div>
          <div class="view-svg placeholder">
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px;border:2px dashed var(--border);border-radius:6px">
              ✏️ 请补画
            </div>
          </div>
        </div>`;
      }
      const content = views[key] || '';
      return `<div class="view-cell ${isGiven ? 'given' : 'answer'}">
        <div class="view-label">${label}${isMissing && showAnswer ? ' ✅' : ''}</div>
        <div class="view-svg">${content}</div>
      </div>`;
    };

    return `<div class="three-view-layout">
      ${cell('front', '主视图', given.includes('front'), missing === 'front')}
      ${cell('left', '左视图', given.includes('left'), missing === 'left')}
      ${cell('top', '俯视图', given.includes('top'), missing === 'top')}
    </div>`;
  }

  return { getViews, renderLayout, VIEW_NAMES };
})();
