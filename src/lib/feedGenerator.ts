export interface FeedItem {
  category: string;
  title: string;
  summary: string;
  dimensions: {
    feeling: string;
    attraction: string;
    comfort: string;
    desire: string;
    resonance: string;
  };
  avatarExperience: string;
  moreItems: string[];
  sourceUrl?: string;
}

export interface DailyFeedData {
  date: string;
  avatarName: string;
  topThree: { title: string; summary: string; category: string }[];
  categories: FeedItem[];
  dailySummary: string;
  timeline: string[];
}

const CATEGORIES = [
  { key: "work", label: "工作" },
  { key: "growth", label: "成长" },
  { key: "entertainment", label: "娱乐" },
  { key: "health", label: "健康" },
  { key: "relationship", label: "关系" },
  { key: "other", label: "其他" },
];

const FEELINGS = ["喜欢", "尊敬", "好奇", "平静", "感动", "欣赏"];
const ATTRACTIONS = ["走心", "好奇", "心动", "沉浸", "启发", "共鸣"];
const COMFORTS = ["放松", "惬意", "平静", "舒适", "自在", "宁静"];
const DESIRES = ["想要深入", "想了解更多", "想亲身体验", "想分享给朋友", "想收藏", "想实践"];
const RESONANCES = ["对路", "同频", "契合", "有缘", "相近", "志同"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockFeed(
  profile: {
    avatarName?: string | null;
    personality?: string | null;
    occupation?: string | null;
    goal?: string | null;
  },
  date: string
): DailyFeedData {
  const name = profile.avatarName || "我的分身";
  const personality = profile.personality || "思考型、喜欢探索";
  const occupation = profile.occupation || "互联网从业者";

  const MOCK_CONTENT: Record<string, { titles: string[]; summaries: string[] }> = {
    work: {
      titles: [
        "2025年AI工具效率报告：哪些工具真正提升了生产力",
        "远程协作的未来：异步工作文化正在重塑职场",
        "创业公司如何用最小成本构建技术团队",
      ],
      summaries: [
        "报告显示，真正提升效率的AI工具往往是那些深度融入工作流的，而非表面光鲜的功能堆砌。",
        "越来越多的企业开始拥抱异步工作文化，文档化思维和深度工作时间成为新职场核心竞争力。",
        "小而精的技术团队往往比大团队更有执行力，关键在于文化契合度高于技能匹配度。",
      ],
    },
    growth: {
      titles: [
        "费曼学习法的真正精髓：用简单语言解释复杂概念",
        "每天15分钟的冥想如何改变了我的决策方式",
        "读书笔记的终极形态：构建你自己的知识网络",
      ],
      summaries: [
        "真正的理解是能向一个孩子解释清楚，费曼学习法的核心不是技巧，而是诚实面对自己的认知盲区。",
        "冥想不是放空，而是训练元认知能力，让你在做决定时能暂停一秒，看清自己真正想要什么。",
        "知识只有连接才有价值，卡片盒笔记法帮助构建属于自己的思想网络，而不是别人思想的收纳箱。",
      ],
    },
    entertainment: {
      titles: [
        "《哪吒2》背后的技术革命：国产动画的新边界",
        "独立游戏《茶杯头》的创作哲学：美学即游戏设计",
        "沉浸式戏剧《不眠之夜》为何让人欲罢不能",
      ],
      summaries: [
        "国产动画正在完成从追赶到引领的转变，技术突破的背后是整整一代动画人的文化自信重建。",
        "当美学本身成为游戏机制，玩家不只是在玩游戏，而是在体验一种纯粹的艺术表达。",
        "沉浸式体验的魅力在于你不再是旁观者，每一个选择都是真实的，每一次迷路都是意义的一部分。",
      ],
    },
    health: {
      titles: [
        "间歇性禁食的最新研究：它真的适合所有人吗",
        "久坐的代价：每小时起身2分钟如何影响你的寿命",
        "睡眠质量比时长更重要：深度睡眠的科学",
      ],
      summaries: [
        "最新研究表明间歇性禁食并非万能，个体差异显著，找到适合自己的饮食节律比跟风更重要。",
        "简单的行为改变——每小时站起来走两分钟——可以显著降低久坐带来的代谢风险。",
        "深度睡眠期间大脑进行「清洗」，清除代谢废物，这才是睡眠最核心的价值。",
      ],
    },
    relationship: {
      titles: [
        "非暴力沟通：当我们学会说\"我需要\"而不是\"你应该\"",
        "数字时代的友情：为什么深度连接变得越来越难",
        "边界感不是冷漠，是对关系最深的尊重",
      ],
      summaries: [
        "改变沟通方式从改变语言开始，\"我感到失落\"比\"你让我失望\"更能打开对话的空间。",
        "当每个人都在线，真正的陪伴反而稀缺了。深度友情需要的不是频率，而是真实的相互见证。",
        "健康的边界不是墙，而是门——你知道什么时候开，什么时候关，而不是永远敞开或永远紧闭。",
      ],
    },
    other: {
      titles: [
        "城市漫游者：用脚步丈量一座城市的温度",
        "手工艺的复兴：当Z世代开始迷恋做陶器",
        "哲学入门：苦难是否必要——论痛苦的意义",
      ],
      summaries: [
        "城市漫游不是旅游，而是放弃目的地，让城市的肌理自然浮现，在偶然中遇见真实的城市性格。",
        "年轻人转向手工艺，不只是逃避数字疲劳，更是在寻找一种\"做了就是做了\"的真实感和存在确认。",
        "尼采说，那杀不死我的，使我更强大。但也许痛苦的意义不在于使人更强，而在于使人更真实。",
      ],
    },
  };

  const categories: FeedItem[] = CATEGORIES.map(({ key, label }) => {
    const data = MOCK_CONTENT[key];
    const idx = Math.floor(Math.random() * data.titles.length);
    return {
      category: label,
      title: data.titles[idx],
      summary: data.summaries[idx],
      dimensions: {
        feeling: pick(FEELINGS),
        attraction: pick(ATTRACTIONS),
        comfort: pick(COMFORTS),
        desire: pick(DESIRES),
        resonance: pick(RESONANCES),
      },
      avatarExperience: generateAvatarExperience(name, data.titles[idx], personality),
      moreItems: data.titles.filter((_, i) => i !== idx).slice(0, 2),
    };
  });

  const topThree = categories
    .slice(0, 3)
    .map((c) => ({ title: c.title, summary: c.summary, category: c.category }));

  const timeline = categories.map((c, i) => {
    const hour = 8 + i * 2;
    const min = Math.floor(Math.random() * 60).toString().padStart(2, "0");
    return `${name} 昨天 ${hour}:${min} 发现了「${c.title}」很有意思，感受到${c.dimensions.feeling}`;
  });

  const dailySummary = `昨天${name}一共体验了${categories.length}个领域，发现了${topThree.length}件特别有意思的事。整体来看，${name}对${topThree[0].category}方向的内容最感兴趣，与${personality}的性格高度契合。`;

  return {
    date,
    avatarName: name,
    topThree,
    categories,
    dailySummary,
    timeline,
  };
}

function generateAvatarExperience(name: string, title: string, personality: string): string {
  const templates = [
    `作为一个${personality}的人，我看到「${title}」的第一眼就被吸引住了。读完之后有一种被击中的感觉，很多想法在脑子里翻涌，想象自己真正去体验一下，感觉会很有收获。`,
    `「${title}」这个内容让我停下来想了很久。它触碰到了我一直在思考但没有整理清楚的问题，感觉找到了一个思考的入口。`,
    `以我的性格来说，「${title}」这类内容正是我需要的。它不只是信息，更像是一面镜子，让我看到了自己某个部分。`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
