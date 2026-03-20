import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export interface GameRecommendation {
  id: string;
  name: string;
  nameEn: string;
  genre: string[];
  platform: string;
  coverEmoji: string;
  shortDesc: string;
  detailDesc: string;
  whyForYou: string; // 根据分身人设生成的推荐理由
  matchTags: string[]; // 匹配到的人设关键词
  links: {
    steam?: string;
    gamersky: string; // 游民星空搜索
    threeDm: string;  // 3DM搜索
  };
  tags: string[];
}

// 所有候选大型3D游戏库
const GAME_POOL: Array<Omit<GameRecommendation, "whyForYou" | "matchTags"> & {
  matchKeywords: string[]; // 命中这些关键词时推荐
  template: (profile: AvatarProfile) => string; // 个性化推荐理由生成
}> = [
  {
    id: "black-myth",
    name: "黑神话：悟空",
    nameEn: "Black Myth: Wukong",
    genre: ["动作RPG", "神话", "国产精品"],
    platform: "PC / PS5",
    coverEmoji: "🐒",
    shortDesc: "首款国产3A大作，改编自《西游记》，斗战胜佛的前传故事",
    detailDesc: `《黑神话：悟空》是由游戏科学开发的动作角色扮演游戏，2024年8月发售后迅速成为Steam历史上同时在线人数最高的单机游戏之一。

游戏以中国古典神话《西游记》为世界观背景，玩家扮演一位「天命人」，踏上寻找六根之物的征途。整个游戏共分六回，每一回都以全新的地域和Boss为核心，场景从山西的古寺禅院到热带的阴森密林，视觉风格极具中国美学特色。

战斗系统深度而不失流畅：变身技能（「法天象地」「六根」形态）、棍法招式与魔法咒语可以自由组合，面对不同Boss需要设计截然不同的应对策略。每一场Boss战几乎都是一次独立的叙事体验——你会在战斗中理解这个角色为何变成了怪物。

这不只是一款游戏，更是中国文化输出的一个里程碑时刻。`,
    matchKeywords: ["文化", "哲学", "艺术", "创意", "设计", "中国", "传统", "故事", "叙事", "国学", "美学"],
    template: (p) => `以${p.personality || "对事物有深度思考"}的你来说，《黑神话》的叙事层次会让你着迷——每一个妖怪都是一段人性的寓言，而不只是需要击败的障碍。${p.occupation ? `作为${p.occupation}，` : ""}你会在这个游戏里看到中国文化被以一种前所未有的方式重新诠释，这件事本身就值得亲历。`,
    links: {
      steam: "https://store.steampowered.com/app/2358720/",
      gamersky: "https://www.gamersky.com/search/黑神话悟空/",
      threeDm: "https://www.3dmgame.com/search/黑神话悟空/",
    },
    tags: ["国产3A", "神话", "动作", "Boss战", "必玩"],
  },
  {
    id: "elden-ring",
    name: "艾尔登法环",
    nameEn: "Elden Ring",
    genre: ["魂类动作", "开放世界", "黑暗奇幻"],
    platform: "PC / PS5 / Xbox",
    coverEmoji: "⚔️",
    shortDesc: "宫崎英高 × 乔治·马丁打造，魂类游戏史上最高评分作品",
    detailDesc: `《艾尔登法环》由FromSoftware与《权力的游戏》原著作者乔治·R·R·马丁联合打造，2022年发售后斩获众多年度游戏大奖，Metacritic评分高达96分。

游戏发生在「交界地」这片广袤的开放世界中，玩家扮演「褪色者」，寻找艾尔登法环的碎片以成为新王。地图设计是游戏史上公认最精妙的之一：每一片新区域的解锁都是对玩家探索精神的奖励，地下城、古遗址、隐藏BOSS遍布各处，等待发现。

战斗系统继承了魂系一贯的高难度与高成就感：精准的翻滚时机、武器的战技系统、元素属性搭配，每一次击败强大Boss都是真实的成就。游戏没有手把手的引导，所有的规律和技巧都等待玩家自己摸索——这正是它的魅力所在。

世界观叙事方式极其独特：几乎没有直接的剧情说明，所有故事藏在道具描述、NPC只言片语和场景细节里，等待好奇心旺盛的人去拼凑。`,
    matchKeywords: ["挑战", "坚持", "成长", "探索", "逻辑", "分析", "研究", "不确定", "独立", "自主"],
    template: (p) => `《艾尔登法环》是一款专门为${p.personality?.includes("挑战") || p.personality?.includes("坚持") ? "享受挑战过程" : "愿意在挫败中成长"}的人设计的游戏。${p.goal ? `你的目标是「${p.goal}」` : ""}——在这个游戏里，每一次死亡都是一次数据，每一次重试都是一次迭代。这种思维方式，会让你比大多数玩家更快找到攻略Boss的规律。`,
    links: {
      steam: "https://store.steampowered.com/app/1245620/",
      gamersky: "https://www.gamersky.com/search/艾尔登法环/",
      threeDm: "https://www.3dmgame.com/search/艾尔登法环/",
    },
    tags: ["魂类", "高难度", "开放世界", "年度游戏", "史诗"],
  },
  {
    id: "cyberpunk",
    name: "赛博朋克 2077",
    nameEn: "Cyberpunk 2077",
    genre: ["开放世界RPG", "科幻", "动作"],
    platform: "PC / PS5 / Xbox",
    coverEmoji: "🤖",
    shortDesc: "近未来夜之城，在霓虹与阴暗之间寻找真正的自由",
    detailDesc: `《赛博朋克2077》由波兰工作室CD Projekt Red开发，以桌游IP为基础打造的开放世界RPG。经过多次更新和2.0版本大改后，现已成为近年来口碑最高的开放世界游戏之一。

故事发生在2077年的夜之城——一个企业权力凌驾于政府之上的反乌托邦大都会。玩家扮演雇佣兵「V」，因意外将传奇摇滚明星强尼·银手的数字残魂植入脑中，被迫展开一段寻找解法的旅程。游戏拥有多条主线分支，不同的选择会导向截然不同的结局，且每一个结局都充满情感重量。

游戏世界的细节密度令人叹为观止：街道上每个NPC都有自己的日程，广告牌的文字充满讽刺意味，夜之城的每一个角落都在讲述这个世界的故事。2.0版本更新后的技能树系统极其丰富，可以打造黑客流、刀客流、枪手流等完全不同的游玩风格。

《幻影自由》DLC被认为是近年最好的游戏叙事之一，与主线共同构成了一个关于「什么是自由」的深度思考。`,
    matchKeywords: ["技术", "程序", "AI", "科技", "未来", "互联网", "创业", "产品", "系统", "数字", "自由"],
    template: (p) => `${p.occupation ? `作为${p.occupation}，` : ""}你每天面对的那些关于技术与人性边界的问题，《赛博朋克》用一个极致的反乌托邦世界给出了一种答案。游戏里的「义体改造」和「数字意识」，不只是科幻设定——它们是对当下技术发展方向最尖锐的提问。${p.personality?.includes("思考") ? "以你思考型的性格，" : ""}游戏的多结局设计会让你愿意反复体验不同的选择。`,
    links: {
      steam: "https://store.steampowered.com/app/1091500/",
      gamersky: "https://www.gamersky.com/search/赛博朋克2077/",
      threeDm: "https://www.3dmgame.com/search/赛博朋克2077/",
    },
    tags: ["科幻", "开放世界", "赛博朋克", "多结局", "神作"],
  },
  {
    id: "baldurs-gate-3",
    name: "博德之门 3",
    nameEn: "Baldur's Gate 3",
    genre: ["回合制RPG", "奇幻", "策略"],
    platform: "PC / PS5",
    coverEmoji: "🎲",
    shortDesc: "史上最佳RPG之一，每一个选择都真实影响世界走向",
    detailDesc: `《博德之门3》由Larian Studios开发，基于《龙与地下城》5版规则，2023年发售后横扫几乎所有年度游戏奖项，被IGN、Metacritic等主流媒体评为史上最佳RPG之一。

游戏共有12个可选种族、12个职业及大量子职业，角色创建系统的深度极高。故事发生在被心灵杀手蝌蚪寄生后，五位同样受感染的角色被迫同行，共同寻找治愈方法。然而随着剧情深入，这只是一个更宏大阴谋的表面。

游戏最令人惊叹的是其选择的真实性：你几乎可以用任何方式解决任何问题——战斗、谈判、偷窃、魔法欺骗、甚至让NPC互相内斗。主要角色的支线故事深度接近完整的独立游戏，每个同伴都有完整的价值观和心理弧线。

四人联机模式让你可以和朋友共同经历这段史诗冒险，不同玩家的选择可能在同一局游戏里造成完全对立的后果，极大增加了重复可玩性。`,
    matchKeywords: ["策略", "选择", "团队", "管理", "决策", "逻辑", "规划", "创业", "社交", "关系", "协作"],
    template: (p) => `《博德之门3》最契合${p.personality || "注重思考与决策"}的人——游戏里的每一个选择都有真实的后果，没有所谓的「正确答案」，只有「你是谁」的答案。${p.goal ? `你的目标「${p.goal}」` : "做有价值的事"}这种追求，会在游戏里以一种意想不到的方式得到共鸣。`,
    links: {
      steam: "https://store.steampowered.com/app/1086940/",
      gamersky: "https://www.gamersky.com/search/博德之门3/",
      threeDm: "https://www.3dmgame.com/search/博德之门3/",
    },
    tags: ["RPG神作", "策略", "龙与地下城", "年度游戏", "多人联机"],
  },
  {
    id: "rdr2",
    name: "荒野大镖客：救赎 2",
    nameEn: "Red Dead Redemption 2",
    genre: ["开放世界", "西部", "叙事"],
    platform: "PC / PS4 / Xbox",
    coverEmoji: "🤠",
    shortDesc: "史上叙事最丰富的开放世界，关于一个时代的末日与人性的重量",
    detailDesc: `《荒野大镖客：救赎2》由Rockstar Games开发，2018年发售，被众多玩家和媒体誉为「史上最好的开放世界游戏」，也是叙事层面几乎无可超越的标杆。

故事发生在1899年美国西部开发的尾声，玩家扮演荒野骑士Arthur Morgan，跟随范德林德匪帮经历最后的岁月。这是一部关于忠诚、背叛、救赎与时代终结的史诗——当「西部时代」已经走向终结，那些生活在其中的人该何去何从？

游戏的细节真实度令人窒息：马匹会因长时间骑行而疲惫，武器需要定期清洁，角色会根据你的行为产生胡须生长，NPC会记住你上次见面时的行为……这一切共同构成了一个真正活着的世界。

Arthur Morgan是游戏史上塑造最完整的主角之一。随着剧情的推进，你会越来越难区分「我在玩游戏」和「我在经历一段真实的人生」。很多玩家在结局时落泪，不是因为剧情的套路，而是因为那种「失去了一个真实的朋友」的感觉。`,
    matchKeywords: ["故事", "叙事", "人文", "情感", "历史", "写作", "文学", "哲学", "慢", "体验", "旅行"],
    template: (p) => `如果你喜欢${p.personality?.includes("阅读") || p.personality?.includes("文学") ? "深度阅读和叙事" : "慢下来感受某种体验"}，《荒野大镖客2》是那种能让你忘记时间的游戏。Arthur Morgan的故事不是一个英雄主义的故事，而是一个关于「如何在不完美的处境里做一个好人」的故事。${p.slogan ? `你的slogan「${p.slogan}」和这个游戏的主题有某种奇妙的契合。` : ""}`,
    links: {
      steam: "https://store.steampowered.com/app/1174180/",
      gamersky: "https://www.gamersky.com/search/荒野大镖客2/",
      threeDm: "https://www.3dmgame.com/search/荒野大镖客2/",
    },
    tags: ["叙事神作", "西部", "开放世界", "情感", "必玩"],
  },
  {
    id: "god-of-war",
    name: "战神：诸神黄昏",
    nameEn: "God of War: Ragnarök",
    genre: ["动作冒险", "北欧神话", "叙事"],
    platform: "PC / PS5 / PS4",
    coverEmoji: "⚡",
    shortDesc: "父子情与北欧末日，动作与叙事完美融合的当代神话",
    detailDesc: `《战神：诸神黄昏》是索尼圣莫妮卡工作室2022年的作品，是《战神（2018）》的直接续作，延续了父子两人奎托斯与阿特柔斯穿越九界的旅程。

游戏将宏大的北欧末日神话故事与细腻的父子情感完美融合。阿特柔斯已经长大，开始质疑父亲的决定，追寻自己的命运；而奎托斯则在保护儿子与让他成长之间艰难权衡。这段关系的真实性是游戏最打动人心的核心。

战斗系统在前作基础上大幅扩展：奎托斯的利维坦之斧与灵魂撕裂者双斧可以自由切换，结合阿特柔斯的弓箭支援，战斗场面既爽快又充满策略性。游戏中有13个神话角色（包括多个主神）都有饱满的性格刻画，不是单纯的Boss，而是有着各自悲剧的存在。

视觉效果达到了PS5时代的顶尖水平，尤其是九界各地截然不同的环境设计，从极寒的冰雪神域到熔岩翻涌的火焰国度，每一处都是精心设计的视觉盛宴。`,
    matchKeywords: ["家庭", "父母", "成长", "关系", "目标", "挑战", "责任", "坚持", "情感", "亲情"],
    template: (p) => `《战神》最核心的主题是「如何成为更好的人」——奎托斯在用整个神话世界的冒险，学习成为一个更好的父亲。${p.story ? `你的经历里有「${p.story.slice(0, 20)}...」这样的故事，` : ""}这种关于「改变自己」的主题，会在游戏里找到非常直接的共鸣。`,
    links: {
      steam: "https://store.steampowered.com/app/2322010/",
      gamersky: "https://www.gamersky.com/search/战神诸神黄昏/",
      threeDm: "https://www.3dmgame.com/search/战神诸神黄昏/",
    },
    tags: ["动作", "北欧神话", "父子情", "叙事", "PS精品"],
  },
  {
    id: "witcher3",
    name: "巫师 3：狂猎",
    nameEn: "The Witcher 3: Wild Hunt",
    genre: ["开放世界RPG", "奇幻", "道德抉择"],
    platform: "PC / PS5 / Xbox / Switch",
    coverEmoji: "🐺",
    shortDesc: "道德灰色地带的最佳诠释，每个决定都没有绝对的对与错",
    detailDesc: `《巫师3：狂猎》由波兰CD Projekt Red开发，2015年发售至今仍在各类「史上最佳游戏」榜单上稳居前列，2022年的次世代版本更新后视觉效果进一步提升。

游戏基于波兰作家安德烈·萨普科夫斯基的系列小说，玩家扮演猎魔人杰洛特，在一个满目疮痍的北方大陆上寻找养女希里。世界观极其丰富：精灵、矮人等种族受到歧视，人类内部也充斥着政治阴谋，没有任何一方是绝对的「正义」。

游戏最被称道的是其道德系统的复杂性：几乎每一个重要任务都没有明确的「好选择」和「坏选择」，只有不同的权衡取舍。你以为自己在做好事，几个小时后可能会发现那个选择带来了意想不到的恶果——这种设计极其真实地还原了现实中决策的困境。

两个DLC（《血与酒》《石之心》）的质量不亚于很多完整游戏，尤其是《血与酒》构建的托森特公国，是游戏史上最美的游戏地图之一。`,
    matchKeywords: ["哲学", "伦理", "道德", "文学", "思考", "复杂", "灰色", "社会", "人性", "研究", "分析"],
    template: (p) => `《巫师3》是最适合${p.personality?.includes("思考") || p.personality?.includes("哲学") ? "有哲学思考倾向" : "喜欢深度叙事"}的人的游戏。它不问「你是英雄还是坏人」，它问「在没有完美答案的世界里，你如何做决定？」——这个问题，${p.occupation ? `在${p.occupation}的工作里` : "在现实里"}你大概也经常面对。`,
    links: {
      steam: "https://store.steampowered.com/app/292030/",
      gamersky: "https://www.gamersky.com/search/巫师3/",
      threeDm: "https://www.3dmgame.com/search/巫师3/",
    },
    tags: ["RPG经典", "道德选择", "开放世界", "叙事", "奇幻"],
  },
  {
    id: "death-stranding",
    name: "死亡搁浅",
    nameEn: "Death Stranding",
    genre: ["步行模拟", "科幻", "叙事"],
    platform: "PC / PS5 / PS4",
    coverEmoji: "📦",
    shortDesc: "小岛秀夫的孤独史诗，关于「连接」的最独特游戏体验",
    detailDesc: `《死亡搁浅》是传奇游戏设计师小岛秀夫离开科纳米后的第一部作品，2019年发售，以其极其独特的游戏设计和深刻的主题分裂了玩家群体——有人称它「最无聊的游戏」，有人称它「改变了我看世界的方式」。

游戏发生在「死亡搁浅」事件后已经崩溃的美国，玩家扮演快递员Sam Porter Bridges，徒步穿越荒凉大地，将物资送到孤立的各个城市。听起来简单，实则充满深意。

游戏的核心机制是「隐性联机」：你在游戏里建造的桥梁、搭设的梯子，会出现在其他玩家的游戏世界里；其他玩家遗留的物资，也可能在你最艰难的时刻出现。整个游戏在构建一个关于「孤独个体如何构成社会连接」的隐喻。

小岛秀夫的叙事方式一如既往地大胆：慢节奏、充满哲学讨论、不解释一切。但随着故事推进，所有碎片拼成一个关于「生命、死亡、失去与联结」的完整哲学论述。Norman Reedus等好莱坞演员的动作捕捉表演也是顶尖水准。`,
    matchKeywords: ["孤独", "连接", "艺术", "设计", "哲学", "独立", "慢", "创意", "文艺", "内向"],
    template: (p) => `如果你对「孤独」和「连接」这两个命题感兴趣，《死亡搁浅》是少数真正在用游戏机制本身来探讨这个主题的作品。${p.personality ? `以${p.personality}的你来说，` : ""}这个游戏可能会让你走路的时候想很多，睡前还在回味。它不是一款让你爽的游戏，而是一款让你思考的游戏。`,
    links: {
      steam: "https://store.steampowered.com/app/1190460/",
      gamersky: "https://www.gamersky.com/search/死亡搁浅/",
      threeDm: "https://www.3dmgame.com/search/死亡搁浅/",
    },
    tags: ["小岛秀夫", "哲学游戏", "步行模拟", "叙事", "独特体验"],
  },
];

