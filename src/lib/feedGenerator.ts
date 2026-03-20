export interface FeedItem {
  category: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  dimensions: {
    feeling: string;
    attraction: string;
    comfort: string;
    desire: string;
    resonance: string;
  };
  avatarExperience: string;
  moreItems: { title: string; url: string }[];
}

export interface DailyFeedData {
  date: string;
  avatarName: string;
  topThree: { title: string; summary: string; category: string; sourceUrl: string }[];
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

// 从标题中提取短关键词（取冒号前第一段，最多12字），大幅提升搜索命中率
function toSearchQuery(title: string): string {
  const first = title.split("：")[0].split("？")[0].split("，")[0];
  return first.slice(0, 12);
}

// 根据分类生成搜索 URL，永不过期
function makeSearchUrl(title: string, category: "work" | "growth" | "entertainment" | "health" | "relationship" | "other"): { url: string; source: string } {
  const q = encodeURIComponent(toSearchQuery(title));
  switch (category) {
    case "work":
      return { url: `https://36kr.com/search/articles/${q}`, source: "36氪" };
    case "growth":
      return { url: `https://sspai.com/search?q=${q}`, source: "少数派" };
    case "entertainment":
      return { url: `https://search.bilibili.com/all?keyword=${q}`, source: "哔哩哔哩" };
    case "health":
      return { url: `https://www.zhihu.com/search?type=content&q=${q}`, source: "知乎" };
    case "relationship":
      return { url: `https://www.zhihu.com/search?type=content&q=${q}`, source: "知乎" };
    case "other":
      return { url: `https://www.douban.com/search?q=${q}`, source: "豆瓣" };
  }
}

function makeMoreUrl(title: string, category: "work" | "growth" | "entertainment" | "health" | "relationship" | "other"): string {
  return makeSearchUrl(title, category).url;
}

interface RawItem {
  title: string;
  summary: string;
}

const RAW_CONTENT: Record<string, { items: RawItem[]; more: string[][] }> = {
  work: {
    items: [
      { title: "AI编程工具正在重塑软件开发岗位：哪些能力将成为核心竞争力", summary: "AI辅助编程工具的普及并非在替代程序员，而是在重新定义什么是有价值的编程能力——系统设计、业务理解和代码审查能力正变得比纯粹的代码编写更重要。" },
      { title: "远程协作的未来：异步工作文化正在重塑职场", summary: "越来越多的企业开始拥抱异步工作文化，文档化思维和深度工作时间成为新职场核心竞争力。异步团队的决策质量更高，但需要更强的书面表达能力。" },
      { title: "创业公司为何死于过度融资：资金充裕反而是陷阱", summary: "过多的资金会让创业公司失去危机感，反而削弱执行力。最好的创业公司往往在资源匮乏时期打磨出真正有价值的产品。" },
    ],
    more: [
      ["职场中的能量管理：为什么努力方向比努力程度更重要", "企业数字化转型的真相：技术只是最简单的部分"],
      ["产品经理的核心能力：在不确定性中做决策", "技术债务的代价：为什么快公司最终都变慢了"],
      ["中台战略的失落：大公司的组织实验为何屡屡失败", "独立开发者的崛起：一个人也能做出百万用户产品"],
    ],
  },
  growth: {
    items: [
      { title: "费曼学习法的真正精髓：用简单语言解释复杂概念", summary: "真正的理解是能向一个孩子解释清楚。费曼技巧的核心不是技巧本身，而是诚实面对自己的认知盲区——当你无法简单解释时，说明你还没真正理解。" },
      { title: "为什么聪明人总是学不会新技能：刻意练习的误区", summary: "刻意练习不是简单的重复，而是在舒适区边缘持续挑战自己。大多数人以为自己在练习，实际上只是在表演熟练。真正的成长发生在那个让你感到轻微不适的地方。" },
      { title: "读书笔记的终极形态：构建你自己的知识网络", summary: "知识只有连接才有价值。卡片盒笔记法的精髓是让笔记之间产生对话，而不是把别人的思想收纳进自己的箱子。你的笔记系统应该反映你独特的思维方式。" },
    ],
    more: [
      ["每天15分钟的冥想如何改变决策方式", "深度阅读的消亡：为什么我们越来越难以专注"],
      ["习惯的神经科学：为什么改变如此之难", "第二曲线思维：如何在舒适区之外寻找成长"],
      ["写作是最好的思考方式：为什么聪明人都在写作", "学习新语言的最快方式：沉浸式学习的科学"],
    ],
  },
  entertainment: {
    items: [
      { title: "《哪吒2》全球票房破百亿：国产动画的文化输出时代来了", summary: "哪吒2不只是一部动画电影，它是中国文化自信的一次集中爆发。技术上的突破固然重要，但真正打动观众的是那个关于「我命由我不由天」的普世主题——叛逆与自我认同的张力。" },
      { title: "Steam年度最佳独立游戏：小团队如何做出百万销量", summary: "独立游戏的成功往往来自于对某一种情感的极致表达。大制作游戏追求全面，独立游戏追求独特。玩家愿意为真诚买单，而不仅仅是为精良的制作。" },
      { title: "播客的黄金时代：长内容在碎片化时代反而逆势崛起", summary: "当短视频占据注意力的时候，两小时的播客却拥有更高的用户粘性。深度对话满足的是人们对真实连接的渴望——那种感觉像是在听两个聪明朋友深夜聊天的体验。" },
    ],
    more: [
      ["沉浸式戏剧为何让人欲罢不能", "游戏化学习的边界：什么时候娱乐变成了浪费时间"],
      ["音乐与情绪：为什么某些旋律能直接触发记忆", "短剧的兴起：三分钟讲完一个故事是艺术还是堕落"],
      ["电子竞技的职业化之路：玩游戏也能成为正经工作", "Vlog文化的本质：我们为什么迷恋看别人的日常"],
    ],
  },
  health: {
    items: [
      { title: "间歇性禁食的最新研究：16:8方案真的适合所有人吗", summary: "最新研究表明间歇性禁食对代谢健康确有益处，但个体差异显著。对于女性、运动员和有血糖问题的人群，标准方案可能需要调整。找到适合自己的饮食节律比跟风更重要。" },
      { title: "久坐的隐形代价：每小时起身走动如何改变你的健康", summary: "连续久坐超过一小时，即使你每天有规律锻炼，仍然面临代谢风险。研究表明，每小时起身活动两分钟可以显著降低全因死亡率。站立不够——走动才是关键。" },
      { title: "深度睡眠才是关键：睡眠质量比时长更重要的科学证据", summary: "大脑的清洁系统主要在深度睡眠阶段运作，清除神经毒素。睡八小时但深度睡眠不足，效果可能不如高质量的六小时。睡前1小时的行为习惯决定了睡眠质量。" },
    ],
    more: [
      ["冷水浴的科学：为什么越来越多人开始每天洗冷水澡", "正念饮食：放慢进食速度如何改变你与食物的关系"],
      ["肠道菌群与情绪：你的第二大脑在告诉你什么", "力量训练的被低估价值：有氧运动并不是唯一答案"],
      ["数字排毒的真相：减少屏幕时间真的让人更快乐吗", "慢性压力的身体代价：皮质醇如何悄悄损害你的健康"],
    ],
  },
  relationship: {
    items: [
      { title: "非暴力沟通：当我们学会说「我需要」而不是「你应该」", summary: "马歇尔·卢森堡的非暴力沟通框架改变了无数人的关系质量。核心转变是：从评判对方的行为，转向表达自己的感受和需求。「我感到失落」比「你让我失望」更能打开对话的空间。" },
      { title: "孤独的流行病：为什么现代人越来越难建立真正的友谊", summary: "研究显示成年后建立深度友谊变得越来越难。真正的友谊需要共同的脆弱时刻，而不仅仅是共同的经历。我们有数百个联系人，却可能没有一个可以在凌晨三点打电话的人。" },
      { title: "边界感不是冷漠，是对关系最深的尊重", summary: "健康的边界来自清晰的自我认知，而不是对他人的抵御。当你能清楚地说「这件事我可以做，那件事我做不到」，关系反而变得更安全和真实。" },
    ],
    more: [
      ["亲密关系中的依恋类型：你是焦虑型、回避型还是安全型", "如何与父母建立成年人之间的平等关系"],
      ["友情的维护成本：为什么不联系不代表不在乎", "职场关系的边界：同事可以成为朋友吗"],
      ["数字时代的亲密关系：手机屏幕是否正在侵蚀你的感情", "冲突的价值：为什么好的关系不应该总是和谐的"],
    ],
  },
  other: {
    items: [
      { title: "城市漫游者：用双脚丈量一座城市的灵魂", summary: "「漂移」是情境主义国际提出的城市探索方式——放弃目的地，跟着感觉走，让城市的肌理自然浮现。真正认识一座城市，不是看景点，而是在迷路中遇见它的日常。" },
      { title: "手工艺的复兴：Z世代为什么开始迷恋做陶器和编织", summary: "在一切都可以被AI生成的时代，年轻人开始用双手找回存在感。手工艺的魅力不在于产品，而在于那个「做了就是做了」的真实过程——一种算法无法复制的具身体验。" },
      { title: "加缪的荒诞哲学：在无意义中寻找意义的艺术", summary: "「我们必须设想西西弗是幸福的。」加缪的荒诞主义不是绝望，而是一种反叛——在承认世界本质上无意义的前提下，依然选择热烈地活着。" },
    ],
    more: [
      ["微型生活：极简主义者如何用更少拥有更多", "旅行的意义：为什么移动本身就是目的"],
      ["语言塑造思维：你说的语言如何影响你看世界的方式", "收藏的心理学：为什么人类热衷于囤积物品"],
      ["慢食运动：当吃饭重新变成一件值得认真对待的事", "星空摄影入门：用相机捕捉宇宙的浩瀚"],
    ],
  },
};

export function generateMockFeed(
  profile: { avatarName?: string | null; personality?: string | null; occupation?: string | null; goal?: string | null },
  date: string
): DailyFeedData {
  const name = profile.avatarName || "我的分身";
  const personality = profile.personality || "思考型、喜欢探索";
  const dateSeed = parseInt(date.replace(/-/g, "")) || 0;

  const categories: FeedItem[] = CATEGORIES.map(({ key, label }, catIdx) => {
    const raw = RAW_CONTENT[key];
    const idx = (dateSeed + catIdx) % raw.items.length;
    const item = raw.items[idx];
    const moreIdx = (dateSeed + catIdx) % raw.more.length;
    const catKey = key as "work" | "growth" | "entertainment" | "health" | "relationship" | "other";
    const { url, source } = makeSearchUrl(item.title, catKey);

    return {
      category: label,
      title: item.title,
      summary: item.summary,
      sourceUrl: url,
      sourceName: source,
      dimensions: {
        feeling: pick(FEELINGS),
        attraction: pick(ATTRACTIONS),
        comfort: pick(COMFORTS),
        desire: pick(DESIRES),
        resonance: pick(RESONANCES),
      },
      avatarExperience: generateAvatarExperience(name, item.title, personality),
      moreItems: raw.more[moreIdx].map((title) => ({
        title,
        url: makeMoreUrl(title, catKey),
      })),
    };
  });

  const topThree = categories.slice(0, 3).map((c) => ({
    title: c.title, summary: c.summary, category: c.category, sourceUrl: c.sourceUrl,
  }));

  const timeline = categories.map((c, i) => {
    const hour = 8 + i * 2;
    const min = ((dateSeed * (i + 1)) % 60).toString().padStart(2, "0");
    return `${name} 昨天 ${hour}:${min} 发现了「${c.title}」（${c.sourceName}），感受到${c.dimensions.feeling}`;
  });

  const dailySummary = `昨天${name}一共体验了${categories.length}个领域，发现了${topThree.length}件特别有意思的事。整体来看，${name}对${topThree[0].category}方向的内容最感兴趣，与${personality}的性格高度契合。`;

  return { date, avatarName: name, topThree, categories, dailySummary, timeline };
}

function generateAvatarExperience(name: string, title: string, personality: string): string {
  const templates = [
    `作为一个${personality}的人，我看到「${title}」的第一眼就被吸引住了。读完之后有一种被击中的感觉，很多想法在脑子里翻涌，想象自己真正去体验一下，感觉会很有收获。`,
    `「${title}」这个内容让我停下来想了很久。它触碰到了我一直在思考但没有整理清楚的问题，感觉找到了一个新的思考入口，值得认真去读一读。`,
    `以我的性格来说，「${title}」这类内容正是我需要的。它不只是信息，更像是一面镜子，让我看到了自己某个部分的倒影。`,
  ];
  return templates[(name.length + title.length) % templates.length];
}
