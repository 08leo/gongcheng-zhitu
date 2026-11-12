// ═══════════════════════════════════════════
// problems.js — 分章节教材体系
// 每章：理论学习 → 例题精讲 → 课后习题（含答案）
// ═══════════════════════════════════════════

const Problems = (() => {

  let currentExercise = null;
  let score = 0;

  // ── 题型定义 ──
  const probTypes = {
    'third-view':      { name: '补画第三视图',     icon: '▭' },
    'axis-to-3view':   { name: '由轴测图画三视图', icon: '◇' },
    '3view-to-axis':   { name: '由三视图画轴测图', icon: '△' },
    'section-curve':   { name: '求截交线',         icon: '⊘' },
    'intersect-curve': { name: '求相贯线',         icon: '⊗' },
    'missing-lines':   { name: '补全缺失线条',     icon: '▤' },
    'hidden-lines':    { name: '判断可见性',       icon: '◫' },
  };

  // ═══════════════════════════════════════════
  // 章节数据 — 每章含 理论/例题/习题
  // ═══════════════════════════════════════════
  const chapters = [

    // ┌───────────────────────────────────────┐
    // │  第一章 三视图基础与基本体            │
    // └───────────────────────────────────────┘
    {
      id: 1,
      title: '第一章 三视图基础',
      subtitle: '投影法 · 基本体三视图 · 投影规律',
      theory: `
<h3>一、什么是正投影法</h3>
<p>正投影法用平行光线垂直照射投影面，得到二维图形。工程制图中采用的<b>第一角画法</b>：</p>
<div class="guide-box">
  <p>🔹 <b>主视图（V面）</b>：从前向后看 → 反映<b>长</b>和<b>高</b></p>
  <p>🔹 <b>俯视图（H面）</b>：从上向下看 → 反映<b>长</b>和<b>宽</b></p>
  <p>🔹 <b>左视图（W面）</b>：从左向右看 → 反映<b>宽</b>和<b>高</b></p>
</div>

<h3>二、三视图核心规律</h3>
<div class="guide-highlight">
  <p style="font-size:16px;margin-bottom:8px"><b>口诀：长对正、高平齐、宽相等</b></p>
  <p>• <b>长对正</b>：主视图与俯视图左右等长（竖直方向对齐）</p>
  <p>• <b>高平齐</b>：主视图与左视图上下等高（水平方向对齐）</p>
  <p>• <b>宽相等</b>：俯视图与左视图前后等宽（用45°辅助线转移）</p>
</div>

<h3>三、基本体的三视图特征</h3>
<table class="guide-table">
  <tr><th>形体</th><th>主视图</th><th>俯视图</th><th>左视图</th></tr>
  <tr><td>圆柱</td><td>矩形</td><td>圆</td><td>矩形</td></tr>
  <tr><td>圆锥</td><td>等腰三角形</td><td>圆+圆心</td><td>等腰三角形</td></tr>
  <tr><td>球</td><td>圆</td><td>圆</td><td>圆</td></tr>
  <tr><td>正四棱柱</td><td>矩形</td><td>正方形</td><td>矩形</td></tr>
  <tr><td>正三棱柱</td><td>矩形+竖线</td><td>三角形</td><td>矩形</td></tr>
  <tr><td>圆台</td><td>等腰梯形</td><td>同心圆</td><td>等腰梯形</td></tr>
  <tr><td>正四棱锥</td><td>等腰三角形</td><td>正方形+对角线</td><td>等腰三角形</td></tr>
</table>

<div class="step-hint" style="margin-top:16px">💡 <b>学习方法：</b>先选"例题精讲"看懂解题过程，再做"课后习题"练习。做题时先在绘图区尝试画，再用"查看答案"对照。</div>`,
      examples: [
        {
          title: '例题1-1：正四棱柱的三视图',
          shapeId: 'box',
          probType: 'third-view',
          problem: '已知正四棱柱(50×60×50)的主视图和俯视图，求左视图。',
          solution: [
            { title: '分析形体', content: '正四棱柱：底面为正方形(50×50)，高60。\n四个侧面都是矩形(50×60)。\n前后左右四个面完全对称。' },
            { title: '看主视图', content: '从前向后看：\n• 看到前面的正方形面，投影为 50×60 的矩形\n• 四个竖棱都重合为矩形的四条边\n• 结论：主视图 = 50宽 × 60高的矩形' },
            { title: '看俯视图', content: '从上向下看：\n• 看到顶面正方形(50×50)\n• 四个竖棱投影为正方形的四条边\n• 结论：俯视图 = 50×50 正方形' },
            { title: '求左视图', content: '从左向右看：\n• 宽 = 50（与俯视图宽度一致，宽相等）\n• 高 = 60（与主视图高度一致，高平齐）\n• 结论：左视图 = 50宽 × 60高的矩形\n\n与主视图完全相同（因为前后左右对称）' },
            { title: '验证', content: '✓ 长对正：主视图宽50 = 俯视图宽50\n✓ 高平齐：主视图高60 = 左视图高60\n✓ 宽相等：俯视图深50 = 左视图宽50\n\n答案：左视图为一个 50×60 的矩形，无内部线条。' }
          ],
          answer: '左视图为一个50×60的矩形，无任何内部线条（因为四棱柱四面对称，左看与主看完全相同）。'
        },
        {
          title: '例题1-2：圆柱的三视图',
          shapeId: 'cylinder',
          probType: 'third-view',
          problem: '已知圆柱体(r=30,h=60)的主视图为矩形(60×60)，俯视图为圆(⌀60)，求左视图。',
          solution: [
            { title: '分析形体', content: '圆柱体：底面圆(r=30)，高60。\n主视图：矩形（宽=2r=60，高=h=60）\n俯视图：圆（⌀60）' },
            { title: '找投影对应', content: '主视图 → 反映 X方向(长)和 Y方向(高)\n俯视图 → 反映 X方向(长)和 Z方向(宽)\n左视图 → 需要反映 Z方向(宽)和 Y方向(高)\n\n从俯视图取Z方向宽度 = ⌀60 = 60\n从主视图取Y方向高度 = 60' },
            { title: '求左视图', content: '左视图宽 = 60（来自俯视图的宽度/直径）\n左视图高 = 60（来自主视图的高度）\n\n圆柱体左右对称，所以：\n左视图 = 60×60 的矩形（与主视图相同）' },
            { title: '关键要点', content: '圆柱体三视图规律：\n• 主视图 + 左视图 = 相同矩形（宽=高=60）\n• 俯视图 = 圆\n• 无内部线条（圆柱侧面光滑，无棱线）\n\n✏️ 常见错误：在左视图中多画一条竖线（不需要，圆柱没有棱角）' }
          ],
          answer: '左视图为60×60的矩形，与主视图完全相同。圆柱体左右对称，主左视图都是宽=⌀、高=h的矩形。'
        },
        {
          title: '例题1-3：圆锥的三视图',
          shapeId: 'cone',
          probType: 'missing-lines',
          problem: '已知圆锥(r=35,h=55)的主视图和俯视图，俯视图缺少什么？请补全。',
          solution: [
            { title: '分析俯视图', content: '从上向下看圆锥：\n• 看到底面圆(r=35)\n• 看到顶点（圆心处）\n• 母线投影为从圆心到圆周的辐射线' },
            { title: '找出缺失', content: '俯视图中容易遗漏的线条：\n1. 圆心（顶点S的投影）— 必须有\n2. 如果顶点和底面不重合，圆心要标注\n\n对于正圆锥：顶点投影正好在圆心上，只需画圆心标记。' },
            { title: '补全俯视图', content: '俯视图应有的内容：\n① 底面圆（⌀70）— 粗实线\n② 圆心（顶点投影）— 点划线交叉\n③ 底面圆的圆心线 — 细点画线（中心线）\n\n不需要画辐射线！因为圆锥母线没有积聚性，投影时无数条母线与轮廓线重合。' },
            { title: '总结', content: '圆锥俯视图 = 圆 + 圆心（+中心线）\n\n✏️ 常见错误：\n• 漏画圆心（顶点必须标注）\n• 多画辐射线（不需要）' }
          ],
          answer: '俯视图应补画圆心点（顶点投影）和细点画线中心线。圆锥俯视图只有圆+圆心，不画辐射线。'
        }
      ],
      exerciseShapes: ['box','cylinder','cone','sphere','prism3','hex-prism','frustum','pyramid','bicone'],
      exerciseTypes: ['third-view','axis-to-3view','3view-to-axis','missing-lines','hidden-lines']
    },

    // ┌───────────────────────────────────────┐
    // │  第二章 组合体的三视图                │
    // └───────────────────────────────────────┘
    {
      id: 2,
      title: '第二章 组合体',
      subtitle: '叠加 · 相交 · 相切 · 形体分解',
      theory: `
<h3>一、组合体的分析方法</h3>
<div class="guide-box">
  <p><b>形体分解法（核心方法）：</b></p>
  <p>把组合体拆分为若干基本体的组合，逐一分析每个基本体的投影，再合并。</p>
</div>

<h3>二、组合方式</h3>
<table class="guide-table">
  <tr><th>组合方式</th><th>特征</th><th>投影特点</th></tr>
  <tr><td><b>叠加</b></td><td>一个放在另一个上面</td><td>各自轮廓都在，注意遮挡</td></tr>
  <tr><td><b>相交</b></td><td>互相穿透</td><td>产生相贯线（交线）</td></tr>
  <tr><td><b>相切</b></td><td>表面光滑过渡</td><td>无交线，轮廓连续</td></tr>
</table>

<h3>三、解题步骤</h3>
<ol style="line-height:2.2">
  <li><b>分解形体</b>：识别由哪些基本体组成</li>
  <li><b>确定关系</b>：各基本体之间是叠加、相交还是相切</li>
  <li><b>分别投影</b>：每个基本体在三视图中的形状</li>
  <li><b>合并处理</b>：去掉被遮挡的轮廓线，保留可见轮廓</li>
  <li><b>判断虚实</b>：朝向观察者=实线，被遮挡=虚线</li>
</ol>

<h3>四、常见机械结构</h3>
<div class="guide-highlight">
  <p>• <b>凸台</b>：零件表面的凸起圆柱，三视图中表现为圆+矩形</p>
  <p>• <b>肋板</b>：加强薄板，三视图为窄矩形</p>
  <p>• <b>凹腔</b>：零件表面的凹坑，三视图用虚线表示</p>
  <p>• <b>轴孔</b>：穿透零件的圆柱孔，三视图用虚线圆/虚线矩形</p>
</div>

<div class="step-hint" style="margin-top:16px">💡 做组合体题目时，先"拆"再"合"。拆错了，后面全错。拆对了，三视图就简单了。</div>`,
      examples: [
        {
          title: '例题2-1：圆柱+圆锥组合体',
          shapeId: 'cyl-cone',
          probType: 'third-view',
          problem: '已知底部圆柱(r=30,h=35)上叠加顶部圆锥(r=30,h=30)，补画俯视图。',
          solution: [
            { title: '分解形体', content: '组合体由两部分组成：\n① 下部：圆柱 r=30, h=35\n② 上部：圆锥 r=30, h=30\n\n位置关系：叠加。圆锥底面与圆柱顶面重合（同轴、同半径）。' },
            { title: '分别投影', content: '圆柱的俯视图：⌀60 的圆\n圆锥的俯视图：⌀60 的圆 + 圆心\n\n两个圆直径相同！所以俯视图只有一个圆 + 圆心。' },
            { title: '合并', content: '圆柱顶面 = 圆锥底面 = ⌀60 圆\n从上方看，只能看到圆锥的斜面（不看到圆柱顶面）。\n\n俯视图 = 一个⌀60的圆 + 圆心（圆锥顶点投影）\n\n圆心用细点画线交叉标记。' },
            { title: '验证三视图', content: '主视图：下部矩形(60×35) + 上部三角形(底60,高30)\n俯视图：⌀60 圆 + 圆心\n左视图：与主视图相同（回转体左右对称）\n\n✓ 长对正、高平齐、宽相等均满足。' }
          ],
          answer: '俯视图为一个⌀60的圆，圆心处有一点（圆锥顶点投影）+ 细点画线中心线。圆柱和圆锥同径叠加，俯视图不显示分界线。'
        },
        {
          title: '例题2-2：带凸台方块',
          shapeId: 'block-with-boss',
          probType: 'missing-lines',
          problem: '方块(60×30×50)顶部中央加圆柱凸台(r=15,h=20)，补全主视图中缺少的线条。',
          solution: [
            { title: '分解形体', content: '① 底部方块：60(宽)×30(高)×50(深)\n② 顶部凸台：圆柱 r=15, h=20\n位置：凸台底面中心在方块顶面正中' },
            { title: '凸台主视图分析', content: '凸台是圆柱，主视图为矩形：\n• 宽 = 2r = 30\n• 高 = 20\n\n凸台底部在方块顶面(y=30)，凸台顶部在 y=50。\n所以凸台在主视图中是：以中心线对称的 30×20 矩形。' },
            { title: '主视图完整内容', content: '主视图应有：\n① 方块外轮廓：60×30 矩形（粗实线）\n② 凸台轮廓：顶部居中 30×20 矩形（粗实线）\n③ 凸台与方块顶面的交线：方块顶面横线（已有）\n\n常见缺失：如果主视图中方块顶面没有画出凸台，\n需要补画凸台的矩形轮廓。' },
            { title: '左视图', content: '从左向右看：\n方块：50(深)×30(高) 矩形\n凸台：主视图中凸台宽度 = 30（沿Z方向也是30，因为圆柱）\n但凸台深度方向在左视图中也投影为30宽矩形。\n\n左视图 = 50×30矩形 + 顶部居中30×20矩形' }
          ],
          answer: '主视图应补画凸台的30×20矩形轮廓（位于方块顶面中央）。方块顶面横线与凸台底边重合，不需要重复画。'
        }
      ],
      exerciseShapes: ['cyl-cone','stepped-cyl','sph-cyl','triple-comp','prism-cyl','cyl-frustum','step-prism','half-cyl','base-with-rib','block-with-boss','stepped-block'],
      exerciseTypes: ['third-view','missing-lines','hidden-lines','axis-to-3view']
    },

    // ┌───────────────────────────────────────┐
    // │  第三章 截交线                        │
    // └───────────────────────────────────────┘
    {
      id: 3,
      title: '第三章 截交线',
      subtitle: '截平面 · 特殊点 · 一般点 · 可见性',
      theory: `
<h3>一、截交线是什么</h3>
<div class="guide-box">
  <p><b>截交线</b> = 截平面与回转体曲面的交线</p>
  <p>截交线的形状取决于<b>截平面与回转体轴线的相对位置</b>。</p>
</div>

<h3>二、截交线类型速查表</h3>
<table class="guide-table">
  <tr><th>截平面位置</th><th>截交线形状</th><th>说明</th></tr>
  <tr><td>⊥ 轴线</td><td style="color:var(--accent2)">圆</td><td>与底面平行</td></tr>
  <tr><td>锐角夹角,不过底面</td><td style="color:var(--accent2)">椭圆</td><td>最常见情况</td></tr>
  <tr><td>∥ 母线</td><td style="color:var(--accent2)">抛物线</td><td>截平面过底面圆</td></tr>
  <tr><td>锐角夹角,过底面</td><td style="color:var(--accent2)">双曲线</td><td>穿透底面</td></tr>
</table>

<h3>三、求解步骤</h3>
<ol style="line-height:2.2">
  <li><b>找特殊点</b>：最高点、最低点、最左点、最右点、可见性分界点</li>
  <li><b>找一般点</b>：用辅助素线法，在曲面上取辅助线求交点</li>
  <li><b>光滑连线</b>：按顺序光滑连接所有点</li>
  <li><b>判断可见性</b>：朝向观察者=实线，被遮挡=虚线</li>
</ol>

<h3>四、特殊点如何确定</h3>
<div class="guide-highlight">
  <p><b>关键：</b>特殊点在具有积聚性的视图上可以直接读出。</p>
  <p>例如：圆柱主视图的左右轮廓线就是转向轮廓素线，截交线与之相交的点就是最左点和最右点。</p>
</div>

<div class="step-hint" style="margin-top:16px">💡 截交线是"骨架先搭后填肉"：先找特殊点搭出形状，再用一般点让曲线光滑。</div>`,
      examples: [
        {
          title: '例题3-1：圆柱斜切（40°）',
          shapeId: 'cyl-angle-cut',
          probType: 'section-curve',
          problem: '圆柱(r=30,h=80)顶部被40°斜面切割，求各视图中的截交线。',
          solution: [
            { title: '分析切割', content: '原始形体：圆柱 r=30, h=80\n切割面：与水平面成40°角（即与轴线成50°）\n切割面与轴线成锐角且不过底面 → <b>截交线为椭圆</b>' },
            { title: '主视图中的截交线', content: '主视图：\n• 切割面投影为一条倾斜的直线（与水平成40°）\n• 圆柱轮廓：两侧竖直线\n• 截交线 = 这条倾斜直线\n\n在主视图中截交线是直线（因为截平面正对观察者投影为直线）。' },
            { title: '俯视图中的截交线', content: '俯视图：\n• 底面圆不变（⌀60）\n• 截交线为椭圆\n• 椭圆的长轴 = 圆柱直径 = 60（沿X方向不变）\n• 椭圆的短轴 < 60（因为被斜切压缩）\n\n椭圆中心与底面圆心一致。' },
            { title: '左视图中的截交线', content: '左视图：\n• 切割面与左视图的投影方向不垂直\n• 截交线投影为椭圆弧\n• 椭圆在左视图中被压缩得更短' },
            { title: '可见性判断', content: '主视图：截交线前半可见（实线），后半不可见（虚线）\n俯视图：椭圆前半实线，后半虚线\n左视图：类似分析' }
          ],
          answer: '截交线为椭圆。主视图中为倾斜直线（截平面正投影），俯视图为椭圆（长轴=⌀60），左视图为压缩椭圆。前半椭圆实线，后半虚线。'
        },
        {
          title: '例题3-2：圆锥截顶',
          shapeId: 'cone-trunc',
          probType: 'section-curve',
          problem: '圆锥(r=40,h=55)顶部被水平面截去，求截交线。',
          solution: [
            { title: '分析切割', content: '原始：圆锥 r=40, h=55\n切割面：水平面，距顶点 35\n切割面 ⊥ 轴线 → <b>截交线为圆</b>' },
            { title: '确定截圆尺寸', content: '切割面高度 y = 20（从底面算）\n用相似三角形：\n截圆半径 / 底面半径 = (55-20) / 55 = 35/55 ≈ 0.636\n截圆半径 = 40 × 35/55 ≈ 25.5\n截圆直径 ≈ ⌀51' },
            { title: '三视图', content: '主视图：\n• 下部梯形（圆台）\n• 上部三角形被截掉\n• 截交线 = 顶部横线（长度=截圆直径）\n\n俯视图：\n• 外圆（底面⌀80）\n• 内圆（截圆⌀51）\n• 同心圆\n\n左视图：与主视图相同（回转体对称）' },
            { title: '可见性', content: '截圆：主/左视图中顶部横线（粗实线，可见）\n俯视图：外圆和内圆都是粗实线（都是可见的轮廓）' }
          ],
          answer: '截交线为圆（水平面⊥轴线）。主/左视图为顶部横线，俯视图为两个同心圆（底面⌀80和截面⌀51）。圆台的主视图为等腰梯形。'
        }
      ],
      exerciseShapes: ['cyl-angle-cut','cyl-angle-cut2','cyl-side-cut','cyl-notch','cone-cut','cone-trunc','quad-cut','cyl-double-cut','prism-cut','cyl-half-groove','cyl-top-hole','cone-corner','cyl-angled-hole','cyl-step-cut'],
      exerciseTypes: ['section-curve','third-view','missing-lines','hidden-lines']
    },

    // ┌───────────────────────────────────────┐
    // │  第四章 相贯线                        │
    // └───────────────────────────────────────┘
    {
      id: 4,
      title: '第四章 相贯线',
      subtitle: '积聚性 · 辅助平面法 · 可见性',
      theory: `
<h3>一、相贯线是什么</h3>
<div class="guide-box">
  <p><b>相贯线</b> = 两回转体曲面相交时的交线</p>
  <p>本质：找两组曲面上的<b>公共点</b>，再连成线。</p>
</div>

<h3>二、最快捷的方法——积聚性</h3>
<div class="guide-highlight">
  <p style="font-size:15px"><b>如果一个回转体在某视图上投影为圆（积聚性），则：</b></p>
  <p style="margin-top:8px">在该视图中，<b>两个圆的交点</b> = 相贯线上的特殊点！</p>
  <p style="margin-top:4px;color:var(--muted);font-size:13px">因为这些点同时满足两个曲面的方程。</p>
</div>

<h3>三、两圆柱正交的相贯线</h3>
<table class="guide-table">
  <tr><th>直径关系</th><th>相贯线形状</th><th>特殊性质</th></tr>
  <tr><td>直径相等 (⌀相等)</td><td>两个圆</td><td>相贯线=正圆（特殊情况）</td></tr>
  <tr><td>大圆柱 ⊃ 小圆柱</td><td>双曲线</td><td>向小圆柱方向弯曲</td></tr>
</table>

<h3>四、求解步骤</h3>
<ol style="line-height:2.2">
  <li><b>判断积聚性</b>：哪个回转体的哪个视图投影为圆</li>
  <li><b>找特殊点</b>：两圆的交点、轮廓素线交点、可见性分界点</li>
  <li><b>辅助平面法</b>：过轴线取辅助平面，求素线交点</li>
  <li><b>光滑连线</b>：按顺序连接</li>
  <li><b>判断可见性</b>：上半段实线，下半段虚线</li>
</ol>

<h3>五、相贯线的可见性规律</h3>
<div class="guide-highlight">
  <p>• 两个曲面都朝向观察者 → <b>实线</b></p>
  <p>• 任一曲面背向观察者 → <b>虚线</b></p>
  <p>• 通常：上半段可见（实线），下半段被遮挡（虚线）</p>
</div>

<div class="step-hint" style="margin-top:16px">💡 相贯线先找积聚性！如果找不到积聚性，再用辅助平面法。90%的相贯线题都能用积聚性快速求解。</div>`,
      examples: [
        {
          title: '例题4-1：两等径圆柱正交',
          shapeId: 'perp-cyl-eq',
          probType: 'intersect-curve',
          problem: '竖直圆柱(⌀70)与水平圆柱(⌀70)轴线正交，求相贯线。',
          solution: [
            { title: '分析形体', content: '两个圆柱：\n① 竖直圆柱：r=35，轴线沿Y方向\n② 水平圆柱：r=35，轴线沿X方向\n两轴线正交且等径。\n\n特殊情况：等径正交 → 相贯线为两个椭圆（从主视图看为两个圆）。' },
            { title: '利用积聚性', content: '俯视图分析：\n竖直圆柱 → 投影为圆（⌀70）\n水平圆柱 → 投影为矩形（因为轴线在水平面内）\n\n主视图分析：\n竖直圆柱 → 投影为矩形（⌀70×h）\n水平圆柱 → 投影为圆（⌀70）\n\n关键：在<b>主视图</b>中，水平圆柱投影为圆，具有积聚性！' },
            { title: '找特殊点', content: '在主视图中：\n水平圆柱的圆与竖直圆柱的矩形轮廓相交\n\n交点即为相贯线上的特殊点：\n• A点：竖直圆柱左轮廓 ∩ 水平圆柱圆\n• B点：竖直圆柱右轮廓 ∩ 水平圆柱圆\n• C点：水平圆柱圆的最上点（如果竖直圆柱也经过此处）\n\n等径时，相贯线在主视图上退化为两条直线。' },
            { title: '确定相贯线', content: '等径正交时：\n主视图中的相贯线 = 两条交叉的直线（X形）\n这是因为相贯线的两个椭圆恰好旋转45°使得投影为直线。\n\n俯视图：相贯线投影为曲线（非圆）\n左视图：相贯线投影为曲线' },
            { title: '可见性', content: '主视图：交点以上实线，以下虚线\n俯视图：前半实线，后半虚线\n\n✏️ 等径相贯是考试重点！记住"相贯线变直线"这个特殊情况。' }
          ],
          answer: '两等径圆柱正交，相贯线为两个椭圆。在主视图中投影为两条交叉直线（X形）。上半段实线，下半段虚线。这是考试常考的特殊情况。'
        },
        {
          title: '例题4-2：大小圆柱正交',
          shapeId: 'perp-cyl-uneq',
          probType: 'intersect-curve',
          problem: '竖直大圆柱(⌀70)被水平小圆柱(⌀50)穿透，求相贯线。',
          solution: [
            { title: '分析积聚性', content: '大圆柱：r=35，轴线竖直\n小圆柱：r=25，轴线水平\n\n主视图：大圆柱为矩形，小圆柱为圆(⌀50) → 小圆柱有积聚性\n俯视图：大圆柱为圆(⌀70)，小圆柱为矩形 → 大圆柱有积聚性' },
            { title: '找特殊点', content: '在俯视图（大圆柱有积聚性的视图）中：\n大圆柱投影为⌀70圆\n小圆柱投影为50×50矩形（沿X方向延伸）\n\n相贯线上的点必须同时在大圆柱面和小圆柱面上。\n\n特殊点：\n• 大圆柱左右轮廓素线上的点 → 俯视图圆上的左右点\n• 小圆柱上下轮廓线上的点 → 俯视图矩形边上的点' },
            { title: '求相贯线形状', content: '小圆柱比大圆柱细，相贯线为双曲线。\n\n俯视图中的相贯线：\n• 从大圆柱圆的左右轮廓点开始\n• 向中心弯曲\n• 到小圆柱的前后轮廓线结束' },
            { title: '可见性判断', content: '俯视图：\n• 前半段相贯线（靠近观察者）→ 实线\n• 后半段（被遮挡）→ 虚线\n\n主视图：\n• 小圆柱顶部可见 → 相贯线上半段实线\n• 小圆柱底部被遮挡 → 下半段虚线' }
          ],
          answer: '相贯线为双曲线。俯视图中前半段实线，后半段虚线。主视图中上半段实线，下半段虚线。利用俯视图积聚性（大圆柱投影为圆）找特殊点。'
        }
      ],
      exerciseShapes: ['perp-cyl-eq','perp-cyl-uneq','cyl-cone-inter','triple-cyl','cyl-hole','cyl-hole-eq','cyl-tangent'],
      exerciseTypes: ['intersect-curve','third-view','missing-lines','hidden-lines']
    },

    // ┌───────────────────────────────────────┐
    // │  第五章 综合训练                      │
    // └───────────────────────────────────────┘
    {
      id: 5,
      title: '第五章 综合训练',
      subtitle: '所有题型混合 · 考前冲刺',
      theory: `
<h3>一、综合题解题策略</h3>
<div class="guide-box">
  <p>综合题可能同时涉及<b>截交线</b>和<b>相贯线</b>，需要综合运用所有知识。</p>
</div>

<h3>二、通用解题流程</h3>
<ol style="line-height:2.2">
  <li><b>看清形体</b>：旋转3D模型，确定形体由哪些基本体组成</li>
  <li><b>确定题型</b>：是补画第三视图？还是求截交线/相贯线？</li>
  <li><b>分步求解</b>：先处理截交线，再处理相贯线，最后判断可见性</li>
  <li><b>检查验证</b>：用"长对正、高平齐、宽相等"验证</li>
</ol>

<h3>三、考前提醒</h3>
<div class="guide-highlight">
  <p>⚠️ 最容易失分的地方：</p>
  <p>1. <b>漏画虚线</b>（不可见轮廓必须用虚线标出）</p>
  <p>2. <b>漏画交线</b>（两个面相交处的棱线不能遗漏）</p>
  <p>3. <b>虚实画反</b>（实线虚线搞混）</p>
  <p>4. <b>三视图不对齐</b>（长对正、高平齐、宽相等必须满足）</p>
  <p>5. <b>曲线不光滑</b>（截交线/相贯线不能有折角）</p>
</div>`,
      examples: [
        {
          title: '例题5-1：带肋板底板的三视图',
          shapeId: 'base-with-rib',
          probType: 'third-view',
          problem: '底板(80×15×60) + 两侧立柱(r=12,h=50) + 中央肋板(3×35×40)，补画俯视图。',
          solution: [
            { title: '分解形体', content: '三个部分：\n① 底板：80(宽)×15(高)×60(深) 长方体\n② 左立柱：圆柱 r=12, h=50，位于底板左侧上方\n③ 右立柱：圆柱 r=12, h=50，位于底板右侧上方\n④ 中央肋板：3(厚)×35(高)×40(深) 薄板' },
            { title: '各部分的俯视图', content: '底板俯视图：80×60 矩形\n左立柱俯视图：⌀24 圆（底板左上方）\n右立柱俯视图：⌀24 圆（底板右上方）\n中央肋板俯视图：3×40 窄矩形（居中）' },
            { title: '合并俯视图', content: '俯视图内容：\n• 外框：80×60 矩形（底板顶面）\n• 两个⌀24的圆（立柱顶面）\n• 中间一个 3×40 的窄矩形（肋板）\n• 注意：肋板在两个立柱之间' },
            { title: '主视图', content: '主视图内容：\n• 底板：80×15 矩形（底部）\n• 两立柱：各⌀24×50 矩形\n• 肋板：3×35 窄矩形（居中）\n• 注意遮挡：肋板被立柱遮挡的部分用虚线' }
          ],
          answer: '俯视图为80×60外矩形框，内含两个⌀24圆（立柱）和中间3×40窄矩形（肋板）。主视图显示底板矩形+两侧立柱+中央肋板，被遮挡部分用虚线。'
        }
      ],
      exerciseShapes: ['cyl-angle-cut','cyl-double-cut','perp-cyl-uneq','base-with-rib','block-with-recess','shaft-housing','cone-corner','triple-comp','step-prism','cyl-notch','cyl-cone-inter'],
      exerciseTypes: ['third-view','section-curve','intersect-curve','missing-lines','hidden-lines','axis-to-3view','3view-to-axis']
    }
  ];

  // ═══════════════════════════════════════════
  // 习题生成器 — 自动生成题目+答案
  // ═══════════════════════════════════════════

  function generateAnswer(shape, probType) {
    const ans = [];
    const n = shape.name;
    const f = shape.features || [];

    switch (probType) {
      case 'third-view':
        ans.push(`根据"${n}"的形体特征分析：`);
        ans.push(`• ${f[0] || ''}`);
        if (f[1]) ans.push(`• ${f[1]}`);
        if (f[2]) ans.push(`• ${f[2]}`);
        ans.push('');
        ans.push('补画第三视图时，依据"长对正、高平齐、宽相等"的投影规律，');
        ans.push('从已知两视图中提取对应尺寸，画出缺失视图的完整轮廓。');
        break;

      case 'section-curve':
        ans.push(`"${n}"的截交线分析：`);
        ans.push(`• ${f[0] || shape.description}`);
        ans.push('');
        ans.push('截交线求解要点：');
        ans.push('1. 先找特殊点（最高点、最低点、最左点、最右点）');
        ans.push('2. 用辅助素线法补充一般点');
        ans.push('3. 光滑连接所有点，判断可见性（前半实线，后半虚线）');
        break;

      case 'intersect-curve':
        ans.push(`"${n}"的相贯线分析：`);
        ans.push(`• ${f[0] || shape.description}`);
        ans.push('');
        ans.push('相贯线求解要点：');
        ans.push('1. 判断积聚性（哪个回转体的哪个视图投影为圆）');
        ans.push('2. 在积聚性视图中找两圆的交点（特殊点）');
        ans.push('3. 用辅助平面法补充一般点');
        ans.push('4. 判断可见性（上半实线，下半虚线）');
        break;

      case 'missing-lines':
        ans.push(`"${n}"的缺失线条：`);
        ans.push(`• ${f[0] || ''}`);
        if (f[1]) ans.push(`• ${f[1]}`);
        ans.push('');
        ans.push('常见缺失：');
        ans.push('• 被遮挡轮廓的虚线（如凹腔壁、孔壁）');
        ans.push('• 两面交线（棱线、相贯线）');
        ans.push('• 切割产生的新轮廓线');
        break;

      case 'hidden-lines':
        ans.push(`"${n}"的可见性判断：`);
        f.forEach((ft, i) => {
          if (i < 4) ans.push(`• ${ft} → 判断朝向观察者为实线，被遮挡为虚线`);
        });
        ans.push('');
        ans.push('判断规则：从每个方向观察时，哪些表面在"前面"？');
        break;

      case 'axis-to-3view':
        ans.push(`"${n}"的三视图：`);
        ans.push(`• ${f[0] || ''}`);
        if (f[1]) ans.push(`• ${f[1]}`);
        if (f[2]) ans.push(`• ${f[2]}`);
        ans.push('');
        ans.push('从轴测图出发，分别沿三个投影方向"压缩"轮廓。');
        break;

      case '3view-to-axis':
        ans.push(`"${n}"的轴测图：`);
        ans.push('从三视图中提取形体信息，还原为等轴测图。');
        ans.push('注意：轴测图中不可见轮廓用细虚线，可见轮廓用粗实线。');
        break;

      default:
        ans.push(shape.description);
    }

    return ans.join('\n');
  }

  function generateExercise(chapterId, exerciseIdx) {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return null;

    const shapes = chapter.exerciseShapes;
    const types = chapter.exerciseTypes;

    const shapeIdx = (exerciseIdx * 7 + chapterId * 3) % shapes.length;
    const typeIdx = (exerciseIdx * 3 + chapterId) % types.length;

    const shapeId = shapes[shapeIdx];
    const probType = types[typeIdx];
    const shapeData = Shapes.getShape(shapeId);
    if (!shapeData) return null;

    const typeName = probTypes[probType] ? probTypes[probType].name : probType;

    // 确定缺失视图（补画第三视图类题型轮换缺哪个）
    let givenViews, missingView;
    const viewNames = ['front', 'top', 'left'];
    const viewLabels = { front: '主视图', top: '俯视图', left: '左视图' };
    if (probType === 'third-view' || probType === 'missing-lines' || probType === 'hidden-lines') {
      const missIdx = exerciseIdx % 3;
      missingView = viewNames[missIdx];
      givenViews = viewNames.filter(v => v !== missingView);
    } else {
      givenViews = ['front', 'top'];
      missingView = 'left';
    }

    // 考试真题风格题目描述
    const givenLabel = givenViews.map(v => viewLabels[v]).join('和');
    const missLabel = viewLabels[missingView];
    const problemTexts = {
      'third-view': `已知形体的${givenLabel}，补画其${missLabel}。\n形体：${shapeData.name}（${shapeData.description}）`,
      'axis-to-3view': `已知形体的立体图，画出其${givenLabel}和${missLabel}。`,
      '3view-to-axis': `已知形体的三视图，画出其正等轴测图。`,
      'section-curve': `已知形体的立体图，求各视图中的截交线并补全视图。`,
      'intersect-curve': `已知形体的立体图，求相贯线并补全各视图。`,
      'missing-lines': `已知形体的${givenLabel}中部分线条缺失，补全${missLabel}并检查线条完整性。`,
      'hidden-lines': `已知形体的立体图，判断并标注三视图中各线条的可见性（实线/虚线）。`
    };

    const answer = generateAnswer(shapeData, probType);
    const steps = genSolutionForExercise(shapeData, probType);

    return {
      id: `${chapterId}-${exerciseIdx}`,
      chapterId,
      exerciseIdx,
      shapeId,
      shapeData,
      probType,
      typeName,
      problem: problemTexts[probType] || `分析${shapeData.name}的三视图。`,
      answer,
      steps,
      givenViews,
      missingView,
      tags: { shape: shapeData.name, category: shapeData.category }
    };
  }

  function genSolutionForExercise(shape, probType) {
    const steps = [];
    const f = shape.features || [];
    const n = shape.name;

    steps.push({
      title: '第一步：观察3D形体',
      content: `拖动3D模型，从前方、上方、左方三个方向观察${n}：\n• 前方 → 主视图看到的形状\n• 上方 → 俯视图看到的形状\n• 左方 → 左视图看到的形状\n\n形体描述：${shape.description}`,
      hint: '每个方向看到的轮廓就是该视图的"外框"'
    });

    steps.push({
      title: '第二步：分析形体特征',
      content: `分解${n}的关键特征：\n${f.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n每个特征在三个视图中都有投影。`,
      hint: '用铅笔轻轻标出特征点的位置'
    });

    if (probType === 'third-view') {
      steps.push({
        title: '第三步：找投影对应关系',
        content: '三视图核心规律——"长对正、高平齐、宽相等"：\n\n① 主视图 与 俯视图 → 长对正\n② 主视图 与 左视图 → 高平齐\n③ 俯视图 与 左视图 → 宽相等（45°辅助线转移）',
        principle: '这是三视图的基石，所有特征点都必须满足'
      });
      steps.push({
        title: '第四步：确定轮廓尺寸',
        content: `从已知视图提取${n}的尺寸：\n• 长（X方向）从主/俯视图\n• 高（Y方向）从主/左视图\n• 宽（Z方向）从俯/左视图\n\n先画外轮廓，再补内部线条。`,
        hint: '先定外框，再填内容'
      });
    } else if (probType === 'section-curve') {
      steps.push({
        title: '第三步：确定切割面位置',
        content: `${n}的切割分析：${shape.description}\n\n切割面与回转轴线的夹角决定截交线类型：\n• ⊥轴线 → 圆\n• 锐角且不过底面 → 椭圆\n• ∥母线 → 抛物线\n• 锐角且过底面 → 双曲线`
      });
      steps.push({
        title: '第四步：找特殊点和一般点',
        content: '特殊点：最高点、最低点、最左点、最右点、可见性分界点。\n\n一般点：用辅助素线法，在曲面上取辅助线，求其与切割面的交点。\n\n分布要均匀，保证曲线光滑。'
      });
    } else if (probType === 'intersect-curve') {
      steps.push({
        title: '第三步：利用积聚性',
        content: `${n}的相贯线：${shape.description}\n\n核心：判断哪个回转体在某视图上有积聚性（投影为圆）。\n在积聚性视图中，两个圆的交点就是相贯线上的特殊点！`,
        principle: '相贯线 = 两曲面的共有线，积聚性是最快捷的突破口'
      });
      steps.push({
        title: '第四步：辅助平面法',
        content: '1. 过交线取辅助平面P（最好过轴线）\n2. P与两回转体的交线是素线（直线）\n3. 两条素线的交点 = 相贯线上的点\n4. 投影到各视图'
      });
    } else if (probType === 'missing-lines') {
      steps.push({
        title: '第三步：找缺失线条',
        content: '对比已有视图，找出应画出但缺失的线条：\n• 被遮挡轮廓的虚线\n• 两面交线（棱线）\n• 切割产生的新轮廓\n• 曲线过渡处的起止点'
      });
      steps.push({
        title: '第四步：补全并判断虚实',
        content: '• 可见轮廓 → 粗实线\n• 不可见轮廓 → 细虚线\n• 交线 → 按可见性画实/虚线'
      });
    } else if (probType === 'hidden-lines') {
      steps.push({
        title: '第三步：逐线判断可见性',
        content: `对每条线判断：\n${f.slice(0, 4).map((x, i) => `${i + 1}. ${x} → 实线还是虚线？`).join('\n')}\n\n规则：该线条所在的面是否朝向观察者？`
      });
    }

    steps.push({
      title: '最后：检查验证',
      content: '□ 长对正：主视图与俯视图宽度一致？\n□ 高平齐：主视图与左视图高度一致？\n□ 宽相等：俯视图与左视图深度一致？\n□ 实线/虚线是否正确？\n□ 所有特征都已体现？'
    });

    return steps;
  }

  // ── 公开接口 ──
  return {
    getChapters: () => chapters,
    getChapter: (id) => chapters.find(c => c.id === id),
    getProbTypes,
    generateExercise,
    getExample: (chapterId, exampleIdx) => {
      const ch = chapters.find(c => c.id === chapterId);
      if (!ch || !ch.examples) return null;
      return ch.examples[exampleIdx] || null;
    },
    getScore: () => score,
    addScore: (p) => score += p
  };

  function getProbTypes() { return probTypes; }
})();