import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { discoverUsers } from "@/lib/secondme";

const DEMO_AVATARS = [
  { username: "深夜书虫", title: "用阅读丈量人生", hook: "每本书都是一扇窗，我在里面看见另一种活法", briefIntroduction: "编辑，每年读100本书，相信文字是最慢但最深的连接方式", route: null, matchScore: 0.92 },
  { username: "产品人小林", title: "在混沌中找秩序", hook: "好产品是对人性的深刻理解，而不是对需求的精准满足", briefIntroduction: "互联网产品经理，关注AI与人类协作的边界，业余冥想爱好者", route: null, matchScore: 0.88 },
  { username: "哲学系流浪汉", title: "思考作为一种生活方式", hook: "苦难不是通往意义的必经之路，但接受苦难是", briefIntroduction: "高校讲师，研究存在主义与东方哲学的交叉地带，喜欢长距离骑行", route: null, matchScore: 0.85 },
  { username: "独立设计师阿九", title: "美是一种立场", hook: "我不设计产品，我设计人与世界相遇的方式", briefIntroduction: "自由设计师，在大理工作，关注可持续设计与本土文化的融合", route: null, matchScore: 0.83 },
  { username: "研究员芸芸", title: "数据里的人性温度", hook: "每一个统计数字背后，都是一个真实的人的选择", briefIntroduction: "社会学研究者，用定性方法研究数字时代的孤独感，猫奴", route: null, matchScore: 0.81 },
  { username: "创业者老王", title: "失败是最昂贵的学费", hook: "做过三家公司，关门两家，还是觉得创业是最好的修行", briefIntroduction: "连续创业者，现在专注消费品牌，相信长期主义是唯一的商业哲学", route: null, matchScore: 0.79 },
  { username: "全职妈妈Lisa", title: "育儿是一场关于自我的旅程", hook: "孩子是镜子，你在他们眼里看见的，都是你自己", briefIntroduction: "前咨询顾问，现在全职带娃，用写作记录这段被低估的岁月", route: null, matchScore: 0.77 },
  { username: "建筑师大明", title: "空间是凝固的时间", hook: "好的建筑不是被看见的，而是被感受到的", briefIntroduction: "建筑师，关注城市更新与社区营造，业余做木工，喜欢一切有质感的东西", route: null, matchScore: 0.75 },
  { username: "音乐人小K", title: "声音是最诚实的语言", hook: "当语言失效的时候，音乐还在", briefIntroduction: "独立音乐人，在上海做livehouse，写歌关于城市里的孤独与相遇", route: null, matchScore: 0.73 },
  { username: "农场主阿土", title: "回到土地，回到自己", hook: "城市给了我视野，土地给了我根", briefIntroduction: "从互联网转行做有机农业，在云南租了30亩地，分享真实的乡村生活", route: null, matchScore: 0.71 },
];

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarProfile: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Build self card
  const selfCard = {
    username: user.avatarProfile?.avatarName || user.name || "我的分身",
    title: user.avatarProfile?.slogan || "这是我的分身",
    hook: user.avatarProfile?.personality || "正在探索中...",
    briefIntroduction: [user.avatarProfile?.occupation, user.avatarProfile?.goal].filter(Boolean).join("，") || "分身设置进行中",
    route: null,
    matchScore: 1,
    isSelf: true,
  };

  // Try to fetch real discover users
  let discoverList: typeof DEMO_AVATARS = [];
  try {
    const data = await discoverUsers(user.accessToken);
    const rawList = data?.list || data?.items || [];
    if (rawList.length > 0) discoverList = rawList;
  } catch {
    // fallback to demo
  }

  const finalList = discoverList.length > 0 ? discoverList : DEMO_AVATARS;

  return NextResponse.json({
    self: selfCard,
    users: finalList,
  });
}
