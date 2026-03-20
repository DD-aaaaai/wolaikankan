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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarProfile: true },
  });

  const avatarName = user?.avatarProfile?.avatarName || "我的分身";
  const profile = user?.avatarProfile;

  // 为 2048 注入个性化深度体验报告
  const games: GameItem[] = BASE_GAMES.map((g) => {
    if (g.id === "2048" && profile) {
      return {
        ...g,
        report: generate2048Report({
          avatarName: profile.avatarName,
          personality: profile.personality,
          occupation: profile.occupation,
          goal: profile.goal,
          story: profile.story,
          slogan: profile.slogan,
        }),
      };
    }
    return g;
  });

  return NextResponse.json({ games, avatarName });
}
