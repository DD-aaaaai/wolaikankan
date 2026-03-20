import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export interface ReportSection {
  title: string;
  content: string;
}

export interface GameItem {
  id: string;
  name: string;
  genre: string;
  coverEmoji: string;
  description: string;
  url: string;
  avatarReview: string;
  dimensions: { fun: string; challenge: string; engagement: string; time: string };
  tags: string[];
  report?: ReportSection[]; // 仅 2048 有深度体验报告
}

// 根据分身人设生成专属 2048 体验报告
function generate2048Report(profile: {
  avatarName?: string | null;
  personality?: string | null;
  occupation?: string | null;
  goal?: string | null;
  story?: string | null;
  slogan?: string | null;
}): ReportSection[] {
  const name = profile.avatarName || "分身";
  const personality = profile.personality || "思考型、喜欢探索";
  const occupation = profile.occupation || "互联网从业者";
  const goal = profile.goal || "做有价值的事";
  const story = profile.story || "";
  const slogan = profile.slogan || "";

  // 根据不同人设特征调整报告的侧重点
  const hasCreative = /设计|创意|艺术|美术|创作/.test(personality + occupation);
  const hasTech = /程序|技术|工程|开发|AI|算法/.test(personality + occupation);
  const hasAnalytic = /分析|逻辑|研究|数据|策略|理性/.test(personality + occupation);
  const hasPhilo = /哲学|思考|文学|写作|读书|阅读/.test(personality + occupation);
  const hasEntrepreneur = /创业|产品|商业|运营|管理/.test(personality + occupation);

  // 第一节：初见印象（根据人设调整视角）
  let firstImpression: string;
  if (hasTech) {
    firstImpression = `作为一个长期和代码打交道的人，我第一眼看到 2048 的棋盘，脑子里冒出来的第一个念头是：「这不就是一个合并算法的可视化吗？」二叉树的归并、贪心策略的局限性——棋盘上的每一格，对我来说都不只是数字，更像是某种计算问题的缩影。但真正上手之后，我发现理性分析在这里并不总是有用的，有些时候你就是需要凭感觉走那一步。`;
  } else if (hasCreative) {
    firstImpression = `我最先注意到的不是规则，而是那些数字的颜色变化——从米白到橙红，每一个数字的色温都在悄悄告诉你它的「重量」。作为一个对视觉敏感的人，我意识到 2048 的设计者在用颜色做了一件很聪明的事：让你在没意识到的情况下，通过颜色深浅判断棋局的紧张程度。这是一种很克制的美学。`;
  } else if (hasPhilo) {
    firstImpression = `${name}初次面对这个只有数字的棋盘，脑子里浮现出一个古老的隐喻——西西弗斯。你不断地合并、叠加，数字越来越大，但棋盘却越来越满。目标就在那里（2048），但每一步都可能离失败更近。这是一种悲观主义者会喜欢的游戏：它让「努力」和「结果」之间保持了足够的不确定性。`;
  } else if (hasEntrepreneur) {
    firstImpression = `第一局我输得很快，因为我习惯性地「走一步看一步」——这是做产品时的直觉，先验证再迭代。但在 2048 里，这个策略是错的。你必须在全局布局没崩之前，就想好三到四步之后的状态。这让我想起了那些因为太专注当下而错过战略时机的创业公司。`;
  } else {
    firstImpression = `${name}第一次打开 2048，以为是个简单的数字游戏。结果第一局只走到 512 就棋盘全满，游戏结束。当下有一种奇妙的懊恼——不是沮丧，而是那种「我明明可以更好」的确信感。这种感觉让我忍不住再来一局。`;
  }

  // 第二节：游戏过程中的观察（结合职业和目标）
  let duringPlay: string;
  if (hasAnalytic || hasTech) {
    duringPlay = `我很快发现了「固定角落」策略：把最大的数字锁在一个角，围绕它建立梯度结构。这本质上是一种局部最优解的构建——先稳住核心资产，再扩展边缘。联系到${occupation}的工作，这和我们做系统架构时的核心原则几乎一样：先定好最重要的那个锚点，其他的问题就有了可以依附的结构。

    但有一点是 2048 教会我的、工作里容易忽视的：当你过度追求「最优解」，反而容易因为某一步的纠结而错失全局。有时候「够好的选择」比「完美的选择」更重要，因为棋盘不会等你想清楚。`;
  } else if (hasEntrepreneur) {
    duringPlay = `下棋的过程让我开始把每一格数字想象成资源：人才、资金、时间。合并意味着整合，棋盘满了意味着资源枯竭。我意识到自己在游戏里的直觉和在工作中的直觉高度一致——总是倾向于「先把大的合并了再说」，而忽视了棋盘整体的流动性。

    真正高分的玩家往往不是最激进的，而是最能「保持空间」的。这句话值得抄下来贴在桌上。`;
  } else {
    duringPlay = `玩到第三局，我开始注意到自己的操作模式：向左、向下、向左、向下——一种机械的重复，像是某种防御性的本能。它让棋局维持运转，但从不主动创造突破。

    然后我强迫自己改变：开始故意走那些「感觉不对」的方向，反而有几次打出了意想不到的合并。也许${personality}的我，在游戏里也会把这个习惯带进来——稳定但稍欠冒险。`;
  }

  // 第三节：与自身的镜像对比（联系人设核心）
  let selfReflection: string;
  if (goal && goal.length > 5) {
    selfReflection = `下棋途中我想到了我的目标：「${goal}」。2048 里有一个很残酷的设计——你距离目标越近，每一步的压力就越大，因为失误的代价越来越高。这和追求真实目标时的感受高度吻合：越接近，越谨慎，越害怕搞砸。

    但 2048 同时也在告诉你：如果因为太怕失败而停止走棋，你只会更快输掉。前进的成本，永远低于原地踏步的成本。`;
  } else if (story && story.length > 10) {
    const storySnippet = story.slice(0, 30);
    selfReflection = `「${storySnippet}……」——${name}的来路里有这样的经历。2048 给我最强的联想正是这一点：你现在的每一格数字，都是过去无数次合并积累下来的。棋盘不会凭空出现大数字，正如人不会无缘无故变得更强——都是一次次小合并、小积累的结果，只是过程不总是被看见。`;
  } else {
    selfReflection = `以${name}的性格来说，玩 2048 最容易犯的错误大概是「执念」——太想把某两块合并，以至于为了等待而错失了更好的时机。这种执念在${occupation}的工作里也出现过：有时候太坚持某一个解法，反而看不见更简洁的路。

    游戏可以重来，而很多现实的决策不行。能在一个可重来的环境里练习「放弃执念」，也许是 2048 比看起来更有价值的地方。`;
  }

  // 第四节：总结与评分（个性化结语）
  const closingBase = slogan
    ? `${name}的 slogan 是「${slogan}」。下完几局 2048 之后，这句话在我脑子里转了好几遍。`
    : `${name}在游戏结束后坐了一会儿，没有立刻开始下一局。`;

  const closing = `${closingBase}

2048 是一个关于「在有限空间里做出最优选择」的游戏，这件事比表面上看起来更难，也更值得认真对待。它不教你如何赢，它只是一遍遍地让你看见自己的选择模式。

${name}的综合评价：★★★★☆
推荐理由：适合在碎片时间里用来校准自己的决策直觉。如果你发现自己总是以同一种方式失败，这本身就是最大的收获。`;

  return [
    { title: "初见印象", content: firstImpression },
    { title: "体验过程", content: duringPlay },
    { title: "镜中的自己", content: selfReflection },
    { title: "分身总结", content: closing },
  ];
}

