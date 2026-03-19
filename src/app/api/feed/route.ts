import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateMockFeed } from "@/lib/feedGenerator";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  // Check cache
  const cached = await prisma.dailyFeed.findUnique({
    where: { userId_date: { userId: session.userId, date: today } },
  });

  if (cached) {
    return NextResponse.json({ feed: JSON.parse(cached.content) });
  }

  // Generate feed
  const profile = await prisma.avatarProfile.findUnique({
    where: { userId: session.userId },
  });

  const feed = generateMockFeed(
    {
      avatarName: profile?.avatarName,
      personality: profile?.personality,
      occupation: profile?.occupation,
      goal: profile?.goal,
    },
    today
  );

  await prisma.dailyFeed.create({
    data: {
      userId: session.userId,
      date: today,
      content: JSON.stringify(feed),
    },
  });

  return NextResponse.json({ feed });
}
