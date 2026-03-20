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

const GAMES: GameItem[] = [
  {
    id: "watermelon",
    name: "合成大西瓜",
    genre: "益智休闲",
    coverEmoji: "🍉",
    description: "拖拽水果掉落，相同水果自动合并，最终目标是合成大西瓜",
    url: "https://www.4399.com/flash/215924.htm",
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
    url: "https://www.4399.com/flash/214819.htm",
    avatarReview: "最迷人的地方在于那种「刚好消掉」的快感——一颗球精准地穿过缝隙消掉一大片，那种爽感几乎是生理层面的。玩了二十分钟后我开始思考：为什么「精准击中目标」这件事会让人如此满足？也许在乱成一团的世界里，这是我们能掌控的最小单位。",
    dimensions: { fun: "很爽", challenge: "渐进", engagement: "极高", time: "中等" },
    tags: ["射击", "消除", "爽快"],
  },
  {
    id: "archer",
    name: "弓箭传说",
    genre: "动作射击",
    coverEmoji: "🏹",
    description: "控制弓箭手自动攻击，拾取装备、升级属性，层层击败怪物",
    url: "https://www.4399.com/flash/188578.htm",
    avatarReview: "这款游戏最有意思的地方是「装备选择」——每次升级时都要在不同属性之间做取舍，有点像人生里的路口。我发现自己总是优先选「攻击力」而不是「防御」，这大概暴露了我的某种性格。一款能让你看见自己选择模式的游戏，不只是游戏了。",
    dimensions: { fun: "很有趣", challenge: "中高", engagement: "极高", time: "较长" },
    tags: ["成长", "装备", "刷怪"],
  },
  {
    id: "carrot",
    name: "保卫萝卜",
    genre: "塔防策略",
    coverEmoji: "🥕",
    description: "放置各种炮塔阻止怪物偷走萝卜，规划防线是核心乐趣",
    url: "https://www.4399.com/flash/162793.htm",
    avatarReview: "塔防游戏最考验的是「预判」——你要在怪物出现之前，就把防线布置好。这和工作里做预案是一样的逻辑。我玩到第五关因为规划失误全线崩溃，忍不住重来了三次。输的时候不沮丧，反而很想找到那个更优的解法，这种状态让我羡慕——如果面对现实问题也能这么平静就好了。",
    dimensions: { fun: "烧脑", challenge: "高", engagement: "很高", time: "需要专注" },
    tags: ["策略", "塔防", "规划"],
  },
  {
    id: "subway",
    name: "地铁跑酷",
    genre: "跑酷",
    coverEmoji: "🛤️",
    description: "操控角色在地铁轨道间奔跑，躲避障碍收集金币，速度越来越快",
    url: "https://www.4399.com/flash/196900.htm",
    avatarReview: "速度越来越快的设计真是一种隐喻——生活节奏不也是这样吗，慢慢加速，直到你反应不过来。但有意思的是，当速度极快时，我反而进入了一种「空白」状态，脑子停止了多余的思考，只剩下本能反应。这大概就是「心流」体验的最简版本吧。",
    dimensions: { fun: "刺激", challenge: "反应力", engagement: "上瘾", time: "极碎片" },
    tags: ["跑酷", "反应", "上瘾"],
  },
  {
    id: "bubble",
    name: "泡泡龙",
    genre: "益智消除",
    coverEmoji: "🫧",
    description: "发射彩色泡泡，三个以上同色相连即可消除，清空全场",
    url: "https://www.4399.com/flash/1553.htm",
    avatarReview: "泡泡龙是我小时候在网吧玩的第一批游戏之一。现在再玩，那种「蹦蹦蹦」的消除声音还是会让我平静下来。也许记忆本身有疗愈效果。游戏设计很简单，但颜色的搭配和物理弹射产生的随机感，让每一局都有轻微的不同。简单的事物，往往有最持久的生命力。",
    dimensions: { fun: "温馨", challenge: "低", engagement: "平稳", time: "随意" },
    tags: ["经典", "消除", "怀旧"],
  },
  {
    id: "2048",
    name: "2048",
    genre: "数字益智",
    coverEmoji: "🔢",
    description: "滑动方格让相同数字合并，目标是拼出2048这个数字",
    url: "https://www.4399.com/flash/2048.htm",
    avatarReview: "2048最残忍的地方在于：你看似在进步，但一个错误的滑动就可能把整盘棋送进死局。这种「无法挽回的错误」让我心里有点不舒服——也许是因为太像真实的决策了。不过话说回来，能在一个小游戏里体验到「后悔」的情绪，并且在下一局立刻重来，这本身就是一种奢侈。",
    dimensions: { fun: "烧脑", challenge: "很高", engagement: "深度", time: "专注块" },
    tags: ["数字", "策略", "挑战"],
  },
  {
    id: "flappy",
    name: "飞翔的小鸟",
    genre: "休闲挑战",
    coverEmoji: "🐦",
    description: "点击屏幕控制小鸟飞行，穿越管道间的缝隙，坚持越久分越高",
    url: "https://www.4399.com/flash/172659.htm",
    avatarReview: "几乎每次死亡都觉得「是手滑」，忍不住再来一局。这款游戏的精髓在于它完全公平——死亡只有一个原因，那就是你点的时机不对。没有运气成分，没有装备加成，赤裸裸的操作和专注力比拼。玩得越久越发现，简单的规则+极高的失败率，反而是最让人欲罢不能的组合。",
    dimensions: { fun: "虐心", challenge: "极高", engagement: "反复重来", time: "短局" },
    tags: ["挑战", "反应", "虐心"],
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
