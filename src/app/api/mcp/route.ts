import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateMockFeed } from "@/lib/feedGenerator";

// MCP endpoint for SecondMe Integration
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: { code: -32001, message: "Unauthorized" } }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);

  // Resolve user from token
  const user = await prisma.user.findFirst({
    where: { accessToken },
    include: { avatarProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: { code: -32001, message: "User not found" } }, { status: 401 });
  }

  const body = await request.json();
  const { method, params, id } = body;

  if (method === "tools/list") {
    return NextResponse.json({
      id,
      result: {
        tools: [
          {
            name: "get_daily_feed",
            description: "获取用户分身今日推荐内容，包含6个领域的精选内容和维度评价",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "get_avatar_profile",
            description: "获取用户分身的人格设置信息",
            inputSchema: { type: "object", properties: {} },
          },
          {
            name: "chat_with_avatar",
            description: "与用户的分身对话，分身会以用户的视角和性格回复",
            inputSchema: {
              type: "object",
              properties: {
                message: { type: "string", description: "发送给分身的消息" },
              },
              required: ["message"],
            },
          },
        ],
      },
    });
  }

  if (method === "tools/call") {
    const toolName = params?.name;

    if (toolName === "get_daily_feed") {
      const today = new Date().toISOString().split("T")[0];
      let cached = await prisma.dailyFeed.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      });

      if (!cached) {
        const feed = generateMockFeed(
          {
            avatarName: user.avatarProfile?.avatarName,
            personality: user.avatarProfile?.personality,
            occupation: user.avatarProfile?.occupation,
            goal: user.avatarProfile?.goal,
          },
          today
        );
        cached = await prisma.dailyFeed.create({
          data: { userId: user.id, date: today, content: JSON.stringify(feed) },
        });
      }

      return NextResponse.json({
        id,
        result: { content: [{ type: "text", text: cached.content }] },
      });
    }

    if (toolName === "get_avatar_profile") {
      const profile = user.avatarProfile;
      return NextResponse.json({
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                avatarName: profile?.avatarName,
                personality: profile?.personality,
                occupation: profile?.occupation,
                goal: profile?.goal,
                slogan: profile?.slogan,
                setupDone: profile?.setupDone,
              }),
            },
          ],
        },
      });
    }

    if (toolName === "chat_with_avatar") {
      const message = params?.arguments?.message;
      if (!message) {
        return NextResponse.json({
          id,
          error: { code: -32602, message: "message is required" },
        });
      }

      const avatarName = user.avatarProfile?.avatarName || "分身";
      const reply = `【${avatarName}】收到你的消息："${message}"。作为你的分身，我会以你的视角思考和回应。这是一个值得深入探索的问题。`;

      return NextResponse.json({
        id,
        result: { content: [{ type: "text", text: reply }] },
      });
    }

    return NextResponse.json({
      id,
      error: { code: -32601, message: "Method not found" },
    });
  }

  return NextResponse.json({
    id,
    error: { code: -32600, message: "Invalid Request" },
  });
}