const BASE_GAMES: Omit<GameItem, "report">[] = [
  {
    id: "2048",
    name: "2048",
    genre: "数字益智",
    coverEmoji: "🔢",
    description: "滑动方格让相同数字合并，目标是拼出 2048，纯网页版无需安装",
    url: "https://play2048.co/",
    avatarReview: "2048 最残忍的地方在于：你看似在进步，但一个错误的滑动就可能把整盘棋送进死局。能在一个小游戏里体验到「后悔」的情绪，并且在下一局立刻重来，这本身就是一种奢侈。",
    dimensions: { fun: "烧脑", challenge: "很高", engagement: "深度", time: "专注块" },
    tags: ["数字", "策略", "挑战"],
  },
  {
    id: "flappy",
    name: "Flappy Bird",
    genre: "休闲挑战",
    coverEmoji: "🐦",
    description: "点击让小鸟上升穿越水管，手感极简，死亡率极高",
    url: "https://flappybird.io/",
    avatarReview: "几乎每次死亡都觉得「是手滑」，忍不住再来一局。简单的规则+极高的失败率，反而是最让人欲罢不能的组合。",
    dimensions: { fun: "虐心", challenge: "极高", engagement: "反复重来", time: "短局" },
    tags: ["挑战", "反应", "虐心"],
  },
  {
    id: "snake",
    name: "贪吃蛇",
    genre: "经典休闲",
    coverEmoji: "🐍",
    description: "控制蛇吃食物让身体变长，不能碰墙也不能咬到自己",
    url: "https://playsnake.org/",
    avatarReview: "贪吃蛇是一个关于「成长代价」的游戏——你越强大，活动空间就越小。我在高分时反而更容易紧张犯错，大概是「害怕失去」的心理负担突然变重了。",
    dimensions: { fun: "经典", challenge: "中等", engagement: "稳定", time: "随意" },
    tags: ["经典", "反应", "策略"],
  },
  {
    id: "minesweeper",
    name: "扫雷",
    genre: "逻辑推理",
    coverEmoji: "💣",
    description: "根据数字线索推断地雷位置，全部标出即可胜利，踩雷即失败",
    url: "https://minesweeper.online/",
    avatarReview: "扫雷是一个纯靠逻辑推理的游戏，没有手速要求，只要推理正确就一定能赢。第一次全程靠推理破解一局，那种清醒的满足感，比打游戏更像解一道数学题。",
    dimensions: { fun: "烧脑", challenge: "高", engagement: "沉浸", time: "需专注" },
    tags: ["逻辑", "推理", "经典"],
  },
  {
    id: "tetris",
    name: "俄罗斯方块",
    genre: "益智消除",
    coverEmoji: "🟦",
    description: "经典方块堆叠，消除完整行得分，纯 H5 网页版，支持键盘操作",
    url: "https://jstris.jezevec10.com/",
    avatarReview: "俄罗斯方块让我意识到「整理」本身就是一种本能需求。当一行被完整消除，那一刻的满足感几乎是条件反射。更有趣的是：明知道这块放这里不好，还是会因为「先对付一下」而放下去，然后后悔——这个坏习惯在生活里也有。",
    dimensions: { fun: "稳定爽快", challenge: "渐进", engagement: "高", time: "随意" },
    tags: ["经典", "策略", "消除"],
  },
  {
    id: "pacman",
    name: "吃豆人",
    genre: "经典街机",
    coverEmoji: "🟡",
    description: "Google 经典街机版吃豆人，吃豆子躲鬼魂，网页直接游玩",
    url: "https://www.google.com/logos/2010/pacman10-i.html",
    avatarReview: "吃豆人是我玩过的第一款「永远不会赢」的游戏——鬼魂越来越快，关卡永远不会结束，只有死亡才是终点。但正是因为知道终将失败，每一次多坚持一秒都成了小小的胜利。",
    dimensions: { fun: "经典爽快", challenge: "反应力", engagement: "上瘾", time: "碎片" },
    tags: ["街机", "经典", "反应"],
  },
  {
    id: "wordle",
    name: "Wordle 猜词",
    genre: "文字益智",
    coverEmoji: "🔤",
    description: "六次机会猜出五字母单词，颜色提示缩小范围，每天一局",
    url: "https://wordplay.com/",
    avatarReview: "Wordle 把游戏从「无限消耗」变成了「每日仪式」。一天一局的限制，反而让每次尝试都有重量。也许有些东西，稀缺才珍贵。",
    dimensions: { fun: "益脑", challenge: "中等", engagement: "每日一局", time: "极短" },
    tags: ["文字", "益智", "每日"],
  },
  {
    id: "chess",
    name: "国际象棋",
    genre: "策略对弈",
    coverEmoji: "♟️",
    description: "与 AI 对弈国际象棋，支持难度选择，网页版即开即玩",
    url: "https://www.chess.com/play/computer",
    avatarReview: "下棋的时候我会忘记时间。每走一步都要强迫自己多想两步——这种「提前想象未来」的训练，某种程度上是一种思维的冥想。和 AI 下棋最纯粹的地方是：它没有情绪，永远不会因为你走了个妙手而惊慌失措。",
    dimensions: { fun: "烧脑", challenge: "可调节", engagement: "深度", time: "较长" },
    tags: ["策略", "对弈", "思考"],
  },
];

