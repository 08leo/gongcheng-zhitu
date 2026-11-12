// ═══════════════════════════════════════════
// chapters.js — 工程制图章节库（核心：三视图补全）
// 题型：complete（补全三视图）— 给出2个视图，补画第3个
// 3D模型仅作辅助理解
// ═══════════════════════════════════════════

const Chapters = (() => {

  const QTYPE = { COMPLETE: 'complete' }; // 补全三视图题

  const chapters = [

    // ═══════════════════════════════════
    // 第一章：投影法基础
    // ═══════════════════════════════════
    {
      id: 1,
      title: '第一章 投影法基础',
      subtitle: '三视图的形成与投影规律',
      intro: `
        <p>工程制图用二维图形表达三维物体，正投影法是核心方法。本章是整个工程制图的基石。</p>
        <p>学习目标：理解三视图的形成过程，掌握"长对正、高平齐、宽相等"的投影规律，并能运用规律补画第三视图。</p>
      `,
      keyPoints: [
        '正投影法：平行光线垂直于投影面',
        '三视图：主视图（前→后）、俯视图（上→下）、左视图（左→右）',
        '投影规律：长对正、高平齐、宽相等',
        '第一角投影法：物体在观察者与投影面之间',
        '可见轮廓画粗实线，不可见轮廓画细虚线'
      ],
      examples: [
        {
          id: 'ex1-1',
          title: '例题1：已知主、俯视图，补画左视图（长方体）',
          difficulty: 1,
          shapeId: 'box',
          question: '已知长方体的主视图和俯视图，补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '本题考查三视图投影规律的基本应用。长方体的左视图是一个矩形，其宽度等于俯视图的宽（宽相等），高度等于主视图的高（高平齐）。',
          solution: [
            { title: '第一步：识别已知视图', content: '主视图是矩形，反映物体的长和高；俯视图是矩形，反映物体的长和宽。' },
            { title: '第二步：确定要补画的视图', content: '需要补画左视图，左视图反映物体的宽和高。' },
            { title: '第三步：应用投影规律', content: '"高平齐"→左视图的高=主视图的高；"宽相等"→左视图的宽=俯视图的宽。' },
            { title: '第四步：画出左视图', content: '左视图是一个矩形，宽=俯视图宽度，高=主视图高度。' },
            { title: '第五步：验证', content: '检查主左高平齐✓ 俯左宽相等✓' }
          ]
        },
        {
          id: 'ex1-2',
          title: '例题2：已知主、左视图，补画俯视图（圆柱体）',
          difficulty: 2,
          shapeId: 'cylinder',
          question: '已知圆柱体的主视图和左视图（均为矩形），补画俯视图。',
          given: ['front', 'left'],
          missing: 'top',
          analysis: '圆柱体的俯视图是一个圆，直径等于主视图矩形的宽（即圆柱直径）。这是圆柱的投影特征：一个视图为矩形时，另两个视图必为圆。',
          solution: [
            { title: '第一步：分析已知视图', content: '主视图和左视图都是矩形，高度相同（高平齐），说明物体在高度方向是均匀的。' },
            { title: '第二步：判断形体', content: '两个视图都是矩形的基本体，可能是圆柱或棱柱。结合常见题型，圆柱体的主、左视图都是矩形。' },
            { title: '第三步：确定俯视图形状', content: '圆柱体从上向下看，看到的是顶面圆，直径=主视图矩形的宽=圆柱直径。' },
            { title: '第四步：画俯视图', content: '画一个圆，直径等于主视图的宽度，圆心用点画线标注。' },
            { title: '第五步：验证长对正', content: '主视图的宽（矩形水平边）与俯视图圆的直径相等，满足长对正。' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p1-1', type: QTYPE.COMPLETE, difficulty: 1,
          shapeId: 'box',
          question: '已知长方体的主视图和俯视图，补画左视图。',
          given: ['front', 'top'], missing: 'left',
          analysis: '左视图是矩形，宽=俯视图的宽（宽相等），高=主视图的高（高平齐）。这是三视图投影规律最基本的应用。'
        },
        {
          id: 'p1-2', type: QTYPE.COMPLETE, difficulty: 1,
          shapeId: 'cylinder',
          question: '已知圆柱体的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '圆柱体的俯视图是圆，直径=主视图矩形的宽。圆柱的投影特征：矩形+矩形+圆。'
        },
        {
          id: 'p1-3', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'cone',
          question: '已知圆锥的主视图和左视图（均为三角形），补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '圆锥的俯视图是圆+圆心点。圆的直径=三角形底边，圆心点=圆锥顶点的投影。画圆锥俯视图时圆心必须画点。'
        },
        {
          id: 'p1-4', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'box',
          question: '已知长方体的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图是矩形，长=主视图的长（长对正），宽=左视图的宽（宽相等）。'
        }
      ]
    },

    // ═══════════════════════════════════
    // 第二章：基本体的三视图
    // ═══════════════════════════════════
    {
      id: 2,
      title: '第二章 基本体的三视图',
      subtitle: '圆柱、圆锥、棱柱、棱锥',
      intro: `
        <p>基本体是构成复杂形体的基础。掌握基本体的三视图特征，才能正确补画复杂形体的第三视图。</p>
        <p>学习目标：熟记常见基本体的三视图特征，能根据两个视图判断形体并补画第三视图。</p>
      `,
      keyPoints: [
        '圆柱：矩形+矩形+圆（轴线垂直于哪个面，那个面投影为圆）',
        '圆锥：三角形+三角形+圆（圆心必须画点）',
        '棱柱：多边形+矩形+矩形（俯视图反映底面实形）',
        '棱锥：三角形+三角形+多边形（顶点投影在多边形内）',
        '判断形体的关键：抓住"圆"和"多边形"等特征视图'
      ],
      examples: [
        {
          id: 'ex2-1',
          title: '例题1：已知俯、左视图，补画主视图（阶梯圆柱）',
          difficulty: 2,
          shapeId: 'stepped-cyl',
          question: '已知阶梯圆柱的俯视图（两个同心圆）和左视图，补画主视图。',
          given: ['top', 'left'],
          missing: 'front',
          analysis: '俯视图的两个同心圆说明这是同轴的阶梯圆柱。主视图应是两个矩形叠加：下部大矩形对应外圆，上部小矩形对应内圆。',
          solution: [
            { title: '第一步：分析俯视图', content: '两个同心圆 → 同轴的两段圆柱，下部大、上部小。' },
            { title: '第二步：分析左视图', content: '左视图是两个矩形叠加，确认了上下两段圆柱的高度。' },
            { title: '第三步：画主视图', content: '主视图与左视图形状相同（高平齐），下部大矩形+上部居中小矩形。' },
            { title: '第四步：标注台阶面', content: '两段圆柱的过渡面（台阶面）在主视图中可见，画粗实线。' },
            { title: '第五步：验证', content: '主俯长对正（大矩形宽=外圆直径，小矩形宽=内圆直径）✓' }
          ]
        },
        {
          id: 'ex2-2',
          title: '例题2：已知主、俯视图，补画左视图（正三棱柱）',
          difficulty: 3,
          shapeId: 'tri-prism',
          question: '已知正三棱柱的主视图（矩形）和俯视图（正三角形），补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '正三棱柱的左视图是矩形，中间有一条竖直线（最前棱的投影，可见画粗实线）。关键是判断棱线的可见性。',
          solution: [
            { title: '第一步：识别形体', content: '俯视图是正三角形 → 正三棱柱，底面为正三角形。' },
            { title: '第二步：分析主视图', content: '主视图是矩形，说明棱柱轴线垂直于水平面。' },
            { title: '第三步：分析左视图', content: '左视图是矩形，宽=三角形的高（宽相等），高=棱柱高（高平齐）。' },
            { title: '第四步：判断棱线', content: '三棱柱有3条棱，从左看最前棱在中间且可见 → 粗实线；后两条棱被遮挡 → 但积聚在轮廓上。' },
            { title: '第五步：画左视图', content: '矩形中间画一条粗实线竖线。' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p2-1', type: QTYPE.COMPLETE, difficulty: 1,
          shapeId: 'cylinder',
          question: '已知圆柱的主视图和俯视图，补画左视图。',
          given: ['front', 'top'], missing: 'left',
          analysis: '圆柱的左视图与主视图相同，都是矩形，宽=圆柱直径，高=圆柱高。'
        },
        {
          id: 'p2-2', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'stepped-cyl',
          question: '已知阶梯圆柱的主视图和俯视图，补画左视图。',
          given: ['front', 'top'], missing: 'left',
          analysis: '左视图与主视图形状相同，都是两个矩形叠加。注意台阶面画粗实线。'
        },
        {
          id: 'p2-3', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'cone',
          question: '已知圆锥的俯视图（圆+圆心点）和左视图（三角形），补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图与左视图相同，都是三角形，底边=圆直径，高=圆锥高。'
        },
        {
          id: 'p2-4', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'tri-prism',
          question: '已知正三棱柱的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图是正三角形，边长=主视图矩形的宽（长对正）。三角形的高=左视图矩形的宽（宽相等）。'
        }
      ]
    },

    // ═══════════════════════════════════
    // 第三章：切割体与截交线
    // ═══════════════════════════════════
    {
      id: 3,
      title: '第三章 切割体与截交线',
      subtitle: '开槽、切口、斜切',
      intro: `
        <p>切割体是基本体被平面切割后形成的形体。补画切割体的第三视图，关键是分析截交线的投影。</p>
        <p>学习目标：掌握常见切割体的截交线投影规律，能补画切割体的第三视图。</p>
      `,
      keyPoints: [
        '圆柱截交线：切割面⊥轴线→圆；∥轴线→矩形；倾斜→椭圆',
        '开槽圆柱：槽壁在非积聚视图中画虚线（不可见）',
        '斜切圆柱：截交线在主视图积聚为斜线，在其他视图为椭圆',
        '画切割体三视图：先画完整基本体，再画切割部分',
        '判断可见性是画虚线还是实线的关键'
      ],
      examples: [
        {
          id: 'ex3-1',
          title: '例题1：已知主、俯视图，补画左视图（开槽圆柱）',
          difficulty: 3,
          shapeId: 'cyl-notch',
          question: '已知开槽圆柱的主视图和俯视图，补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '圆柱顶部开了一个矩形槽。左视图中，槽底是不可见的（被圆柱前部遮挡），所以槽底投影线画虚线。槽的两侧壁在左视图积聚为竖直轮廓线。',
          solution: [
            { title: '第一步：画完整圆柱的左视图', content: '先画出完整圆柱的左视图（矩形）。' },
            { title: '第二步：确定槽的位置', content: '根据主视图和俯视图确定槽的宽度和深度。' },
            { title: '第三步：画槽的投影', content: '槽底在左视图中是一条水平线，因为从左看槽底被圆柱前部遮挡 → 画虚线。' },
            { title: '第四步：画槽壁', content: '槽的两个侧壁是正平面，在左视图积聚为竖直线，与圆柱轮廓重合。' },
            { title: '第五步：检查线型', content: '槽底虚线 ✓ 外轮廓实线 ✓' }
          ]
        },
        {
          id: 'ex3-2',
          title: '例题2：已知主、俯视图，补画左视图（圆柱斜切）',
          difficulty: 3,
          shapeId: 'cyl-angle-cut',
          question: '已知圆柱被正垂面斜切的主视图和俯视图，补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '斜切圆柱的截交线是椭圆。主视图中截交线积聚为斜线（切割面是正垂面），俯视图中截交线投影为圆（与圆柱面重合），左视图中截交线投影为椭圆弧。',
          solution: [
            { title: '第一步：分析截平面', content: '主视图中切割面积聚为斜线 → 切割面是正垂面。' },
            { title: '第二步：分析截交线', content: '正垂面斜切圆柱 → 截交线是椭圆。' },
            { title: '第三步：分析各视图投影', content: '主视图：斜线（积聚）；俯视图：圆（与圆柱面重合）；左视图：椭圆弧。' },
            { title: '第四步：画左视图', content: '矩形 + 椭圆弧（椭圆弧连接矩形顶边两端）。' },
            { title: '第五步：找特殊点', content: '最左、最右、最高、最低四个点确定椭圆弧的大致形状。' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p3-1', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'cyl-notch',
          question: '已知开槽圆柱的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图中，圆柱是圆，槽的两个侧壁投影为圆内的两条平行弦（实线，可见）。'
        },
        {
          id: 'p3-2', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'cyl-angle-cut',
          question: '已知斜切圆柱的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图中截交线积聚为斜线。斜线的左端高度由左视图确定，右端高度也由左视图确定。'
        },
        {
          id: 'p3-3', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'cyl-notch',
          question: '已知开槽圆柱的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图中，圆柱顶部有凹口。凹口宽度由俯视图确定，深度由左视图确定。'
        }
      ]
    },

    // ═══════════════════════════════════
    // 第四章：相贯体与相贯线
    // ═══════════════════════════════════
    {
      id: 4,
      title: '第四章 相贯体与相贯线',
      subtitle: '两形体相交',
      intro: `
        <p>相贯体是两个基本体相交形成的形体。相贯线是两形体表面的共有线。</p>
        <p>学习目标：掌握常见相贯线的投影画法，特别是两圆柱正交的相贯线。</p>
      `,
      keyPoints: [
        '相贯线是两形体表面的共有线，也是分界线',
        '两圆柱正交：相贯线为空间曲线，投影为双曲线',
        '等径圆柱正交：相贯线为椭圆，主视图投影为直线',
        '相贯线的可见性：两表面都可见时才画实线',
        '利用积聚性法求相贯线投影'
      ],
      examples: [
        {
          id: 'ex4-1',
          title: '例题1：已知主、俯视图，补画左视图（带孔方块）',
          difficulty: 3,
          shapeId: 'cyl-hole',
          question: '已知带通孔方块的主视图和俯视图，补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '方块中间有一个通孔。左视图中，孔是可见的（从左看孔是通的），所以孔投影为实线圆。主视图和俯视图中孔的轮廓不可见，画虚线。',
          solution: [
            { title: '第一步：分析形体', content: '方块中间开通孔，孔轴线沿左右方向。' },
            { title: '第二步：分析左视图', content: '从左向右看，孔是通的，孔壁可见 → 画实线圆。' },
            { title: '第三步：确定孔的位置', content: '孔的位置由主视图和俯视图确定（居中）。' },
            { title: '第四步：画左视图', content: '矩形外轮廓 + 中间实线圆 + 十字点画线。' },
            { title: '第五步：验证', content: '孔的直径在三视图中保持一致。' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p4-1', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'cyl-hole',
          question: '已知带孔方块的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图中，孔的左右轮廓不可见（被方块顶面遮挡），画两条虚线。'
        },
        {
          id: 'p4-2', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'cyl-hole',
          question: '已知带孔方块的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图中，孔的上下轮廓不可见（被方块前面遮挡），画两条水平虚线。'
        }
      ]
    },

    // ═══════════════════════════════════
    // 第五章：组合体分析
    // ═══════════════════════════════════
    {
      id: 5,
      title: '第五章 组合体分析',
      subtitle: '叠加、切割、综合',
      intro: `
        <p>组合体由两个或多个基本体组合而成。补画组合体第三视图的核心方法是形体分析法。</p>
        <p>学习目标：运用形体分析法，将组合体分解为基本体，逐个分析投影后综合。</p>
      `,
      keyPoints: [
        '形体分析法：将组合体分解为若干基本体，逐个分析投影',
        '叠加式：注意接触面是否画线（同径相切不画，有棱线则画）',
        '切割式：先画整体再挖切',
        '综合式：先叠加后切割',
        '按"长对正、高平齐、宽相等"逐个投影'
      ],
      examples: [
        {
          id: 'ex5-1',
          title: '例题1：已知主、俯视图，补画左视图（L型块）',
          difficulty: 2,
          shapeId: 'l-block',
          question: '已知L型块的主视图和俯视图，补画左视图。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: 'L型块由底板和立板组成。从左看，立板和底板叠加成一个矩形，但立板的右边缘在左视图中不可见，画虚线。',
          solution: [
            { title: '第一步：形体分析', content: 'L型块 = 底板（水平）+ 立板（竖直，在左侧）。' },
            { title: '第二步：画左视图外轮廓', content: '从左看，底板和立板叠加成一个矩形。' },
            { title: '第三步：画内部线条', content: '立板的右边缘在左视图中不可见（被立板本身遮挡后方）→ 画竖直虚线。' },
            { title: '第四步：验证宽相等', content: '左视图宽度 = 俯视图宽度。' },
            { title: '第五步：检查高平齐', content: '左视图高度 = 主视图高度。' }
          ]
        },
        {
          id: 'ex5-2',
          title: '例题2：已知主、左视图，补画俯视图（半圆头块）',
          difficulty: 2,
          shapeId: 'half-cyl-block',
          question: '已知半圆头块的主视图和左视图，补画俯视图。',
          given: ['front', 'left'],
          missing: 'top',
          analysis: '半圆头块右端是半圆柱头。俯视图中，左端是矩形，右端是半圆（半圆柱头的投影）。',
          solution: [
            { title: '第一步：分析形体', content: '矩形体 + 右端半圆柱头。' },
            { title: '第二步：分析俯视图', content: '矩形体部分投影为矩形，半圆柱头部分投影为半圆。' },
            { title: '第三步：画俯视图', content: '左端矩形 + 右端半圆，半圆直径=矩形宽度。' },
            { title: '第四步：验证', content: '半圆的直径方向与主视图的宽对正。' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p5-1', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'l-block',
          question: '已知L型块的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图是矩形，左侧有立板与底板的分界线（实线）。'
        },
        {
          id: 'p5-2', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'l-block',
          question: '已知L型块的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图是L形：下部矩形（底板）+ 左侧立板（矩形）。'
        },
        {
          id: 'p5-3', type: QTYPE.COMPLETE, difficulty: 2,
          shapeId: 'half-cyl-block',
          question: '已知半圆头块的主视图和俯视图，补画左视图。',
          given: ['front', 'top'], missing: 'left',
          analysis: '左视图是正方形（因为半圆柱头的直径=矩形体宽度=高度）。'
        },
        {
          id: 'p5-4', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'stepped-cyl',
          question: '已知阶梯圆柱的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图与左视图相同，两个矩形叠加，台阶面画粗实线。'
        }
      ]
    },

    // ═══════════════════════════════════
    // 第六章：补画第三视图（综合训练）
    // ═══════════════════════════════════
    {
      id: 6,
      title: '第六章 补画第三视图',
      subtitle: '综合训练与应试',
      intro: `
        <p>本章是综合训练，围绕考试中最常见的"补画第三视图"题型进行强化练习。</p>
        <p>学习目标：熟练运用形体分析法和线面分析法，快速准确地补画第三视图。</p>
      `,
      keyPoints: [
        '解题步骤：识形体→定方向→画轮廓→判可见→验投影',
        '先画外轮廓，再画内部细节',
        '不可见轮廓画虚线，可见轮廓画实线',
        '每画一条线都要检查是否满足投影规律',
        '多练典型题，形成空间想象能力'
      ],
      examples: [
        {
          id: 'ex6-1',
          title: '例题1：已知主、俯视图，补画左视图（综合切割体）',
          difficulty: 4,
          shapeId: 'cyl-notch',
          question: '已知开槽圆柱的主视图和俯视图，补画左视图，并标注所有虚线。',
          given: ['front', 'top'],
          missing: 'left',
          analysis: '本题考查开槽圆柱左视图的完整画法，重点是虚线的判断。槽底不可见画虚线，槽壁在左视图中与外轮廓重合不单独画线。',
          solution: [
            { title: '第一步：画完整圆柱左视图', content: '矩形，高=主视图高，宽=俯视图宽。' },
            { title: '第二步：确定槽位置', content: '由主视图确定槽的深度，由俯视图确定槽的宽度。' },
            { title: '第三步：画槽底虚线', content: '槽底从左看不可见 → 水平虚线。' },
            { title: '第四步：检查槽壁', content: '槽壁是正平面，在左视图积聚为竖直线，与矩形左右边重合。' },
            { title: '第五步：验证投影规律', content: '主左高平齐 ✓ 俯左宽相等 ✓' }
          ]
        }
      ],
      exercises: [
        {
          id: 'p6-1', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'box',
          question: '已知长方体的主视图和左视图，补画俯视图。',
          given: ['front', 'left'], missing: 'top',
          analysis: '俯视图是矩形，长=主视图长（长对正），宽=左视图宽（宽相等）。'
        },
        {
          id: 'p6-2', type: QTYPE.COMPLETE, difficulty: 3,
          shapeId: 'cylinder',
          question: '已知圆柱的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图是矩形，宽=圆直径（长对正），高=左视图高（高平齐）。'
        },
        {
          id: 'p6-3', type: QTYPE.COMPLETE, difficulty: 4,
          shapeId: 'cyl-hole',
          question: '已知带孔方块的主视图和俯视图，补画左视图。',
          given: ['front', 'top'], missing: 'left',
          analysis: '左视图中方块是矩形，孔可见画实线圆（因为孔沿左右方向贯通）。'
        },
        {
          id: 'p6-4', type: QTYPE.COMPLETE, difficulty: 4,
          shapeId: 'l-block',
          question: '已知L型块的俯视图和左视图，补画主视图。',
          given: ['top', 'left'], missing: 'front',
          analysis: '主视图是L形，底板在下、立板在左，两者有公共边。'
        }
      ]
    }

  ];

  function getChapter(id) {
    return chapters.find(c => c.id === Number(id)) || chapters[0];
  }

  function getAllChapters() {
    return chapters;
  }

  return { getChapter, getAllChapters };
})();
