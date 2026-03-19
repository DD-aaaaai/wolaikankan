import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await request.json();
  if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { avatarProfile: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const profile = user.avatarProfile;
  const avatarName = profile?.avatarName || "分身";

  // Build avatar persona context
  const persona = [
    `你是用户的AI分身，名叫「${avatarName}」。`,
    profile?.personality && `你的性格：${profile.personality}。`,
    profile?.occupation && `用户的职业：${profile.occupation}。`,
    profile?.goal && `用户的目标：${profile.goal}。`,
    `你深度理解用户的偏好，能以用户的视角思考和表达。`,
    `你的风格：哲学、深沉、禅意，说话有深度但不晦涩。`,
    `当用户对某条内容不满意时，记录下来并给出替代推荐。`,
    `当用户喜欢某内容时，表达共鸣并适当延伸相关推荐。`,
  ]
    .filter(Boolean)
    .join(" ");

  // Call SecondMe chat API
  try {
    const res = await fetch(
      `${process.env.SECONDME_API_BASE_URL}/api/secondme/chat`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: persona },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const json = await res.json();
    if (json.code === 0 && json.data?.content) {
      return NextResponse.json({ reply: json.data.content, avatarName });
    }
  } catch {
    // fallback below
  }

  // Fallback: local avatar response
  const fallbackReply = generateLocalReply(message, avatarName, profile);
  return NextResponse.json({ reply: fallbackReply, avatarName });
}

function generateLocalReply(
  message: string,
  avatarName: string,
  profile: { personality?: string | null; goal?: string | null } | null
): string {
  const lower = message.toLowerCase();

  if (lower.includes("不喜欢") || lower.includes("不满意") || lower.includes("换一个")) {
    return `我听到了。那条内容确实可能不太适合你现在的状态。让我重新找一个——有时候，真正适合的东西需要多次筛选才能遇见。我会记住你的这个偏好。`;
  }

  if (lower.includes("喜欢") || lower.includes("很好") || lower.includes("不错")) {
    return `很高兴你喜欢。这说明我们的频率越来越对了。我会在这个方向上持续留意，为你带来更多类似的内容。`;
  }

  if (lower.includes("为什么") || lower.includes("推荐这个")) {
    return `因为这与你的性格和当下的状态很契合。有时候，一个内容之所以被推荐，不只是因为它"好"，而是因为它"适合你"——这是两件不同的事。`;
  }

  return `我在思考你说的话。${profile?.goal ? `关于你「${profile.goal}」这个目标，` : ""}这或许是值得深入探索的一个方向。你觉得呢？`;
}