// ── 大型3D游戏推荐数据库 ──────────────────────────────────────────

interface GameRecommendation {
  id: string; name: string; nameEn: string; genre: string[]; platform: string;
  coverEmoji: string; shortDesc: string; detailDesc: string;
  whyForYou: string; matchTags: string[];
  links: { steam?: string; gamersky: string; threeDm: string };
  tags: string[];
}

interface AvatarProfile {
  avatarName?: string | null; personality?: string | null; occupation?: string | null;
  goal?: string | null; story?: string | null; slogan?: string | null;
}

type PoolGame = Omit<GameRecommendation, "whyForYou" | "matchTags"> & {
  matchKeywords: string[];
  template: (p: AvatarProfile) => string;
};

const BIG_GAME_POOL: PoolGame[] = [
  {
    id: "black-myth", name: "黑神话：悟空", nameEn: "Black Myth: Wukong",
    genre: ["动作RPG", "神话", "国产精品"], platform: "PC / PS5", coverEmoji: "🐒",
    shortDesc: "首款国产3A大作，改编自《西游记》，斗战胜佛的前传故事",
    detailDesc: `《黑神话：悟空》2024年8月发售后迅速成为Steam历史同时在线人数最高的单机游戏。\n\n玩家扮演「天命人」踏上寻找六根之物的征途，六回剧情覆盖山西古寺到热带密林，视觉极具中国美学特色。\n\n战斗系统深度而流畅：变身技能、棍法与魔法可以自由组合，每场Boss战都是独立叙事体验——你会在战斗中理解这个角色为何变成了怪物。\n\n这不只是一款游戏，更是中国文化输出的里程碑。`,
    matchKeywords: ["文化", "哲学", "艺术", "创意", "设计", "中国", "传统", "故事", "叙事", "国学", "美学"],
    template: (p) => `以${p.personality || "对事物有深度思考"}的你来说，《黑神话》的叙事层次会让你着迷——每一个妖怪都是一段人性的寓言，而不只是需要击败的障碍。${p.occupation ? `作为${p.occupation}，` : ""}你会在这个游戏里看到中国文化被以前所未有的方式重新诠释。`,
    links: { steam: "https://store.steampowered.com/app/2358720/", gamersky: "https://www.gamersky.com/search/黑神话悟空/", threeDm: "https://www.3dmgame.com/search/黑神话悟空/" },
    tags: ["国产3A", "神话", "动作", "Boss战", "必玩"],
  },
  {
    id: "elden-ring", name: "艾尔登法环", nameEn: "Elden Ring",
    genre: ["魂类动作", "开放世界", "黑暗奇幻"], platform: "PC / PS5 / Xbox", coverEmoji: "⚔️",
    shortDesc: "宫崎英高 × 乔治·马丁打造，魂类游戏史上最高评分作品",
    detailDesc: `《艾尔登法环》2022年发售后斩获众多年度游戏大奖，Metacritic评分96分。\n\n广袤的「交界地」开放世界，每一片新区域的解锁都是对探索精神的奖励，地下城、古遗址、隐藏BOSS遍布各处。\n\n战斗继承魂系高难度与高成就感：精准翻滚时机、武器战技系统、元素属性搭配，每一次击败强大Boss都是真实成就。\n\n世界观叙事极其独特：所有故事藏在道具描述、NPC只言片语和场景细节里，等待好奇心旺盛的人去拼凑。`,
    matchKeywords: ["挑战", "坚持", "成长", "探索", "逻辑", "分析", "研究", "独立", "自主"],
    template: (p) => `《艾尔登法环》为愿意在挫败中成长的人而设计。${p.goal ? `你的目标是「${p.goal}」——` : ""}在这个游戏里，每一次死亡都是一次数据，每一次重试都是一次迭代。这种思维方式，会让你比大多数玩家更快找到攻略Boss的规律。`,
    links: { steam: "https://store.steampowered.com/app/1245620/", gamersky: "https://www.gamersky.com/search/艾尔登法环/", threeDm: "https://www.3dmgame.com/search/艾尔登法环/" },
    tags: ["魂类", "高难度", "开放世界", "年度游戏", "史诗"],
  },
  {
    id: "cyberpunk", name: "赛博朋克 2077", nameEn: "Cyberpunk 2077",
    genre: ["开放世界RPG", "科幻", "动作"], platform: "PC / PS5 / Xbox", coverEmoji: "🤖",
    shortDesc: "近未来夜之城，在霓虹与阴暗之间寻找真正的自由",
    detailDesc: `《赛博朋克2077》经2.0版本大改后，成为近年口碑最高的开放世界游戏之一。\n\n2077年夜之城：企业权力凌驾于政府的反乌托邦大都会。玩家扮演雇佣兵「V」，因意外将传奇摇滚明星数字残魂植入脑中，展开寻找解法的旅程。多条主线分支，不同选择导向截然不同的结局。\n\n游戏世界细节密度惊人：每个NPC有自己的日程，广告牌文字充满讽刺，2.0版本技能树可打造黑客流、刀客流、枪手流等完全不同风格。\n\n《幻影自由》DLC是近年最好的游戏叙事之一。`,
    matchKeywords: ["技术", "程序", "AI", "科技", "未来", "互联网", "创业", "产品", "系统", "数字", "自由"],
    template: (p) => `${p.occupation ? `作为${p.occupation}，` : ""}你每天面对的关于技术与人性边界的问题，《赛博朋克》用极致的反乌托邦世界给出了一种答案。游戏里的「义体改造」和「数字意识」，是对当下技术发展最尖锐的提问。`,
    links: { steam: "https://store.steampowered.com/app/1091500/", gamersky: "https://www.gamersky.com/search/赛博朋克2077/", threeDm: "https://www.3dmgame.com/search/赛博朋克2077/" },
    tags: ["科幻", "开放世界", "赛博朋克", "多结局", "神作"],
  },
  {
    id: "baldurs-gate-3", name: "博德之门 3", nameEn: "Baldur's Gate 3",
    genre: ["回合制RPG", "奇幻", "策略"], platform: "PC / PS5", coverEmoji: "🎲",
    shortDesc: "史上最佳RPG之一，每一个选择都真实影响世界走向",
    detailDesc: `《博德之门3》2023年横扫几乎所有年度游戏奖项，被IGN、Metacritic评为史上最佳RPG之一。\n\n12个种族、12个职业及大量子职业，角色创建深度极高。被心灵杀手蝌蚪寄生的五位角色被迫同行，寻找治愈方法，随着剧情深入揭示更宏大的阴谋。\n\n选择的真实性令人惊叹：战斗、谈判、偷窃、魔法欺骗，几乎可以用任何方式解决任何问题。每个同伴都有完整的价值观和心理弧线。\n\n四人联机模式：不同玩家的选择可能在同一局造成完全对立的后果。`,
    matchKeywords: ["策略", "选择", "团队", "管理", "决策", "逻辑", "规划", "创业", "社交", "关系", "协作"],
    template: (p) => `《博德之门3》最契合${p.personality || "注重思考与决策"}的人——游戏里的每一个选择都有真实后果，没有「正确答案」，只有「你是谁」的答案。${p.goal ? `你的目标「${p.goal}」，` : ""}会在游戏里以意想不到的方式得到共鸣。`,
    links: { steam: "https://store.steampowered.com/app/1086940/", gamersky: "https://www.gamersky.com/search/博德之门3/", threeDm: "https://www.3dmgame.com/search/博德之门3/" },
    tags: ["RPG神作", "策略", "龙与地下城", "年度游戏", "多人联机"],
  },
  {
    id: "rdr2", name: "荒野大镖客：救赎 2", nameEn: "Red Dead Redemption 2",
    genre: ["开放世界", "西部", "叙事"], platform: "PC / PS4 / Xbox", coverEmoji: "🤠",
    shortDesc: "史上叙事最丰富的开放世界，关于一个时代的末日与人性的重量",
    detailDesc: `《荒野大镖客：救赎2》2018年发售，被众多玩家和媒体誉为「史上最好的开放世界游戏」。\n\n1899年美国西部开发的尾声，玩家扮演荒野骑士Arthur Morgan，跟随范德林德匪帮经历最后的岁月。关于忠诚、背叛、救赎与时代终结的史诗。\n\n细节真实度令人窒息：马匹会因长时间骑行而疲惫，武器需要定期清洁，NPC会记住你上次见面时的行为。\n\nArthur Morgan是游戏史上塑造最完整的主角之一，很多玩家在结局时落泪，因为那种「失去了一个真实的朋友」的感觉。`,
    matchKeywords: ["故事", "叙事", "人文", "情感", "历史", "写作", "文学", "哲学", "慢", "体验", "旅行"],
    template: (p) => `《荒野大镖客2》是那种能让你忘记时间的游戏。Arthur Morgan的故事不是英雄主义的故事，而是关于「如何在不完美的处境里做一个好人」的故事。${p.slogan ? `你的slogan「${p.slogan}」和这个游戏的主题有某种奇妙的契合。` : ""}`,
    links: { steam: "https://store.steampowered.com/app/1174180/", gamersky: "https://www.gamersky.com/search/荒野大镖客2/", threeDm: "https://www.3dmgame.com/search/荒野大镖客2/" },
    tags: ["叙事神作", "西部", "开放世界", "情感", "必玩"],
  },
  {
    id: "witcher3", name: "巫师 3：狂猎", nameEn: "The Witcher 3: Wild Hunt",
    genre: ["开放世界RPG", "奇幻", "道德抉择"], platform: "PC / PS5 / Xbox / Switch", coverEmoji: "🐺",
    shortDesc: "道德灰色地带的最佳诠释，每个决定都没有绝对的对与错",
    detailDesc: `《巫师3》2015年发售至今仍在「史上最佳游戏」榜单稳居前列，2022年次世代版本视觉进一步提升。\n\n玩家扮演猎魔人杰洛特，在一个满目疮痍的北方大陆寻找养女希里。精灵、矮人受到歧视，人类内部充斥政治阴谋，没有任何一方是绝对的「正义」。\n\n道德系统的复杂性是其最大特色：几乎每一个重要任务都没有「好选择」和「坏选择」，只有不同的权衡取舍。\n\n两个DLC的质量不亚于完整游戏，《血与酒》构建的托森特公国是游戏史上最美的地图之一。`,
    matchKeywords: ["哲学", "伦理", "道德", "文学", "思考", "复杂", "灰色", "社会", "人性", "研究", "分析"],
    template: (p) => `《巫师3》最适合${p.personality?.includes("思考") || p.personality?.includes("哲学") ? "有哲学思考倾向" : "喜欢深度叙事"}的人。它不问「你是英雄还是坏人」，它问「在没有完美答案的世界里，你如何做决定？」——这个问题，${p.occupation ? `在${p.occupation}的工作里` : "在现实里"}你大概也经常面对。`,
    links: { steam: "https://store.steampowered.com/app/292030/", gamersky: "https://www.gamersky.com/search/巫师3/", threeDm: "https://www.3dmgame.com/search/巫师3/" },
    tags: ["RPG经典", "道德选择", "开放世界", "叙事", "奇幻"],
  },
  {
    id: "death-stranding", name: "死亡搁浅", nameEn: "Death Stranding",
    genre: ["步行模拟", "科幻", "叙事"], platform: "PC / PS5 / PS4", coverEmoji: "📦",
    shortDesc: "小岛秀夫的孤独史诗，关于「连接」的最独特游戏体验",
    detailDesc: `《死亡搁浅》是小岛秀夫离开科纳米后的第一部作品，2019年发售，极其独特的游戏设计深度分裂了玩家群体。\n\n玩家扮演快递员Sam Porter Bridges，徒步穿越已崩溃的美国荒野，将物资送到孤立的各个城市。\n\n核心机制「隐性联机」：你建造的桥梁、搭设的梯子会出现在其他玩家的游戏世界；其他玩家遗留的物资，可能在你最艰难的时刻出现。整个游戏在构建「孤独个体如何构成社会连接」的隐喻。\n\n随着故事推进，所有碎片拼成一个关于「生命、死亡、失去与联结」的完整哲学论述。`,
    matchKeywords: ["孤独", "连接", "艺术", "设计", "哲学", "独立", "慢", "创意", "文艺", "内向"],
    template: (p) => `如果你对「孤独」和「连接」这两个命题感兴趣，《死亡搁浅》是少数真正在用游戏机制本身来探讨这个主题的作品。${p.personality ? `以${p.personality}的你来说，` : ""}这个游戏会让你走路的时候想很多，睡前还在回味。`,
    links: { steam: "https://store.steampowered.com/app/1190460/", gamersky: "https://www.gamersky.com/search/死亡搁浅/", threeDm: "https://www.3dmgame.com/search/死亡搁浅/" },
    tags: ["小岛秀夫", "哲学游戏", "步行模拟", "叙事", "独特体验"],
  },
];

