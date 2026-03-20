import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
}

// 注：仅使用 2020 年后的 4399 H5 游戏或其他可靠的 H5 游戏站
// 旧的 /flash/ 游戏均为 Flash，已于 2020 年底停止支持，全部替换
const GAMES: GameItem[] = [
  {
    id: "watermelon",
    name: "合成大西瓜",
    genre: "益智休闲",
    coverEmoji: "🍉",
    description: "拖拽水果掉落，相同水果自动合并，最终合成大西瓜",
    url: "https://www.4399.com/flash/215924.htm", // 2021 年 H5 游戏，经核实可用
    avatarReview: "每次两个西瓜合并的瞬间都有一种莫名的成就感。但当棋盘快满的时候，焦虑感会突然涌上来——我意识到这种小小的危机感，其实和现实生活里的「快撑不住了」是同一种感觉。这款游戏在解压的同时，也很隐秘地教会你要学会「留白」。",
    dimensions: { fun: "极解压", challenge: "中低", engagement: "高", time: "碎片化" },
    tags: ["解压", "策略", "合并"],
  },
  {
    id: "virus",
    name: "消灭病毒",
    genre: "射击消除",
    coverEmoji: "🔬",
    description: "操控发射器消灭屏幕上的病毒，数字相同的病毒碰撞会消除",
    url: "https://www.4399.com/flash/214819.htm", // 2020 年 H5 游戏，经核实可用
    avatarReview: "最迷人的地方在于那种「刚好消掉」的快感——一颗球精准地穿过缝隙消掉一大片，那种爽感几乎是生理层面的。玩了二十分钟后我开始思考：为什么「精准击中目标」这件事会让人如此满足？也许在乱成一团的世界里，这是我们能掌控的最小单位。",
    dimensions: { fun: "很爽", challenge: "渐进", engagement: "极高", time: "中等" },
    tags: ["射击", "消除", "爽快"],
  },
  {
    id: "2048",
    name: "2048",
    genre: "数字益智",
    coverEmoji: "🔢",
    description: "滑动方格让相同数字合并，目标是拼出 2048，纯 H5 网页版",
    url: "https://play2048.co/",
    avatarReview: "2048 最残忍的地方在于：你看似在进步，但一个错误的滑动就可能把整盘棋送进死局。这种「无法挽回的错误」让我心里有点不舒服——也许是因为太像真实的决策了。不过话说回来，能在一个小游戏里体验到「后悔」的情绪，并且在下一局立刻重来，这本身就是一种奢侈。",
    dimensions: { fun: "烧脑", challenge: "很高", engagement: "深度", time: "专注块" },
    tags: ["数字", "策略", "挑战"],
  },
  {
    id: "flappy",
    name: "Flappy Bird",
    genre: "休闲挑战",
    coverEmoji: "🐦",
    description: "点击让小鸟上升，穿越水管间的缝隙，坚持越久分越高",
    url: "https://flappybird.io/",
    avatarReview: "几乎每次死亡都觉得「是手滑」，忍不住再来一局。这款游戏的精髓在于它完全公平——死亡只有一个原因，那就是你点的时机不对。没有运气成分，没有装备加成，赤裸裸的操作和专注力比拼。玩得越久越发现，简单的规则+极高的失败率，反而是最让人欲罢不能的组合。",
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
    avatarReview: "贪吃蛇是一个关于「成长代价」的游戏——你越强大，活动空间就越小。身体越长，就越容易被自己绊倒。这个设定细想起来有点残忍，也有点真实。我在高分时反而更容易紧张犯错，大概是因为「害怕失去」的心理负担突然变重了。",
    dimensions: { fun: "经典", challenge: "中等", engagement: "稳定", time: "随意" },
    tags: ["经典", "反应", "策略"],
  },
  {
    id: "tetris",
    name: "俄罗斯方块",
    genre: "益智消除",
    coverEmoji: "🟦",
    description: "经典方块堆叠游戏，消除完整行得分，堆到顶部游戏结束",
    url: "https://jstris.jezevec10.com/",
    avatarReview: "俄罗斯方块让我意识到「整理」本身就是一种本能需求。当一行被完整消除，那一刻的满足感几乎是条件反射。但更有趣的是：即使知道这块放这里不好，也会因为「先对付一下」而放下去，然后后悔——这个坏习惯我在生活里也有。",
    dimensions: { fun: "稳定爽快", challenge: "渐进", engagement: "高", time: "随意" },
    tags: ["经典", "策略", "消除"],
  },
  {
    id: "minesweeper",
    name: "扫雷",
    genre: "逻辑推理",
    coverEmoji: "💣",
    description: "根据数字线索推断地雷位置，全部标出即可胜利，踩雷即失败",
    url: "https://minesweeper.online/",
    avatarReview: "扫雷是一个纯粹靠逻辑推理的游戏，没有手速要求，只要推理正确就一定能赢——除非你运气特别差。这让它变得和其他游戏很不一样：输了不能怪自己反应慢，只能说思路有问题。第一次全程靠推理破解一局，那种清醒的满足感，比打游戏更像解一道数学题。",
    dimensions: { fun: "烧脑", challenge: "高", engagement: "沉浸", time: "需专注" },
    tags: ["逻辑", "推理", "经典"],
  },
  {
    id: "wordle",
    name: "Wordle 猜词",
    genre: "文字益智",
    coverEmoji: "🔤",
    description: "六次机会猜出一个五字母单词，颜色提示引导你缩小范围",
    url: "https://www.nytimes.com/games/wordle/index.html",
    avatarReview: "Wordle 每天只有一局，这个设计太聪明了——它把游戏从「无限消耗」变成了「每日仪式」。第一次猜对我高兴了整个上午，失败一局又念念不忘直到第二天。一天一局的限制，反而让每次尝试都有重量。也许有些东西，稀缺才珍贵。",
    dimensions: { fun: "益脑", challenge: "中等", engagement: "每日一局", time: "极短" },
    tags: ["文字", "益智", "每日"],
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

  return NextResponse.json({ games: GAMES, avatarName });
}