interface AvatarProfile {
  avatarName?: string | null;
  personality?: string | null;
  occupation?: string | null;
  goal?: string | null;
  story?: string | null;
  slogan?: string | null;
}

function scoreGame(game: typeof GAME_POOL[0], profile: AvatarProfile): number {
  const text = [profile.personality, profile.occupation, profile.goal, profile.story, profile.slogan]
    .filter(Boolean)
    .join(" ");
  let score = 0;
  for (const kw of game.matchKeywords) {
    if (text.includes(kw)) score += 1;
  }
  return score;
}

function selectGames(profile: AvatarProfile, count = 4): GameRecommendation[] {
  const scored = GAME_POOL
    .map((g) => ({ ...g, score: scoreGame(g, profile) }))
    .sort((a, b) => b.score - a.score);

  // 取最匹配的，若多个并列则取前 count 个（保证多样性：不全部同类型）
  const selected: typeof scored = [];
  const usedGenres = new Set<string>();
  for (const g of scored) {
    if (selected.length >= count) break;
    const primaryGenre = g.genre[0];
    if (!usedGenres.has(primaryGenre) || selected.length < 2) {
      selected.push(g);
      usedGenres.add(primaryGenre);
    }
  }
  // 如果还不够，补充剩余的
  for (const g of scored) {
    if (selected.length >= count) break;
    if (!selected.find((s) => s.id === g.id)) selected.push(g);
  }

  return selected.map((g) => ({
    id: g.id,
    name: g.name,
    nameEn: g.nameEn,
    genre: g.genre,
    platform: g.platform,
    coverEmoji: g.coverEmoji,
    shortDesc: g.shortDesc,
    detailDesc: g.detailDesc,
    whyForYou: g.template(profile),
    matchTags: g.matchKeywords.filter((kw) =>
      [profile.personality, profile.occupation, profile.goal, profile.story, profile.slogan]
        .filter(Boolean).join(" ").includes(kw)
    ).slice(0, 3),
    links: g.links,
    tags: g.tags,
  }));
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarProfile: true },
  });

  const profile: AvatarProfile = {
    avatarName: user?.avatarProfile?.avatarName,
    personality: user?.avatarProfile?.personality,
    occupation: user?.avatarProfile?.occupation,
    goal: user?.avatarProfile?.goal,
    story: user?.avatarProfile?.story,
    slogan: user?.avatarProfile?.slogan,
  };

  const recommendations = selectGames(profile, 4);

  return NextResponse.json({ recommendations, avatarName: profile.avatarName || "我的分身" });
}