function selectBigGames(profile: AvatarProfile, count = 4): GameRecommendation[] {
  const text = [profile.personality, profile.occupation, profile.goal, profile.story, profile.slogan].filter(Boolean).join(" ");
  const scored = BIG_GAME_POOL.map((g) => ({
    ...g,
    score: g.matchKeywords.filter((kw) => text.includes(kw)).length,
  })).sort((a, b) => b.score - a.score);

  const selected: typeof scored = [];
  const usedGenres = new Set<string>();
  for (const g of scored) {
    if (selected.length >= count) break;
    if (!usedGenres.has(g.genre[0]) || selected.length < 2) {
      selected.push(g); usedGenres.add(g.genre[0]);
    }
  }
  for (const g of scored) {
    if (selected.length >= count) break;
    if (!selected.find((s) => s.id === g.id)) selected.push(g);
  }

  return selected.map((g) => ({
    id: g.id, name: g.name, nameEn: g.nameEn, genre: g.genre,
    platform: g.platform, coverEmoji: g.coverEmoji, shortDesc: g.shortDesc,
    detailDesc: g.detailDesc,
    whyForYou: g.template(profile),
    matchTags: g.matchKeywords.filter((kw) => text.includes(kw)).slice(0, 3),
    links: g.links, tags: g.tags,
  }));
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarProfile: true },
  });

  const avatarName = user?.avatarProfile?.avatarName || "我的分身";
  const profile = user?.avatarProfile;

  const avatarProfile = {
    avatarName: profile?.avatarName,
    personality: profile?.personality,
    occupation: profile?.occupation,
    goal: profile?.goal,
    story: profile?.story,
    slogan: profile?.slogan,
  };

  // 为 2048 注入个性化深度体验报告
  const games: GameItem[] = BASE_GAMES.map((g) => {
    if (g.id === "2048") {
      return { ...g, report: generate2048Report(avatarProfile) };
    }
    return g;
  });

  // 大型3D游戏推荐（并入同一接口，避免额外 API 调用失败）
  const recommendations = selectBigGames(avatarProfile, 4);

  return NextResponse.json({ games, avatarName, recommendations });
}
