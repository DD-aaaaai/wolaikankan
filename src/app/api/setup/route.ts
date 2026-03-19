import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { insertKeyMemory } from "@/lib/secondme";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { avatarName, personality, occupation, goal, story, slogan } = body;

  const profile = await prisma.avatarProfile.upsert({
    where: { userId: session.userId },
    update: { avatarName, personality, occupation, goal, story, slogan, setupDone: true },
    create: {
      userId: session.userId,
      avatarName,
      personality,
      occupation,
      goal,
      story,
      slogan,
      setupDone: true,
    },
  });

  // Sync to SecondMe Key Memory
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (user?.accessToken) {
    const memoryContent = [
      avatarName && `我的分身名叫「${avatarName}」`,
      personality && `我的性格是：${personality}`,
      occupation && `我的职业是：${occupation}`,
      goal && `我的目标是：${goal}`,
      slogan && `我的Slogan：${slogan}`,
    ]
      .filter(Boolean)
      .join("。");

    if (memoryContent) {
      await insertKeyMemory(user.accessToken, memoryContent).catch(() => null);
    }
  }

  return NextResponse.json({ ok: true, profile });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.avatarProfile.findUnique({
    where: { userId: session.userId },
  });

  return NextResponse.json({ profile });
}
